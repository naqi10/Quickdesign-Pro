'use client'
import { useEffect, useState } from 'react'

interface Props {
  state: 'idle' | 'saving' | 'saved'
  lastSavedAt: number | null
}

function relativeTime(ts: number): string {
  const secs = Math.floor((Date.now() - ts) / 1000)
  if (secs < 5) return 'just now'
  if (secs < 60) return `${secs}s ago`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function SaveIndicator({ state, lastSavedAt }: Props) {
  // Tick every 15s so the relative time stays fresh.
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!lastSavedAt) return
    const id = setInterval(() => setTick(t => t + 1), 15000)
    return () => clearInterval(id)
  }, [lastSavedAt])

  if (state === 'saving') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-slate-400">
        <span className="w-2.5 h-2.5 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
        Saving…
      </span>
    )
  }

  if (lastSavedAt) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-slate-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Saved {relativeTime(lastSavedAt)}
      </span>
    )
  }

  return null
}
