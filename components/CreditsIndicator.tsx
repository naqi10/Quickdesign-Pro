'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useResumeStore } from '@/store/resumeStore'

interface Snapshot { credits: number; hasOwnKey: boolean }

/**
 * Tiny credits readout for the top bar. Shows nothing when the user has
 * their own API key (they're not consuming free credits). Refetches whenever
 * isRewriting transitions from true → false so the number stays fresh.
 */
export default function CreditsIndicator() {
  const isRewriting = useResumeStore(s => s.isRewriting)
  const [snap, setSnap] = useState<Snapshot | null>(null)
  const [wasRewriting, setWasRewriting] = useState(false)

  async function load() {
    try {
      const res = await fetch('/api/user/credits')
      if (!res.ok) return
      const j = await res.json() as Snapshot
      setSnap(j)
    } catch { /* ignore */ }
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    if (wasRewriting && !isRewriting) load()
    setWasRewriting(isRewriting)
  }, [isRewriting, wasRewriting])

  if (!snap || snap.hasOwnKey) return null

  const low = snap.credits <= 1
  const out = snap.credits === 0

  return (
    <Link
      href="/settings"
      title={out ? 'Out of credits — add your API key in Settings' : 'Free credits remaining (click to add your own key)'}
      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
        out ? 'text-red-700 bg-red-50 border-red-200 hover:bg-red-100'
        : low ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
        : 'text-violet-700 bg-violet-50 border-violet-200 hover:bg-violet-100'
      }`}
    >
      <span>💎</span>
      <span>{out ? 'Out of credits' : `${snap.credits} credit${snap.credits === 1 ? '' : 's'}`}</span>
    </Link>
  )
}
