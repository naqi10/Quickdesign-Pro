/**
 * lib/rateLimit.ts — wallet + abuse protection backed by Upstash Redis.
 *
 * Two guards layered on top of every AI call:
 *  1. Per-user sliding window: 30 calls / minute (default)
 *     → stops one user from spamming.
 *  2. Project-pool daily cap: total project-pool calls bounded per UTC day
 *     → bounds your AI bill even if many users exhaust their 5 free credits.
 *
 * If UPSTASH_REDIS_REST_URL is not set, both guards FAIL OPEN — dev and the
 * first deploy work with zero setup; you add Upstash before serving the public.
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const HAS_UPSTASH = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN

const USER_LIMIT_PER_MIN = Number(process.env.RATE_LIMIT_PER_MIN ?? 30)
const FREE_POOL_DAILY_CAP = Number(process.env.FREE_POOL_DAILY_CAP ?? 10000)

// Build the Redis client + limiter lazily so a missing env doesn't crash imports.
let redis: Redis | null = null
let userLimit: Ratelimit | null = null

function ensureClients(): boolean {
  if (!HAS_UPSTASH) return false
  if (!redis) redis = Redis.fromEnv()
  if (!userLimit) {
    userLimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(USER_LIMIT_PER_MIN, '1 m'),
      analytics: false,
      prefix: 'rl:user',
    })
  }
  return true
}

export interface RateLimitResult {
  allowed: boolean
  retryAfterSec?: number
  reason?: 'user-burst' | 'pool-exhausted'
}

/** Check the per-user sliding window. Fail-open without Upstash. */
export async function rateLimitUser(userId: string): Promise<RateLimitResult> {
  if (!ensureClients() || !userLimit) return { allowed: true }
  try {
    const r = await userLimit.limit(userId)
    if (r.success) return { allowed: true }
    const retryAfterSec = Math.max(1, Math.ceil((r.reset - Date.now()) / 1000))
    return { allowed: false, retryAfterSec, reason: 'user-burst' }
  } catch (err) {
    console.warn('rateLimitUser failed open:', err)
    return { allowed: true }
  }
}

function todayKey(): string {
  return `pool:${new Date().toISOString().slice(0, 10)}` // pool:2026-04-28
}

/**
 * Check whether the project pool still has daily budget BEFORE attempting a
 * project-pool AI call. Returns false → callers should treat the pool as
 * unavailable (use user keys only, or block with 402).
 *
 * Read-only — does NOT consume budget. Call `recordPoolUse()` after a
 * successful project-pool call to actually charge against the cap.
 */
export async function isProjectPoolAvailable(): Promise<boolean> {
  if (!ensureClients() || !redis) return true
  try {
    const used = await redis.get<number>(todayKey())
    return (used ?? 0) < FREE_POOL_DAILY_CAP
  } catch (err) {
    console.warn('isProjectPoolAvailable failed open:', err)
    return true
  }
}

/** Increment the daily counter. Idempotent-safe to call after success. */
export async function recordPoolUse(): Promise<void> {
  if (!ensureClients() || !redis) return
  try {
    const key = todayKey()
    const count = await redis.incr(key)
    if (count === 1) {
      // First write of the day — expire ~25h to comfortably outlive the date.
      await redis.expire(key, 90_000)
    }
  } catch (err) {
    console.warn('recordPoolUse failed open:', err)
  }
}
