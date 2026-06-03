/**
 * lib/userKeys.ts — server-side CRUD for per-user API keys.
 *
 * Plaintext goes IN at set-time and comes OUT at get-time, but is only ever
 * stored encrypted. The "safe list" returned for UI shows provider + masked
 * preview + dates, never the real key.
 */

import { prisma } from './prisma'
import { encryptSecret, decryptSecret, maskKey } from './crypto'

export type Provider = 'google' | 'openai' | 'anthropic' | 'groq' | 'cerebras' | 'deepseek'

export const SUPPORTED_PROVIDERS: Provider[] = [
  'google', 'openai', 'anthropic', 'groq', 'cerebras', 'deepseek',
]

export const PROVIDER_LABEL: Record<Provider, string> = {
  google:    'Google Gemini',
  openai:    'OpenAI',
  anthropic: 'Anthropic Claude',
  groq:      'Groq',
  cerebras:  'Cerebras',
  deepseek:  'DeepSeek',
}

export interface SafeApiKeyInfo {
  provider: Provider
  preview: string          // "••••AB12"
  createdAt: string
  lastUsedAt: string | null
}

function isProvider(v: string): v is Provider {
  return (SUPPORTED_PROVIDERS as string[]).includes(v)
}

/** Upsert a user's key for a provider. Plaintext is encrypted before storage. */
export async function setUserApiKey(userId: string, provider: Provider, plaintext: string): Promise<void> {
  if (!isProvider(provider)) throw new Error('Unsupported provider')
  if (!plaintext.trim()) throw new Error('Key cannot be empty')
  const encryptedKey = encryptSecret(plaintext.trim())
  await prisma.userApiKey.upsert({
    where: { userId_provider: { userId, provider } },
    update: { encryptedKey },
    create: { userId, provider, encryptedKey },
  })
}

/** Returns the decrypted plaintext key, or null if the user has none. */
export async function getUserApiKey(userId: string, provider: Provider): Promise<string | null> {
  const row = await prisma.userApiKey.findUnique({
    where: { userId_provider: { userId, provider } },
  })
  if (!row) return null
  try {
    return decryptSecret(row.encryptedKey)
  } catch (err) {
    console.error('Failed to decrypt user key', { userId, provider, err })
    return null
  }
}

/** Marks a key as recently used (best-effort, non-blocking on errors). */
export async function touchUserApiKey(userId: string, provider: Provider): Promise<void> {
  try {
    await prisma.userApiKey.update({
      where: { userId_provider: { userId, provider } },
      data: { lastUsedAt: new Date() },
    })
  } catch { /* ignore — touch is cosmetic */ }
}

export async function deleteUserApiKey(userId: string, provider: Provider): Promise<void> {
  await prisma.userApiKey.deleteMany({ where: { userId, provider } })
}

/** Safe list for the settings UI — never returns plaintext. */
export async function listUserApiKeys(userId: string): Promise<SafeApiKeyInfo[]> {
  const rows = await prisma.userApiKey.findMany({
    where: { userId },
    orderBy: { provider: 'asc' },
  })
  const out: SafeApiKeyInfo[] = []
  for (const r of rows) {
    if (!isProvider(r.provider)) continue
    let preview = '••••'
    try { preview = maskKey(decryptSecret(r.encryptedKey)) } catch { /* keep default */ }
    out.push({
      provider: r.provider,
      preview,
      createdAt: r.createdAt.toISOString(),
      lastUsedAt: r.lastUsedAt?.toISOString() ?? null,
    })
  }
  return out
}
