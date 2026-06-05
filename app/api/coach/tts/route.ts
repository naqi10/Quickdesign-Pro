import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { auth } from '@/auth'
import { getUserApiKey } from '@/lib/userKeys'
import { rateLimitUser } from '@/lib/rateLimit'

/**
 * POST /api/coach/tts
 *
 * Body: { text: string, voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' }
 * Returns: audio/mpeg (MP3 binary)
 *
 * Six OpenAI TTS voices — a mix of feminine, masculine, and neutral tones.
 * Uses the user's own OpenAI key.
 */

const ALLOWED_VOICES = new Set(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'])
type Voice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'

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

  const apiKey = await getUserApiKey(session.user.id, 'openai')
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Voice mode needs your OpenAI key. Add one in Settings.' },
      { status: 402 }
    )
  }

  let body: { text?: string; voice?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Bad JSON' }, { status: 400 }) }

  const text = (body.text ?? '').trim()
  const voice = (body.voice ?? 'nova').toLowerCase()
  if (!text) return NextResponse.json({ error: 'text is required' }, { status: 400 })
  if (!ALLOWED_VOICES.has(voice)) {
    return NextResponse.json({ error: `Unknown voice. Pick one of: ${[...ALLOWED_VOICES].join(', ')}` }, { status: 400 })
  }
  if (text.length > 4000) {
    return NextResponse.json({ error: 'Text too long (max 4000 chars).' }, { status: 400 })
  }

  try {
    const client = new OpenAI({ apiKey })
    const speech = await client.audio.speech.create({
      model: 'tts-1',         // tts-1 (fast) vs tts-1-hd (higher quality, slower, ~2x cost)
      voice: voice as Voice,
      input: text,
      response_format: 'mp3',
    })
    const arrayBuf = await speech.arrayBuffer()
    return new NextResponse(new Uint8Array(arrayBuf), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(arrayBuf.byteLength),
        'Cache-Control': 'no-store',
      },
    })
  } catch (e) {
    const status = (e as { status?: number })?.status ?? 500
    const msg = e instanceof Error ? e.message : 'TTS failed.'
    return NextResponse.json({ error: msg }, { status: status === 401 ? 402 : 500 })
  }
}
