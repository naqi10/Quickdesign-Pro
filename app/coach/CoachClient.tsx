'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import VoiceOrb, { OrbState } from '@/components/coach/VoiceOrb'

// ─── Voice engine: browser (free, Web Speech API) or OpenAI (paid, premium) ──

type Engine = 'browser' | 'openai'
type OpenAIVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'

const OPENAI_VOICES: { id: OpenAIVoice; label: string; tagline: string; tone: 'F' | 'M' | '—' }[] = [
  { id: 'nova',    label: 'Nova',    tagline: 'Warm feminine',   tone: 'F' },
  { id: 'shimmer', label: 'Shimmer', tagline: 'Soft feminine',   tone: 'F' },
  { id: 'alloy',   label: 'Alloy',   tagline: 'Neutral',         tone: '—' },
  { id: 'echo',    label: 'Echo',    tagline: 'Steady masculine', tone: 'M' },
  { id: 'fable',   label: 'Fable',   tagline: 'British masculine', tone: 'M' },
  { id: 'onyx',    label: 'Onyx',    tagline: 'Deep masculine',   tone: 'M' },
]

interface TranscriptEntry { who: 'agent' | 'you'; text: string }
interface Summary { role: string | null; questions_answered: number; average_score: number }

// SpeechRecognition isn't in standard TS lib types in 2026 — declare a tiny shape.
type AnyWindow = Window & {
  webkitSpeechRecognition?: new () => SpeechRecogInstance
  SpeechRecognition?: new () => SpeechRecogInstance
}
interface SpeechRecogInstance {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
}

function browserSupportsVoice(): boolean {
  if (typeof window === 'undefined') return false
  const w = window as AnyWindow
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition) && 'speechSynthesis' in window
}

