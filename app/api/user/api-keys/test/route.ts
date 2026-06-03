import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { getUserApiKey, SUPPORTED_PROVIDERS, Provider } from '@/lib/userKeys'
import { testApiKey } from '@/lib/aiTest'

const providerEnum = z.enum(SUPPORTED_PROVIDERS as [Provider, ...Provider[]])

const schema = z.object({
  provider: providerEnum,
  // Optional: a draft key the user is testing BEFORE saving.
  // If omitted, we test the key already stored for this user.
  key: z.string().min(8).max(500).optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Bad JSON' }, { status: 400 }) }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { provider } = parsed.data
  const key = parsed.data.key ?? await getUserApiKey(session.user.id, provider)
  if (!key) return NextResponse.json({ ok: false, error: 'No key to test.' })

  const result = await testApiKey(provider, key)
  return NextResponse.json(result)
}
