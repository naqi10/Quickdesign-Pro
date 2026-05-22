'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { SavedResume } from '@/lib/types'

// Dashboard resume-card actions: Duplicate + Delete.
// Both call the existing user-scoped /api/save endpoint and refresh the list.
export default function ResumeCardActions({ resume }: { resume: SavedResume }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [busy, setBusy] = useState<'dup' | 'del' | null>(null)
  const [confirming, setConfirming] = useState(false)

  async function duplicate() {
    setBusy('dup')
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: `${resume.clientName} (Copy)`,
          jobTitle: resume.jobTitle,
          resumeData: resume.resumeData,
        }),
      })
      if (res.ok) startTransition(() => router.refresh())
      else alert('Duplicate failed.')
    } finally {
      setBusy(null)
    }
  }

  async function remove() {
    setBusy('del')
    try {
      const res = await fetch('/api/save', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: resume.id }),
      })
      if (res.ok) startTransition(() => router.refresh())
      else alert('Delete failed.')
    } finally {
      setBusy(null)
      setConfirming(false)
    }
  }

  const working = pending || busy !== null

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-slate-600 dark:text-slate-300">Delete?</span>
        <button
          onClick={remove}
          disabled={working}
          className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 px-2.5 py-1 rounded-md transition-colors"
        >
          {busy === 'del' ? '…' : 'Yes'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={working}
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-2 items-center">
      <a
        href={`/new?load=${resume.id}`}
        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-900 hover:border-blue-400 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"
      >
        Open & Edit
      </a>
      <button
        onClick={duplicate}
        disabled={working}
        className="text-xs text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
        title="Duplicate this resume to tailor it for another job"
      >
        {busy === 'dup' ? 'Copying…' : 'Duplicate'}
      </button>
      <button
        onClick={() => setConfirming(true)}
        disabled={working}
        className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-950 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
        title="Delete resume"
      >
        Delete
      </button>
    </div>
  )
}
