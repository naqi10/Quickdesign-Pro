'use client'
import { useState, useRef } from 'react'
import { ClientFormData } from '@/lib/types'

interface SmartPasteProps {
  onParsed: (data: ClientFormData) => void
}

export default function SmartPaste({ onParsed }: SmartPasteProps) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function handleParse() {
    if (!text.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/parse-raw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw: text }),
      })

      const data = await res.json() as { formData?: ClientFormData; error?: string }

      if (!res.ok || data.error) {
        setError(data.error ?? 'Failed to parse. Try again.')
        return
      }

      if (data.formData) {
        onParsed(data.formData)
        setText('')
        setOpen(false)
      }
    } catch {
      setError('Network error. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Auto-trigger parse when user pastes into the textarea
  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const pasted = e.clipboardData.getData('text')
    if (pasted.trim().length > 30) {
      // Small delay so the textarea value updates first
      setTimeout(() => {
        setText(pasted)
        handleParse()
      }, 50)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setTimeout(() => textareaRef.current?.focus(), 50) }}
        className="w-full flex items-center gap-2 bg-violet-50 hover:bg-violet-100 border border-violet-200 hover:border-violet-400 text-violet-700 hover:text-violet-800 font-medium py-2.5 px-4 rounded-lg transition-all text-sm"
      >
        <span className="text-base">⚡</span>
        Smart Paste
        <span className="ml-auto text-xs text-violet-400">paste WhatsApp text → auto-fill</span>
      </button>
    )
  }

  return (
    <div className="border border-violet-200 rounded-lg bg-violet-50 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-violet-700 flex items-center gap-1.5">
          <span>⚡</span> Smart Paste
        </span>
        <button
          onClick={() => { setOpen(false); setText(''); setError('') }}
          className="text-slate-400 hover:text-slate-600 text-xs"
        >
          ✕ close
        </button>
      </div>

      <p className="text-xs text-slate-500">
        Paste the client&apos;s WhatsApp message, CV text, or any raw details below. AI will fill the entire form instantly.
      </p>

      <textarea
        ref={textareaRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onPaste={handlePaste}
        placeholder="Hi, my name is Ahmed. I am a software developer with 3 years experience. I worked at Systems Ltd as junior developer from 2021 to 2023. My skills are React, Node.js, Python. I studied BS Computer Science from FAST 2021..."
        rows={5}
        className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-colors resize-none"
      />

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      <button
        onClick={handleParse}
        disabled={loading || !text.trim()}
        className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-200 disabled:text-violet-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Parsing & filling form...
          </>
        ) : (
          '⚡ Auto-Fill Form'
        )}
      </button>
    </div>
  )
}
