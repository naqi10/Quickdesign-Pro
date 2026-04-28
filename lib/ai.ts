/**
 * lib/ai.ts — shared AI client
 *
 * OpenAI-compatible shared AI client.
 * Supports Google AI Studio (Gemini) and Groq via env config.
 */

import OpenAI from 'openai'

type Provider = 'google' | 'groq'

const envProvider = (process.env.AI_PROVIDER ?? '').trim().toLowerCase()
const detectedProvider: Provider = envProvider === 'google'
  ? 'google'
  : envProvider === 'groq'
    ? 'groq'
    : process.env.GROQ_API_KEY
      ? 'groq'
      : 'google'

const apiKey = detectedProvider === 'groq'
  ? process.env.GROQ_API_KEY
  : (process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY)

const baseURL = process.env.AI_BASE_URL ?? (
  detectedProvider === 'groq'
    ? 'https://api.groq.com/openai/v1'
    : 'https://generativelanguage.googleapis.com/v1beta/openai/'
)

const openai = new OpenAI({ apiKey, baseURL })

const PRIMARY_MODEL = process.env.AI_MODEL ?? (
  detectedProvider === 'groq' ? 'llama-3.1-8b-instant' : 'gemini-2.0-flash-lite'
)
const FALLBACK_MODELS = (process.env.AI_FALLBACK_MODELS ?? (
  detectedProvider === 'groq' ? 'llama-3.1-70b-versatile' : 'gemini-2.0-flash'
))
  .split(',')
  .map(m => m.trim())
  .filter(Boolean)
const MODELS = Array.from(new Set([PRIMARY_MODEL, ...FALLBACK_MODELS]))

export const aiConfig = {
  model: PRIMARY_MODEL,
  providerName: detectedProvider === 'groq' ? 'Groq' : 'Google Gemini',
}

export async function callAI(prompt: string, maxRetries = 3, maxTokens = 600): Promise<string> {
  if (!apiKey) {
    if (detectedProvider === 'groq') {
      throw new Error('Missing GROQ_API_KEY in .env.local')
    }
    throw new Error('Missing GOOGLE_API_KEY (or GEMINI_API_KEY) in .env.local')
  }

  let lastError: unknown
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    for (let modelIndex = 0; modelIndex < MODELS.length; modelIndex++) {
      const model = MODELS[modelIndex]
      try {
        const res = await openai.chat.completions.create(
          {
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.35,
            max_tokens: maxTokens,
          },
          { timeout: 20000 }
        )
        return res.choices[0].message.content?.trim() ?? ''
      } catch (err) {
        lastError = err
        const status = (err as { status?: number })?.status
        // Don't retry on auth/billing errors — they won't resolve by retrying.
        if (status === 401 || status === 403) throw err
        // If model not found on this endpoint, try next configured model immediately.
        if (status === 404 && modelIndex < MODELS.length - 1) continue
        if (status === 404 && modelIndex === MODELS.length - 1 && attempt === maxRetries - 1) {
          throw new Error(
            `Model not found for ${aiConfig.providerName}. Tried models: ${MODELS.join(', ')}`
          )
        }
        // 429: rate limit. Fail FAST — retries waste your daily quota since:
        //   - RPD (daily) won't recover until midnight Pacific
        //   - RPM (per-min) recovers in 60s, but the user is faster than us
        //   - TPM uses tokens we can't recover
        // Both primary + fallback share project quota, so don't try fallback.
        if (status === 429) {
          const errBody = (err as { error?: { message?: string } })?.error?.message ?? ''
          const isDaily = /daily|RPD|per day/i.test(errBody)
          const message = isDaily
            ? `${aiConfig.providerName} daily request limit reached. Add billing at aistudio.google.com or wait until midnight Pacific time.`
            : `${aiConfig.providerName} rate limit reached. Wait 60 seconds and retry — or use the ↻ Re-roll buttons (1 call each) instead of full rewrites.`
          const throttledError = new Error(message) as Error & { status?: number }
          throttledError.status = 429
          throw throttledError
        }
        // Other errors: short exponential backoff.
        if (attempt < maxRetries - 1) {
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)))
          break
        }
      }
    }
  }
  throw lastError
}

export function stripFences(raw: string): string {
  return raw.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim()
}

/**
 * Run async tasks with bounded concurrency. Avoids hitting per-minute token
 * limits on free-tier AI providers (especially Groq, which throttles by TPM).
 * Default concurrency = 2 — empirically safe for Groq free tier.
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
