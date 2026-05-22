'use client'
import { useState } from 'react'
import { useResumeStore } from '@/store/resumeStore'

// Builds a clean printable HTML letter for PDF export.
function letterHtml(name: string, jobTitle: string, body: string): string {
  const today = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
  const paras = body.split('\n').filter(p => p.trim())
    .map(p => `<p style="margin:0 0 12px;line-height:1.6;">${p.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</p>`)
    .join('')
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
  <style>*{box-sizing:border-box;margin:0;padding:0}@page{size:A4;margin:0}
  body{background:#fff}</style></head>
  <body><div id="resume-output" style="font-family:'Times New Roman',Georgia,serif;font-size:11.5pt;color:#111;width:210mm;min-height:297mm;padding:22mm 24mm;background:#fff;">
    <div style="margin-bottom:18px;">
      <div style="font-size:18pt;font-weight:700;">${name}</div>
      <div style="font-size:11pt;color:#444;">${jobTitle}</div>
    </div>
    <div style="font-size:10pt;color:#444;margin-bottom:18px;">${today}</div>
    ${paras}
  </div></body></html>`
}

export default function CoverLetterPanel() {
  const resumeData = useResumeStore(s => s.resumeData)
  const formData = useResumeStore(s => s.formData)

  const [open, setOpen] = useState(false)
  const [company, setCompany] = useState('')
  const [letter, setLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  if (!resumeData) return null

  async function generate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData, company, jobDescription: formData.jobDescription ?? '' }),
      })
      const text = await res.text()
      if (!res.ok) {
        let msg = 'Generation failed'
        try { msg = (JSON.parse(text) as { error?: string }).error ?? msg } catch {}
        throw new Error(msg)
      }
      setLetter((JSON.parse(text) as { letter: string }).letter)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(letter)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  async function downloadPdf() {
    if (!resumeData) return
    setPdfLoading(true)
    try {
      const html = letterHtml(resumeData.name, resumeData.jobTitle, letter)
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html, filename: `${resumeData.name.replace(/\s+/g, '_')}_CoverLetter` }),
      })
      if (!res.ok) { alert('PDF failed.'); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `${resumeData.name.replace(/\s+/g, '_')}_CoverLetter.pdf`; a.click()
      URL.revokeObjectURL(url)
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex-shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-base flex-shrink-0">
          ✉️
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold text-slate-800">Cover Letter</span>
          <p className="text-xs text-slate-500 mt-0.5">
            {letter ? 'Generated — edit, copy, or download' : 'AI-write a tailored cover letter from this resume'}
          </p>
        </div>
        <span className="text-slate-400 text-xs">{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div className="border-t border-slate-100 p-4 space-y-3">
          <input
            type="text"
            value={company}
            onChange={e => setCompany(e.target.value)}
            placeholder="Company name (optional)"
            className="w-full text-xs text-slate-800 placeholder:text-slate-400 border border-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <button
            onClick={generate}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Writing…</>
            ) : letter ? '↻ Regenerate' : '✦ Generate Cover Letter'}
          </button>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</div>
          )}

          {letter && (
            <>
              <textarea
                value={letter}
                onChange={e => setLetter(e.target.value)}
                rows={12}
                className="w-full text-xs text-slate-800 border border-slate-300 rounded-lg p-2.5 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              />
              <div className="flex gap-2">
                <button
                  onClick={copy}
                  className="flex-1 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                >
                  {copied ? '✓ Copied' : 'Copy text'}
                </button>
                <button
                  onClick={downloadPdf}
                  disabled={pdfLoading}
                  className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white text-xs font-semibold transition-colors"
                >
                  {pdfLoading ? 'Generating…' : '⬇ Download PDF'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