export default function CoachClient() {
  const [engine, setEngine] = useState<Engine>('browser')
  const [orb, setOrb] = useState<OrbState>('idle')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [statusLine, setStatusLine] = useState('Tap the orb to start your session')
  const [summary, setSummary] = useState<Summary | null>(null)

  // OpenAI voice selection
  const [openaiVoice, setOpenaiVoice] = useState<OpenAIVoice>('nova')

  // Browser voice selection (populated from speechSynthesis.getVoices())
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([])
  const [browserVoiceName, setBrowserVoiceName] = useState<string>('')

  const micStreamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recogRef = useRef<SpeechRecogInstance | null>(null)
  const [micStream, setMicStream] = useState<MediaStream | null>(null)
  const [speakingAudio, setSpeakingAudio] = useState<HTMLAudioElement | null>(null)

  // Load browser voices (asynchronously available)
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    function loadVoices() {
      const all = window.speechSynthesis.getVoices()
      const english = all.filter(v => v.lang.toLowerCase().startsWith('en'))
      setBrowserVoices(english.length > 0 ? english : all)
      if (english.length > 0 && !browserVoiceName) setBrowserVoiceName(english[0].name)
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => { window.speechSynthesis.onvoiceschanged = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // If browser doesn't support Web Speech, force engine to openai.
  useEffect(() => {
    if (engine === 'browser' && !browserSupportsVoice()) {
      setEngine('openai')
    }
  }, [engine])

  function showError(msg: string) { setError(msg); setOrb('idle'); setStatusLine('') }
  function appendTranscript(e: TranscriptEntry) { setTranscript(prev => [...prev, e]) }

  // ─── TTS: speak via the chosen engine ─────────────────────────────────────
  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return
    setOrb('speaking')
    setStatusLine(text)
    try {
      if (engine === 'browser') {
        await speakBrowser(text, browserVoiceName, browserVoices)
      } else {
        await speakOpenAI(text, openaiVoice, setSpeakingAudio)
      }
    } catch (e) {
      showError(e instanceof Error ? e.message : 'TTS failed')
      return
    }
    setSpeakingAudio(null)
    setOrb('idle')
    setStatusLine('Tap the orb to answer')
  }, [engine, openaiVoice, browserVoiceName, browserVoices])

  // ─── Start session ────────────────────────────────────────────────────────
  async function startSession() {
    setError(null)
    setSummary(null)
    setTranscript([])
    setOrb('thinking')
    setStatusLine('Connecting…')
    try {
      const res = await fetch('/api/coach/start', { method: 'POST' })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error ?? 'Failed to start')
      setSessionId(j.session_id)
      appendTranscript({ who: 'agent', text: j.text })
      await speak(j.text)
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Could not start session')
    }
  }

  // ─── STT: listen via the chosen engine ────────────────────────────────────
  async function beginListening() {
    if (orb !== 'idle' || !sessionId) return
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      micStreamRef.current = stream
      setMicStream(stream)

      if (engine === 'browser') {
        const w = window as AnyWindow
        const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition
        if (!Ctor) throw new Error('This browser doesn\'t support speech recognition. Switch to OpenAI engine.')
        const recog = new Ctor()
        recog.continuous = false
        recog.interimResults = false
        recog.lang = 'en-US'
        recogRef.current = recog
        recog.start()
      } else {
        chunksRef.current = []
        const rec = new MediaRecorder(stream, { mimeType: 'audio/webm' })
        recorderRef.current = rec
        rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
        rec.start(250)
      }
      setOrb('listening')
      setStatusLine('Listening… (release to send)')
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Microphone access denied')
    }
  }

  async function endListening() {
    let userText = ''
    try {
      if (engine === 'browser') {
        const recog = recogRef.current
        if (!recog) { setOrb('idle'); setStatusLine(''); return }
        userText = await stopAndTranscribeBrowser(recog)
      } else {
        const rec = recorderRef.current
        if (!rec || rec.state === 'inactive') return
        rec.stop()
        await new Promise<void>(r => { rec.onstop = () => r() })
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        chunksRef.current = []
        if (blob.size < 1000) { setOrb('idle'); setStatusLine('Didn’t catch that — try again'); return }
        setOrb('thinking')
        setStatusLine('Transcribing…')
        userText = await transcribeOpenAI(blob)
      }
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Listening failed')
      return
    } finally {
      micStreamRef.current?.getTracks().forEach(t => t.stop())
      micStreamRef.current = null
      setMicStream(null)
    }

    if (!userText.trim()) {
      setOrb('idle'); setStatusLine('Didn’t catch that — try again'); return
    }
    appendTranscript({ who: 'you', text: userText })

    // Send to coach brain
    setOrb('thinking')
    setStatusLine('Thinking…')
    try {
      const res = await fetch('/api/coach/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, text: userText }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error ?? 'Coach failed')
      appendTranscript({ who: 'agent', text: j.text })
      await speak(j.text)
      if (j.phase === 'wrapped' && j.summary) {
        setSummary(j.summary as Summary)
        setStatusLine('Session complete')
      }
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Turn failed')
    }
  }

  // Space bar push-to-talk
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code !== 'Space' || e.repeat) return
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      e.preventDefault(); beginListening()
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.code !== 'Space') return
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      e.preventDefault(); endListening()
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, orb, engine])

  function orbTap() {
    if (!sessionId) { void startSession(); return }
    if (orb === 'idle') void beginListening()
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 py-4 flex items-center gap-3 shadow-sm">
        <Link href="/" className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm">← Dashboard</Link>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Interview Coach</h1>
        <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
          {sessionId ? 'In session' : engine === 'browser' ? 'Free browser voice' : 'Premium OpenAI voice'}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start px-6 py-8 gap-7">
        {/* Engine selector */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-semibold">
          <button
            onClick={() => !sessionId && setEngine('browser')}
            disabled={!!sessionId}
            className={`px-4 py-1.5 rounded-full transition-colors ${
              engine === 'browser'
                ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow'
                : 'text-slate-600 dark:text-slate-300'
            } disabled:opacity-50`}
            title="Free, uses your browser's built-in voice"
          >
            🆓 Free (browser)
          </button>
          <button
            onClick={() => !sessionId && setEngine('openai')}
            disabled={!!sessionId}
            className={`px-4 py-1.5 rounded-full transition-colors ${
              engine === 'openai'
                ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow'
                : 'text-slate-600 dark:text-slate-300'
            } disabled:opacity-50`}
            title="Premium 6 OpenAI voices, uses your OpenAI key"
          >
            🎙 Premium (OpenAI)
          </button>
        </div>

        <VoiceOrb
          state={orb}
          micStream={micStream}
          speakingAudio={speakingAudio}
          size={260}
          onTap={orbTap}
        />

        <div className="text-center max-w-xl min-h-[2.5rem]">
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-300">{statusLine}</p>
          )}
        </div>

        {sessionId ? (
          <button
            type="button"
            onMouseDown={beginListening}
            onMouseUp={endListening}
            onMouseLeave={endListening}
            onTouchStart={(e) => { e.preventDefault(); beginListening() }}
            onTouchEnd={(e) => { e.preventDefault(); endListening() }}
            disabled={orb !== 'idle'}
            className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold text-sm shadow-md select-none"
          >
            🎙 Hold to talk
          </button>
        ) : (
          <button
            onClick={startSession}
            className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md"
          >
            ✨ Start session
          </button>
        )}

        {/* Voice picker — different for each engine */}
        {engine === 'openai' ? (
          <div className="w-full max-w-2xl">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">OpenAI Voice</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {OPENAI_VOICES.map(v => (
                <button
                  key={v.id}
                  onClick={() => setOpenaiVoice(v.id)}
                  className={`p-2 rounded-lg border text-left transition-colors ${
                    openaiVoice === v.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center gap-1">
                    {v.label}<span className="text-[9px] text-slate-400">{v.tone}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">{v.tagline}</div>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Premium mode needs an OpenAI key in Settings. ~$0.02 per session.</p>
          </div>
        ) : (
          <div className="w-full max-w-2xl">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Browser Voice ({browserVoices.length} available)
            </p>
            {browserVoices.length === 0 ? (
              <p className="text-xs text-slate-500">Loading voices… (or your browser doesn’t support TTS).</p>
            ) : (
              <select
                value={browserVoiceName}
                onChange={e => setBrowserVoiceName(e.target.value)}
                className="w-full text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {browserVoices.map(v => (
                  <option key={v.name} value={v.name}>{v.name} — {v.lang}</option>
                ))}
              </select>
            )}
            <p className="text-[11px] text-slate-400 mt-2">
              Browser voice is free but quality varies by OS. Tip: Edge has the best built-in neural voices on Windows.
            </p>
          </div>
        )}

        {summary && (
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">📊 Session summary</h3>
            <div className="space-y-2 text-sm">
              <Row label="Role" value={summary.role ?? '—'} />
              <Row label="Questions answered" value={String(summary.questions_answered)} />
              <Row label="Average score" value={`${summary.average_score} / 10`} />
            </div>
            <button onClick={startSession}
              className="mt-4 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold">
              Run another session
            </button>
          </div>
        )}

        {transcript.length > 0 && (
          <details className="w-full max-w-2xl">
            <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">
              Show transcript ({transcript.length} {transcript.length === 1 ? 'turn' : 'turns'})
            </summary>
            <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
              {transcript.map((e, i) => (
                <div key={i} className={`text-sm ${e.who === 'you' ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200'}`}>
                  <strong className="text-xs uppercase tracking-wider opacity-60 mr-2">
                    {e.who === 'you' ? 'You' : 'Coach'}
                  </strong>
                  {e.text}
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      <p className="text-center text-[11px] text-slate-400 pb-4 px-4">
        Tip: hold <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800">Space</kbd> to talk, release to send.
      </p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <strong className="text-slate-800 dark:text-slate-100">{value}</strong>
    </div>
  )
}

// ─── Engine implementations ────────────────────────────────────────────────

async function speakBrowser(text: string, voiceName: string, voices: SpeechSynthesisVoice[]): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      const v = voices.find(x => x.name === voiceName) ?? voices[0]
      if (v) u.voice = v
      u.rate = 1.0
      u.pitch = 1.0
      u.onend = () => resolve()
      u.onerror = () => resolve() // fail gracefully — don't lock UI
      window.speechSynthesis.speak(u)
    } catch (e) { reject(e) }
  })
}

