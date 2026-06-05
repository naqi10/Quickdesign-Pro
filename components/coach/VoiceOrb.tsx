'use client'
import { useEffect, useRef } from 'react'

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking'

interface Props {
  state: OrbState
  /** Optional MediaStream during listening (for live amplitude). */
  micStream?: MediaStream | null
  /** Optional <audio> element during speaking (for live amplitude). */
  speakingAudio?: HTMLAudioElement | null
  size?: number
  onTap?: () => void
}

/**
 * The "round ball" — a Canvas-rendered sphere that reacts to audio in real time.
 * Implementation: HSL-gradient circle whose radius pulses with the loudest
 * frequency bin of the active source (mic during listening, <audio> during
 * speaking). Idle does a sine-wave gentle pulse. Thinking spins a gradient.
 */
export default function VoiceOrb({
  state, micStream, speakingAudio, size = 240, onTap,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null>(null)

  // (Re)attach the analyser when source changes.
  useEffect(() => {
    function detach() {
      try { sourceRef.current?.disconnect() } catch { /* ignore */ }
      sourceRef.current = null
      analyserRef.current = null
    }

    detach()
    if (state === 'listening' && micStream) {
      const ctx = (audioCtxRef.current ??= new AudioContext())
      const src = ctx.createMediaStreamSource(micStream)
      const an = ctx.createAnalyser()
      an.fftSize = 256
      src.connect(an)
      sourceRef.current = src
      analyserRef.current = an
    } else if (state === 'speaking' && speakingAudio) {
      const ctx = (audioCtxRef.current ??= new AudioContext())
      // Resume in case browser policy paused it.
      if (ctx.state === 'suspended') void ctx.resume()
      try {
        const src = ctx.createMediaElementSource(speakingAudio)
        const an = ctx.createAnalyser()
        an.fftSize = 256
        src.connect(an)
        an.connect(ctx.destination) // still route to speakers
        sourceRef.current = src
        analyserRef.current = an
      } catch {
        // createMediaElementSource throws if called twice on the same element.
        // In that case the analyser from a prior pass should still be wired.
      }
    }

    return () => { detach() }
  }, [state, micStream, speakingAudio])

  // The draw loop.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    const cx = size / 2
    const cy = size / 2
    const baseRadius = size * 0.28
    const maxRadius = size * 0.46
    const data = new Uint8Array(128)
    let t = 0
    let hueOffset = 0

    function amplitude(): number {
      const an = analyserRef.current
      if (!an) return 0
      an.getByteFrequencyData(data)
      let sum = 0
      for (let i = 0; i < data.length; i++) sum += data[i]
      return Math.min(1, (sum / data.length) / 180)
    }

    function colorsForState(s: OrbState): [string, string] {
      switch (s) {
        case 'listening': return ['#60a5fa', '#a78bfa'] // blue → violet
        case 'thinking':  return ['#f0abfc', '#818cf8'] // pink → indigo
        case 'speaking':  return ['#34d399', '#22d3ee'] // emerald → cyan
        default:          return ['#94a3b8', '#cbd5e1'] // slate
      }
    }

    function draw() {
      if (!ctx) return
      t += 0.016
      hueOffset = (hueOffset + (state === 'thinking' ? 1.6 : 0.3)) % 360

      ctx.clearRect(0, 0, size, size)

      const amp = state === 'listening' || state === 'speaking' ? amplitude() : 0
      const breath = (Math.sin(t * 2) + 1) / 2 // 0..1
      const target = state === 'idle'
        ? baseRadius + breath * 6
        : state === 'thinking'
          ? baseRadius + Math.sin(t * 4) * 8
          : baseRadius + amp * (maxRadius - baseRadius)

      // Outer glow rings while active
      if (state === 'listening' || state === 'speaking') {
        for (let r = 1; r <= 3; r++) {
          const a = 0.12 / r
          const ringR = target + r * 18 + amp * 8 * r
          ctx.beginPath()
          ctx.arc(cx, cy, ringR, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(99, 102, 241, ${a})`
          ctx.lineWidth = 2
          ctx.stroke()
        }
      }

      // Core gradient
      const [c1, c2] = colorsForState(state)
      const grad = ctx.createRadialGradient(
        cx - target * 0.3,
        cy - target * 0.3,
        target * 0.1,
        cx, cy, target
      )
      grad.addColorStop(0, c1)
      grad.addColorStop(1, c2)
      ctx.beginPath()
      ctx.arc(cx, cy, target, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.shadowBlur = 24
      ctx.shadowColor = c1
      ctx.fill()
      ctx.shadowBlur = 0

      // Highlight
      ctx.beginPath()
      ctx.arc(cx - target * 0.35, cy - target * 0.35, target * 0.35, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.18)'
      ctx.fill()

      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [state, size])

  return (
    <button
      type="button"
      onClick={onTap}
      aria-label="Voice orb"
      style={{
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: onTap ? 'pointer' : 'default',
        outline: 'none',
        width: size,
        height: size,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size, display: 'block' }}
      />
    </button>
  )
}
