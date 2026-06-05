import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { rateLimitUser } from '@/lib/rateLimit'

const COACH_URL = process.env.COACH_URL ?? 'http://localhost:8000'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = await rateLimitUser(session.user.id)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${rl.retryAfterSec ?? 60}s.` },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec ?? 60) } }
    )
  }

  try {
    const res = await fetch(`${COACH_URL}/sessions`, { method: 'POST' })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      return NextResponse.json({ error: `Coach service: ${body || res.statusText}` }, { status: 502 })
    }
    const data = await res.json() as { session_id: string; text: string }
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json(
      { error: 'Could not reach the coach service. Is it running on COACH_URL?' },
      { status: 502 }
    )
  }
}
