/**
 * lib/aiTest.ts — verify a user-supplied API key by making a real (tiny)
 * call to the provider. 5 output tokens, costs ~$0.00001 on paid plans.
 * Catches the common failure modes with a clear message.
 */

import OpenAI from 'openai'
import { Provider } from './userKeys'

const OPENAI_COMPATIBLE: Record<Exclude<Provider, 'anthropic'>, { baseURL: string; model: string }> = {
  google:   { baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/', model: 'gemini-2.0-flash-lite' },
  openai:   { baseURL: 'https://api.openai.com/v1',                                model: 'gpt-4o-mini' },
  groq:     { baseURL: 'https://api.groq.com/openai/v1',                           model: 'llama-3.1-8b-instant' },
  cerebras: { baseURL: 'https://api.cerebras.ai/v1',                               model: 'llama3.1-8b' },
  deepseek: { baseURL: 'https://api.deepseek.com',                                 model: 'deepseek-chat' },
}

export interface TestResult { ok: boolean; error?: string }

function classify(status: number | undefined, fallback: string): string {
  if (status === 401 || status === 403) return 'Invalid API key.'
  if (status === 402) return 'Provider says: no balance / payment required.'
  if (status === 429) return 'Key works but is currently rate-limited.'
  if (status === 404) return 'Test model not available on this account.'
  return fallback
}

export async function testApiKey(provider: Provider, key: string): Promise<TestResult> {
  if (!key.trim()) return { ok: false, error: 'Key is empty.' }

  try {
    if (provider === 'anthropic') {
      // Anthropic has its own API shape — direct fetch.
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 5,
          messages: [{ role: 'user', content: 'hi' }],
        }),
      })
      if (res.ok) return { ok: true }
      const body = await res.text().catch(() => '')
      return { ok: false, error: classify(res.status, body.slice(0, 160) || 'Test call failed.') }
    }

    const cfg = OPENAI_COMPATIBLE[provider]
    const client = new OpenAI({ apiKey: key, baseURL: cfg.baseURL })
    await client.chat.completions.create(
      {
        model: cfg.model,
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 5,
      },
      { timeout: 12000 }
    )
    return { ok: true }
  } catch (e) {
    const err = e as { status?: number; message?: string; error?: { message?: string } }
    const msg = err.error?.message ?? err.message ?? 'Test call failed.'
    return { ok: false, error: classify(err.status, msg) }
  }
}
