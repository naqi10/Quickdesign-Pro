import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { auth } from '@/auth'
import { getUserApiKey } from '@/lib/userKeys'
import { rateLimitUser } from '@/lib/rateLimit'

/**
 * POST /api/coach/stt
 *
 * Body: multipart/form-data with `audio` field (any browser-recordable
 * type — webm/ogg/mp4).
 * Returns: { text }
 *
 * Uses the user's OWN OpenAI key (BYO architecture from PR #16). Returns
 * 402 with a clear CTA if they haven't added one.
 */
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

  const form = await req.formData().catch(() => null)
  const file = form?.get('audio')
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'Missing audio file' }, { status: 400 })
  }

  // OpenAI SDK expects a File-like object with a name + type.
  // The browser sends a Blob via MediaRecorder; wrap it so the SDK is happy.
  const audioFile = new File([file], 'speech.webm', { type: file.type || 'audio/webm' })

  try {
    const client = new OpenAI({ apiKey })
    const result = await client.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'text',
      language: 'en',
    })
    // When response_format is 'text', the SDK returns a string.
    const text = typeof result === 'string' ? result : (result as { text?: string }).text ?? ''
    return NextResponse.json({ text: text.trim() })
  } catch (e) {
    const status = (e as { status?: number })?.status ?? 500
    const msg = e instanceof Error ? e.message : 'Transcription failed.'
    return NextResponse.json({ error: msg }, { status: status === 401 ? 402 : 500 })
  }
}
