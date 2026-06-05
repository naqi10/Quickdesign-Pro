import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { rateLimitUser } from '@/lib/rateLimit'

const COACH_URL = process.env.COACH_URL ?? 'http://localhost:8000'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = await rateLimitUser(session.user.id)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${rl.retryAfterSec ?? 60}s.` },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec ?? 60) } }
    )
  }

  let body: { sessionId?: string; text?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Bad JSON' }, { status: 400 }) }
  const { sessionId, text } = body
  if (!sessionId || !text?.trim()) {
    return NextResponse.json({ error: 'sessionId and text are required' }, { status: 400 })
  }

  try {
    const res = await fetch(`${COACH_URL}/sessions/${encodeURIComponent(sessionId)}/turn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.trim() }),
    })
    if (!res.ok) {
      const errBody = await res.text().catch(() => '')
      return NextResponse.json({ error: `Coach service: ${errBody || res.statusText}` }, { status: 502 })
    }
    const data = await res.json() as { text: string; phase: string; summary?: unknown }
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Could not reach the coach service. Is it running on COACH_URL?' },
      { status: 502 }
    )
  }
}
