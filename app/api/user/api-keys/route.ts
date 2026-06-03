import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import {
  listUserApiKeys, setUserApiKey, deleteUserApiKey,
  SUPPORTED_PROVIDERS, Provider,
} from '@/lib/userKeys'

const providerEnum = z.enum(SUPPORTED_PROVIDERS as [Provider, ...Provider[]])

const postSchema = z.object({
  provider: providerEnum,
  key: z.string().min(8).max(500),
})
const deleteSchema = z.object({ provider: providerEnum })

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const keys = await listUserApiKeys(session.user.id)
  return NextResponse.json({ keys })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Bad JSON' }, { status: 400 }) }
  const parsed = postSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  await setUserApiKey(session.user.id, parsed.data.provider, parsed.data.key)
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Bad JSON' }, { status: 400 }) }
  const parsed = deleteSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  await deleteUserApiKey(session.user.id, parsed.data.provider)
  return NextResponse.json({ ok: true })
}
