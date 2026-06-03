import { prisma } from './prisma'

/**
 * lib/credits.ts — free-credit accounting.
 *
 * A "free credit" is consumed when a user makes an AI call against the
 * PROJECT's API pool (i.e. they have NO personal key for that provider).
 * Users with their own key spend their own balance — no credits debited.
 *
 * Default starting balance is 5 (set in the Prisma schema). When the balance
 * hits 0, the caller is blocked and prompted to add a personal key or upgrade.
 */

export async function getFreeCreditsRemaining(userId: string): Promise<number> {
  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: { freeCreditsRemaining: true },
  })
  return row?.freeCreditsRemaining ?? 0
}

/**
 * Atomically decrement free credits IFF the user still has at least `cost`.
 * Returns the new remaining balance, or null if blocked (no credits left).
 *
 * Uses Prisma's `updateMany` so the WHERE clause + decrement run as one
 * SQL UPDATE — race-safe under concurrent AI calls.
 */
export async function consumeFreeCredits(userId: string, cost = 1): Promise<number | null> {
  if (cost <= 0) return getFreeCreditsRemaining(userId)
  const result = await prisma.user.updateMany({
    where: { id: userId, freeCreditsRemaining: { gte: cost } },
    data:  { freeCreditsRemaining: { decrement: cost } },
  })
  if (result.count === 0) return null
  return getFreeCreditsRemaining(userId)
}

/** Admin / promo: top up a user's free balance. */
export async function grantFreeCredits(userId: string, amount: number): Promise<number> {
  if (amount <= 0) return getFreeCreditsRemaining(userId)
  await prisma.user.update({
    where: { id: userId },
    data:  { freeCreditsRemaining: { increment: amount } },
  })
  return getFreeCreditsRemaining(userId)
}
