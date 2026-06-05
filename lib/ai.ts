/**
 * lib/ai.ts — user-aware AI router.
 *
 * Each callAI(prompt, { userId }) builds a per-call provider chain:
 *   1. User's own keys for routable providers   (no credit cost)
 *   2. PROJECT pool keys from env               (1 credit per success)
 *
 * If the user has neither a key NOR credits, the call is blocked with a clear
 * "Add a key in Settings or upgrade" error (HTTP 402). Credits are only
 * decremented after a SUCCESSFUL call via a project provider, so failed
 * attempts never waste a credit.
 *
 * Backwards compatible: calling callAI(prompt) without a userId uses the
 * project chain only (legacy behaviour).
 */

import OpenAI from 'openai'
import {
  Provider, getUserApiKey, listUserApiKeys, touchUserApiKey,
} from './userKeys'
import { getFreeCreditsRemaining, consumeFreeCredits } from './credits'

// ─── Provider catalog ────────────────────────────────────────────────────────

interface ProviderSpec {
  id: string
  name: string
  apiKey: string
  baseURL: string
  models: string[]
  source: 'user' | 'project'
}

const PROVIDER_DEFAULTS: Record<string, {
  name: string; baseURL: string; models: string[]; keyEnvs: string[]
}> = {
  google: {
    name: 'Google Gemini',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    models: ['gemini-2.0-flash-lite', 'gemini-2.0-flash'],
    keyEnvs: ['GOOGLE_API_KEY', 'GEMINI_API_KEY'],
  },
  groq: {
    name: 'Groq',
    baseURL: 'https://api.groq.com/openai/v1',
    models: ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile'],
    keyEnvs: ['GROQ_API_KEY'],
  },
  cerebras: {
    name: 'Cerebras',
    baseURL: 'https://api.cerebras.ai/v1',
    models: ['llama3.1-8b', 'llama-3.3-70b'],
    keyEnvs: ['CEREBRAS_API_KEY'],
  },
  deepseek: {
    name: 'DeepSeek',
    baseURL: 'https://api.deepseek.com',
    models: ['deepseek-chat'],
    keyEnvs: ['DEEPSEEK_API_KEY'],
  },
  openai: {
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    models: ['gpt-4o-mini'],
    keyEnvs: ['OPENAI_API_KEY'],
  },
}

// Anthropic keys are stored & testable, but routed by the chat assistant
// (PR #19, separate SDK) — they don't share the OpenAI-compatible chain here.
const ROUTABLE_PROVIDERS: Provider[] = ['google', 'openai', 'groq', 'cerebras', 'deepseek']

function resolveKey(keyEnvs: string[]): string | undefined {
  for (const k of keyEnvs) {
    const v = process.env[k]?.trim()
    if (v) return v
  }
  return undefined
}

// ─── Chain builders ─────────────────────────────────────────────────────────

function buildProjectChain(): ProviderSpec[] {
  const preferred = (process.env.AI_PROVIDER ?? '').trim().toLowerCase()
  const order = [preferred, 'google', 'groq', 'cerebras', 'deepseek', 'openai']
    .filter((v, i, a) => v && a.indexOf(v) === i)

  const chain: ProviderSpec[] = []
  for (const id of order) {
    const def = PROVIDER_DEFAULTS[id]
    if (!def) continue
    const apiKey = resolveKey(def.keyEnvs)
    if (!apiKey) continue

    let models = def.models
    if (id === preferred && process.env.AI_MODEL) {
      const primary = process.env.AI_MODEL.trim()
      const fallbacks = (process.env.AI_FALLBACK_MODELS ?? '')
        .split(',').map(m => m.trim()).filter(Boolean)
      models = Array.from(new Set([primary, ...fallbacks]))
    }
    chain.push({ id, name: def.name, apiKey, baseURL: def.baseURL, models, source: 'project' })
  }
  return chain
}

function buildUserChain(userKeys: Map<Provider, string>): ProviderSpec[] {
  const chain: ProviderSpec[] = []
  for (const id of ROUTABLE_PROVIDERS) {
    const key = userKeys.get(id)
    if (!key) continue
    const def = PROVIDER_DEFAULTS[id]
    if (!def) continue
    chain.push({
      id,
      name: `${def.name} (your key)`,
      apiKey: key,
      baseURL: def.baseURL,
      models: def.models,
      source: 'user',
    })
  }
  return chain
}

const PROJECT_CHAIN = buildProjectChain()

// Cache OpenAI clients per (baseURL+key) so repeat calls don't re-allocate.
const clients = new Map<string, OpenAI>()
function clientFor(p: ProviderSpec): OpenAI {
  const cacheKey = `${p.baseURL}::${p.apiKey}`
  let c = clients.get(cacheKey)
  if (!c) {
    c = new OpenAI({ apiKey: p.apiKey, baseURL: p.baseURL })
    clients.set(cacheKey, c)
  }
  return c
}

export const aiConfig = {
  model: PROJECT_CHAIN[0]?.models[0] ?? 'none',
  providerName: PROJECT_CHAIN[0]?.name ?? 'No project provider configured',
  chain: PROJECT_CHAIN.map(p => p.name),
}

