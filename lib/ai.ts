/**
 * lib/ai.ts — multi-provider AI client with automatic fallback.
 *
 * Builds a chain of every provider that has an API key configured, ordered
 * with AI_PROVIDER first. callAI tries them in order: if one rate-limits (429)
 * or has a bad key, it transparently moves to the next provider. This means
 * you can keep several free-tier keys (Gemini + Groq + Cerebras) and basically
 * never hit a wall during testing.
 *
 * All providers are used through their OpenAI-compatible endpoints.
 */

import OpenAI from 'openai'

interface ProviderSpec {
  id: string
  name: string
  apiKey: string
  baseURL: string
  models: string[]
}

// Per-provider defaults. keyEnvs = env var names checked for an API key.
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

function resolveKey(keyEnvs: string[]): string | undefined {
  for (const k of keyEnvs) {
    const v = process.env[k]?.trim()
    if (v) return v
  }
  return undefined
}

// Build the ordered provider chain from whatever keys are present.
function buildChain(): ProviderSpec[] {
  const preferred = (process.env.AI_PROVIDER ?? '').trim().toLowerCase()
  // Preferred first, then a sensible default fallback order. Dedupe + drop empty.
  const order = [preferred, 'google', 'groq', 'cerebras', 'deepseek', 'openai']
    .filter((v, i, a) => v && a.indexOf(v) === i)

  const chain: ProviderSpec[] = []
  for (const id of order) {
    const def = PROVIDER_DEFAULTS[id]
    if (!def) continue
    const apiKey = resolveKey(def.keyEnvs)
    if (!apiKey) continue

    // Allow model override for the preferred provider via AI_MODEL / AI_FALLBACK_MODELS
    let models = def.models
    if (id === preferred && process.env.AI_MODEL) {
      const primary = process.env.AI_MODEL.trim()
      const fallbacks = (process.env.AI_FALLBACK_MODELS ?? '')
        .split(',').map(m => m.trim()).filter(Boolean)
      models = Array.from(new Set([primary, ...fallbacks]))
    }
    chain.push({ id, name: def.name, apiKey, baseURL: def.baseURL, models })
  }
  return chain
}

const CHAIN = buildChain()

// Cache one OpenAI client per provider.
const clients = new Map<string, OpenAI>()
function clientFor(p: ProviderSpec): OpenAI {
  if (!clients.has(p.id)) clients.set(p.id, new OpenAI({ apiKey: p.apiKey, baseURL: p.baseURL }))
  return clients.get(p.id)!
}

export const aiConfig = {
  model: CHAIN[0]?.models[0] ?? 'none',
  providerName: CHAIN[0]?.name ?? 'No provider configured',
  chain: CHAIN.map(p => p.name),
}

/**
 * Call the AI with automatic provider fallback.
 * Tries each configured provider in order; on 429 (rate limit) or bad key,
 * moves to the next provider. Retries transient errors per model.
 */
export async function callAI(prompt: string, maxRetries = 2, maxTokens = 600): Promise<string> {
  if (CHAIN.length === 0) {
    throw new Error(
      'No AI provider configured. Add one of: GOOGLE_API_KEY, GROQ_API_KEY, CEREBRAS_API_KEY, DEEPSEEK_API_KEY, OPENAI_API_KEY to .env.'
    )
  }

  let lastError: unknown
  const tried: string[] = []

  for (const provider of CHAIN) {
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
          if (out) return out
          // Empty response — try next model/provider
          break
        } catch (err) {
          lastError = err
          const status = (err as { status?: number })?.status
          // Bad key (401/403), no balance (402), or rate limit (429)
          // → abandon this provider immediately, try the next one.
          if (status === 401 || status === 402 || status === 403 || status === 429) { skipProvider = true; break }
          // Model not available on this endpoint → try next model.
          if (status === 404) break
          // Transient (5xx, timeout) → short backoff then retry same model.
          if (attempt < maxRetries - 1) await new Promise(r => setTimeout(r, 800 * (attempt + 1)))
        }
      }
    }
  }

  // Every provider exhausted.
  const status = (lastError as { status?: number })?.status
  const msg =
    status === 429 ? `All AI providers are rate-limited or out of quota (tried: ${tried.join(', ')}). Add a free key (Cerebras/Groq) to .env, or wait for the daily limit to reset.`
    : status === 402 ? `AI providers ran out of credit/quota (tried: ${tried.join(', ')}). Add a free key (Cerebras/Groq) to .env — DeepSeek/OpenAI need a paid balance.`
    : `AI request failed across all providers (tried: ${tried.join(', ')}).`
  const e = new Error(msg) as Error & { status?: number }
  e.status = status ?? 500
  throw e
}

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
