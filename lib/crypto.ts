/**
 * lib/crypto.ts — AES-256-GCM encryption for secrets at rest.
 *
 * Used to store user-supplied API keys in the database without ever putting
 * plaintext on disk or in logs. AES-256-GCM gives both confidentiality AND
 * authenticity (the auth tag catches tampering — important for credentials).
 *
 * Token format on disk:  "iv.authTag.ciphertext"
 *   - iv:         16 bytes, base64
 *   - authTag:    16 bytes, base64
 *   - ciphertext: variable, base64
 *
 * The 32-byte master key comes from process.env.ENCRYPTION_KEY (base64).
 * Generate one with:
 *   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 *
 * Plaintext keys NEVER leave the server. The client only ever sees a masked
 * preview (last 4 chars).
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALG = 'aes-256-gcm'
const IV_LEN = 16
const KEY_LEN = 32

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY?.trim()
  if (!raw) throw new Error('ENCRYPTION_KEY is missing. Generate: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"')
  const key = Buffer.from(raw, 'base64')
  if (key.length !== KEY_LEN) {
    throw new Error(`ENCRYPTION_KEY must decode to ${KEY_LEN} bytes (got ${key.length}). Regenerate it.`)
  }
  return key
}

export function encryptSecret(plaintext: string): string {
  if (typeof plaintext !== 'string' || plaintext.length === 0) {
    throw new Error('Cannot encrypt empty value')
  }
  const iv = randomBytes(IV_LEN)
  const cipher = createCipheriv(ALG, getKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return `${iv.toString('base64')}.${authTag.toString('base64')}.${ciphertext.toString('base64')}`
}

export function decryptSecret(token: string): string {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Malformed encrypted token')
  const [ivB64, tagB64, ctB64] = parts
  const iv = Buffer.from(ivB64, 'base64')
  const authTag = Buffer.from(tagB64, 'base64')
  const ciphertext = Buffer.from(ctB64, 'base64')
  const decipher = createDecipheriv(ALG, getKey(), iv)
  decipher.setAuthTag(authTag)
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()])
  return plaintext.toString('utf8')
}

/** Last-4 preview for safely showing a stored key in the UI. */
export function maskKey(plaintext: string): string {
  if (plaintext.length <= 8) return '••••'
  return `••••${plaintext.slice(-4)}`
}
