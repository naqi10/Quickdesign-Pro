'use client'
import { useState } from 'react'
import { useResumeStore } from '@/store/resumeStore'

type Section =
  | { kind: 'summary' }
  | { kind: 'experience'; index: number }
  | { kind: 'project'; index: number }
  | { kind: 'skills' }

interface Props {
  section: Section
  /** Visual size — "sm" for inline section headers, "md" for hero/summary header */
  size?: 'sm' | 'md'
  /** Title shown on hover */
  label?: string
}

export default function RerollButton({ section, size = 'sm', label }: Props) {
  const formData = useResumeStore(s => s.formData)
  const updateSummary = useResumeStore(s => s.updateSummary)
  const updateSkills = useResumeStore(s => s.updateSkills)
  const updateExperienceBullets = useResumeStore(s => s.updateExperienceBullets)
  const updateProjectBullets = useResumeStore(s => s.updateProjectBullets)

  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function reroll() {
    if (busy) return
    setBusy(true)
    setErr(null)
    try {
      const res = await fetch('/api/rewrite-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData, section }),
      })
      if (!res.ok) {
        const text = await res.text()
        let message = 'Re-roll failed'
        try { message = (JSON.parse(text) as { error?: string }).error ?? message } catch {}
        throw new Error(message)
      }
      const data = await res.json() as {
        summary?: string
        skills?: Record<string, string[]>
        bullets?: string[]
        index?: number
      }

      if (section.kind === 'summary' && data.summary) updateSummary(data.summary)
      else if (section.kind === 'skills' && data.skills) updateSkills(data.skills)
      else if (section.kind === 'experience' && data.bullets) updateExperienceBullets(section.index, data.bullets)
      else if (section.kind === 'project' && data.bullets) updateProjectBullets(section.index, data.bullets)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Re-roll failed')
      setTimeout(() => setErr(null), 2500)
    } finally {
      setBusy(false)
    }
  }

  const dim = size === 'md' ? 24 : 18
  const fontSize = size === 'md' ? 13 : 11

  return (
    <button
      type="button"
      onClick={reroll}
      disabled={busy}
      title={err ?? label ?? 'Regenerate this section with AI'}
      contentEditable={false}
      suppressContentEditableWarning={true}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dim, height: dim,
        marginLeft: 6,
        borderRadius: 6,
        border: err ? '1px solid #ef4444' : '1px solid #cbd5e1',
        background: err ? '#fef2f2' : busy ? '#dbeafe' : '#ffffff',
        color: err ? '#b91c1c' : '#475569',
        fontSize,
        cursor: busy ? 'wait' : 'pointer',
        verticalAlign: 'middle',
        transition: 'all 150ms',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        if (busy || err) return
        e.currentTarget.style.background = '#eff6ff'
        e.currentTarget.style.borderColor = '#60a5fa'
        e.currentTarget.style.color = '#1d4ed8'
      }}
      onMouseLeave={(e) => {
        if (busy || err) return
        e.currentTarget.style.background = '#ffffff'
        e.currentTarget.style.borderColor = '#cbd5e1'
        e.currentTarget.style.color = '#475569'
      }}
    >
      {busy ? (
        <span style={{
          width: dim - 10, height: dim - 10,
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'rerollSpin 0.7s linear infinite',
          display: 'inline-block',
        }} />
      ) : err ? (
        <span style={{ fontWeight: 700 }}>!</span>
      ) : (
        // Refresh icon — small SVG
        <svg width={dim - 8} height={dim - 8} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 8a6 6 0 1 1-1.76-4.24" />
          <path d="M14 2v4h-4" />
        </svg>
      )}
      <style jsx>{`
        @keyframes rerollSpin { to { transform: rotate(360deg); } }
      `}</style>
    </button>
  )
}
