'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useResumeStore } from '@/store/resumeStore'
import ClientForm from '@/components/ClientForm'
import TemplateSelector from '@/components/TemplateSelector'
import ResumePreview, { getResumeHTML } from '@/components/ResumePreview'
import PagePreviewModal from '@/components/PagePreviewModal'
import { ResumeData, SavedResume } from '@/lib/types'

// Step labels shown during AI rewrite
const REWRITE_STEPS = [
  'Extracting keywords…',
  'Rewriting summary…',
  'Rewriting experience bullets…',
  'Formatting skills…',
  'Finalising resume…',
]

export default function NewResumeClient() {
  const searchParams = useSearchParams()
  const loadId = searchParams.get('load')

  const {
    formData, resumeData, selectedTemplate,
    setResumeData, setIsRewriting, setRewriteStatus,
    isRewriting, reset,
    _hasHydrated,
  } = useResumeStore()

  const [showPreview, setShowPreview] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [stepIdx, setStepIdx] = useState(0)
  const [saved, setSaved] = useState(false)

  // Keyboard shortcuts: Ctrl+G = AI Rewrite, Ctrl+E = Preview PDF
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!e.ctrlKey) return
      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault()
        if (!isRewriting) runRewrite()
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault()
        if (resumeData && !isRewriting) setShowPreview(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRewriting, resumeData])

  // Cycle through step labels while rewriting
  useEffect(() => {
    if (!isRewriting) { setStepIdx(0); return }
    const id = setInterval(() => setStepIdx(i => (i + 1) % REWRITE_STEPS.length), 3000)
    return () => clearInterval(id)
  }, [isRewriting])

  // Load saved resume if ?load= param is present
  useEffect(() => {
    if (loadId) {
      fetch(`/api/save`)
        .then(async (r) => {
          if (!r.ok) return null
          const text = await r.text()
          if (!text) return null
          try { return JSON.parse(text) as { resumes?: SavedResume[] } }
          catch { return null }
        })
        .then((payload) => {
          const found = payload?.resumes?.find((r: SavedResume) => r.id === loadId)
          if (found) setResumeData(found.resumeData)
        })
    }
  }, [loadId, setResumeData])

  async function runRewrite() {
    if (!formData.name || !formData.jobTitle) {
      alert('Please fill in at least Name and Target Job Title.')
      return
    }
    setSaved(false)
    setIsRewriting(true)
    setRewriteStatus(REWRITE_STEPS[0])

    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const errText = await res.text()
        try { throw new Error((JSON.parse(errText) as { error?: string }).error ?? 'Rewrite failed') }
        catch { throw new Error(errText || 'Rewrite failed') }
      }

      const payloadText = await res.text()
      if (!payloadText) throw new Error('Rewrite failed: empty response')

      const { resumeData: newData, warning } = JSON.parse(payloadText) as {
        resumeData: ResumeData; warning?: string
      }
      setResumeData({ ...newData, templateId: selectedTemplate })
      if (warning) alert(`Note: ${warning}`)
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsRewriting(false)
      setRewriteStatus('')
    }
  }

  async function downloadPDF() {
    if (!resumeData) return
    const html = getResumeHTML(resumeData, selectedTemplate)
    const filename = `${resumeData.name.replace(/\s+/g, '_')}_Resume`

    const res = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html, filename }),
    })

    if (!res.ok) { alert('PDF generation failed.'); return }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function saveToHistory() {
    if (!resumeData) return
    const record: SavedResume = {
      id: `${Date.now()}`,
      clientName: resumeData.name,
      jobTitle: resumeData.jobTitle,
      createdAt: new Date().toISOString(),
      resumeData: { ...resumeData, templateId: selectedTemplate },
    }
    await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    })
    setSaved(true)
  }

  const hasResume = !!resumeData && !isRewriting

  // Wait for Zustand to finish reading localStorage before rendering.
  // Without this, the form renders blank for a moment on every page load.
  if (!_hasHydrated) {
    return (
      <div className="h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600 text-sm">Loading your workspace…</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* ── Page preview modal ─────────────────────────────────── */}
      {showPreview && resumeData && (
        <PagePreviewModal
          resumeData={{ ...resumeData, templateId: selectedTemplate }}
          templateId={selectedTemplate}
          onClose={() => setShowPreview(false)}
          onDownload={downloadPDF}
        />
      )}

      <div className="h-screen bg-gray-950 text-gray-100 flex flex-col overflow-hidden">

        {/* ── Top bar ───────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-b border-gray-800 px-5 flex items-center gap-3" style={{ height: '48px' }}>
          <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
            ← Back
          </Link>
          <span className="text-gray-800">│</span>
          <span className="text-sm font-semibold text-gray-300">New Resume</span>

          {formData.name && (
            <span className="text-xs bg-gray-800/80 text-gray-400 px-2.5 py-0.5 rounded-full border border-gray-700">
              {formData.name}
              {formData.jobTitle && <span className="text-gray-600"> · {formData.jobTitle}</span>}
            </span>
          )}

          {/* Rewrite progress indicator */}
          {isRewriting && (
            <div className="flex items-center gap-2 ml-2">
              <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-blue-400 font-medium">{REWRITE_STEPS[stepIdx]}</span>
            </div>
          )}

          {/* New Resume button + inline confirm */}
          <div className="ml-auto relative flex items-center">
            {showClearConfirm ? (
              <div className="flex items-center gap-2 bg-gray-900 border border-red-800 rounded-lg px-3 py-1.5">
                <span className="text-xs text-gray-300">Clear everything?</span>
                <button
                  onClick={() => { reset(); setSaved(false); setShowClearConfirm(false) }}
                  className="text-xs font-bold text-white bg-red-600 hover:bg-red-500 px-2.5 py-0.5 rounded transition-colors"
                >
                  Yes, clear
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-white hover:text-red-300 hover:bg-red-950/40 border border-gray-700 hover:border-red-900 px-3 py-1.5 rounded-lg transition-all"
              >
                <span>✕</span> New Resume
              </button>
            )}
          </div>
        </div>

        {/* ── Three-panel workspace ──────────────────────────────── */}
        <div className="flex-1 flex overflow-hidden">

          {/* LEFT: Form */}
          <div className="w-[370px] flex-shrink-0 border-r border-gray-800 overflow-y-auto p-4">
            <ClientForm />
          </div>

          {/* CENTER: Live preview */}
          <div className="flex-1 overflow-y-auto p-6" style={{ background: '#111318' }}>
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-2xl">
                <ResumePreview />
              </div>
            </div>
          </div>

          {/* RIGHT: Actions panel */}
          <div className="w-[200px] flex-shrink-0 border-l border-gray-800 flex flex-col overflow-y-auto"
            style={{ background: '#0d0f14' }}>

            {/* Template picker */}
            <div className="p-4 border-b border-gray-800">
              <TemplateSelector />
            </div>

            {/* Action buttons */}
            <div className="p-4 flex flex-col gap-2.5">

              {/* Step 1: AI Rewrite */}
              <div>
                <p className="text-xs text-gray-600 mb-1.5 font-medium uppercase tracking-wider">Step 1</p>
                <button
                  onClick={runRewrite}
                  disabled={isRewriting}
                  className="w-full py-3 px-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
                  style={{
                    background: isRewriting ? '#1e3a5f' : '#2563eb',
                    color: '#fff',
                    cursor: isRewriting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isRewriting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>AI Writing…</span>
                    </>
                  ) : (
                    <span className="flex items-center justify-between w-full">
                      <span>▶ AI Rewrite</span>
                      <span className="text-blue-300/50 text-xs font-normal">Ctrl+G</span>
                    </span>
                  )}
                </button>
              </div>

              {/* Step 2: Preview + Download */}
              <div>
                <p className="text-xs text-gray-600 mb-1.5 font-medium uppercase tracking-wider">Step 2</p>
                <button
                  onClick={() => setShowPreview(true)}
                  disabled={!hasResume}
                  className="w-full py-3 px-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5"
                  style={{
                    background: hasResume ? '#0f766e' : '#1a1d27',
                    color: hasResume ? '#fff' : '#374151',
                    cursor: hasResume ? 'pointer' : 'not-allowed',
                    border: hasResume ? 'none' : '1px solid #1f2937',
                  }}
                >
                  <span className="flex items-center justify-between w-full">
                    <span>👁 Preview PDF</span>
                    <span style={{ color: hasResume ? 'rgba(167,243,208,0.5)' : '#374151', fontSize: '11px', fontWeight: 400 }}>Ctrl+E</span>
                  </span>
                </button>
              </div>

              {/* Quick download (skip preview) */}
              <button
                onClick={downloadPDF}
                disabled={!hasResume}
                className="w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: 'transparent',
                  color: hasResume ? '#6b7280' : '#374151',
                  border: `1px solid ${hasResume ? '#374151' : '#1f2937'}`,
                  cursor: hasResume ? 'pointer' : 'not-allowed',
                }}
              >
                ⬇ Quick Download
              </button>

              <div className="h-px bg-gray-800 my-1" />

              {/* Save */}
              <button
                onClick={saveToHistory}
                disabled={!hasResume}
                className="w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: saved ? '#14532d' : 'transparent',
                  color: hasResume ? (saved ? '#4ade80' : '#9ca3af') : '#374151',
                  border: `1px solid ${hasResume ? (saved ? '#166534' : '#374151') : '#1f2937'}`,
                  cursor: hasResume ? 'pointer' : 'not-allowed',
                }}
              >
                {saved ? '✓ Saved' : '💾 Save'}
              </button>
            </div>

            {/* Status card */}
            <div className="px-4 pb-4 mt-auto">
              {hasResume && (
                <div className="rounded-lg p-3 border border-emerald-900 bg-emerald-950/40">
                  <p className="text-emerald-400 text-xs font-bold mb-1">✓ Ready</p>
                  <p className="text-emerald-700 text-xs leading-relaxed">
                    Click <strong className="text-emerald-600">Preview PDF</strong> to check pages before downloading.
                  </p>
                </div>
              )}

              {!resumeData && !isRewriting && (
                <div className="rounded-lg p-3 border border-gray-800 bg-gray-900/30">
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Fill the form → click <strong className="text-gray-500">AI Rewrite</strong> → preview → download.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