// ─── Core chain runner ──────────────────────────────────────────────────────

interface RunResult { text: string; provider: ProviderSpec }

async function runChain(
  chain: ProviderSpec[],
  prompt: string,
  maxRetries: number,
  maxTokens: number,
): Promise<RunResult> {
  if (chain.length === 0) {
    const e = new Error('No AI provider available.') as Error & { status?: number }
    e.status = 503
    throw e
  }

  let lastError: unknown
  const tried: string[] = []

  for (const provider of chain) {
    tried.push(provider.name)
    const client = clientFor(provider)
    let skipProvider = false

    for (const model of provider.models) {
      if (skipProvider) break

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const res = await client.chat.completions.create(
            {
              model,
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.35,
              max_tokens: maxTokens,
            },
            { timeout: 20000 }
          )
          const out = res.choices[0]?.message?.content?.trim()
          if (out) return { text: out, provider }
          break // empty response — try next model/provider
        } catch (err) {
          lastError = err
          const status = (err as { status?: number })?.status
          if (status === 401 || status === 402 || status === 403 || status === 429) {
            skipProvider = true; break
          }
          if (status === 404) break
          if (attempt < maxRetries - 1) {
            await new Promise(r => setTimeout(r, 800 * (attempt + 1)))
          }
        }
      }
    }
  }

  // Chain exhausted.
  const status = (lastError as { status?: number })?.status
  const msg =
    status === 429 ? `All AI providers are rate-limited (tried: ${tried.join(', ')}). Wait ~60s or add another key in Settings.`
    : status === 402 ? `AI providers ran out of credit/quota (tried: ${tried.join(', ')}). Add a working key in Settings.`
    : `AI request failed across all providers (tried: ${tried.join(', ')}).`
  const e = new Error(msg) as Error & { status?: number }
  e.status = status ?? 500
  throw e
}

// ─── Public API ─────────────────────────────────────────────────────────────

export interface CallAIOpts {
  /** If provided, routes user's own keys first; otherwise uses project pool only. */
  userId?: string
  maxRetries?: number
  maxTokens?: number
}

/**
 * Make an AI call. With a userId, the chain is the user's keys (free)
 * followed by the project pool (1 credit per success).
 */
export async function callAI(prompt: string, opts: CallAIOpts = {}): Promise<string> {
  const maxRetries = opts.maxRetries ?? 2
  const maxTokens = opts.maxTokens ?? 600

  // System / no-user path — project pool only (used by auth-less paths).
  if (!opts.userId) {
    const r = await runChain(PROJECT_CHAIN, prompt, maxRetries, maxTokens)
    return r.text
  }

  // ─── User-aware path ──────────────────────────────────────────────────
  const userId = opts.userId
  const [keysList, credits] = await Promise.all([
    listUserApiKeys(userId),
    getFreeCreditsRemaining(userId),
  ])

  // Decrypt the user's routable keys (server-only).
  const userKeys = new Map<Provider, string>()
  for (const info of keysList) {
    if (!ROUTABLE_PROVIDERS.includes(info.provider)) continue
    const k = await getUserApiKey(userId, info.provider)
    if (k) userKeys.set(info.provider, k)
  }

  const userChain = buildUserChain(userKeys)
  const canUseProject = PROJECT_CHAIN.length > 0 && credits > 0

  if (userChain.length === 0 && !canUseProject) {
    const e = new Error(
      PROJECT_CHAIN.length > 0
        ? `You've used all your free credits. Add your own API key in Settings to keep using the app for free, or upgrade.`
        : 'No AI provider available. Add an API key in Settings.'
    ) as Error & { status?: number }
    e.status = 402
    throw e
  }

  const chain = [...userChain, ...(canUseProject ? PROJECT_CHAIN : [])]
  const { text, provider } = await runChain(chain, prompt, maxRetries, maxTokens)

  // Accounting — only after success.
  if (provider.source === 'project') {
    // Race-safe: returns null if another concurrent call drained the balance.
    // We don't block the user this time; the NEXT call will be blocked at start.
    await consumeFreeCredits(userId, 1).catch(() => null)
  } else if (provider.source === 'user' && ROUTABLE_PROVIDERS.includes(provider.id as Provider)) {
    void touchUserApiKey(userId, provider.id as Provider).catch(() => null)
  }

  return text
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export function stripFences(raw: string): string {
  return raw.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim()
}

/**
 * Run async tasks with bounded concurrency. Avoids hitting per-minute token
 * limits on free-tier AI providers (especially Groq, which throttles by TPM).
 * Default concurrency = 2 — empirically safe for free tiers.
 */
export async function pLimitAll<T>(
  tasks: Array<() => Promise<T>>,
  concurrency = Number(process.env.AI_CONCURRENCY ?? 2),
): Promise<T[]> {
  const results: T[] = new Array(tasks.length)
  let next = 0
  async function worker() {
    while (true) {
      const idx = next++
      if (idx >= tasks.length) return
      results[idx] = await tasks[idx]()
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, worker)
  await Promise.all(workers)
  return results
}