async function speakOpenAI(
  text: string,
  voice: OpenAIVoice,
  setSpeakingAudio: (a: HTMLAudioElement | null) => void,
): Promise<void> {
  const res = await fetch('/api/coach/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice }),
  })
  if (!res.ok) {
    const j = await res.json().catch(() => ({}))
    throw new Error(j.error ?? 'TTS failed')
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const audio = new Audio()
  audio.src = url
  setSpeakingAudio(audio)
  await audio.play()
  await new Promise<void>(resolve => {
    audio.onended = () => resolve()
    audio.onerror = () => resolve()
  })
  URL.revokeObjectURL(url)
}

async function stopAndTranscribeBrowser(recog: SpeechRecogInstance): Promise<string> {
  return new Promise((resolve) => {
    let finalText = ''
    recog.onresult = (e) => {
      const r = e.results[0]?.[0]
      if (r?.transcript) finalText = r.transcript
    }
    recog.onend = () => resolve(finalText)
    recog.onerror = () => resolve(finalText)
    try { recog.stop() } catch { /* may already be stopped */ }
  })
}

async function transcribeOpenAI(blob: Blob): Promise<string> {
  const form = new FormData()
  form.append('audio', blob, 'speech.webm')
  const res = await fetch('/api/coach/stt', { method: 'POST', body: form })
  const j = await res.json()
  if (!res.ok) throw new Error(j.error ?? 'STT failed')
  return j.text as string
}
