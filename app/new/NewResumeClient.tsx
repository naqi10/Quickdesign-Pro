'use client'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useResumeStore } from '@/store/resumeStore'
import ClientForm from '@/components/ClientForm'
import TemplateGallery from '@/components/TemplateGallery'
import ResumePreview, { getResumeHTML } from '@/components/ResumePreview'
import PagePreviewModal from '@/components/PagePreviewModal'
import RerollBar from '@/components/RerollBar'
import { ResumeData, SavedResume } from '@/lib/types'

const REWRITE_STEPS = [
  'Extracting keywords…',
  'Rewriting summary…',
  'Rewriting experience bullets…',
  'Formatting skills…',
  'Finalising resume…',
]

type WizardStep = 1 | 2 | 3 | 4

const STEPS = [
  { n: 1 as WizardStep, label: 'Template',   icon: '▣' },
  { n: 2 as WizardStep, label: 'Details',    icon: '✎' },
  { n: 3 as WizardStep, label: 'AI Rewrite', icon: '✦' },
  { n: 4 as WizardStep, label: 'Export',     icon: '⬇' },
]

export default function NewResumeClient() {
  const searchParams = useSearchParams()
  const loadId = searchParams.get('load')

  const {
    formData, resumeData, selectedTemplate,
    setResumeData, setIsRewriting, setRewriteStatus,
    isRewriting, reset, _hasHydrated,
  } = useResumeStore()

  const [wizardStep, setWizardStep] = useState<WizardStep>(1)
  const [showPreview, setShowPreview] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [stepIdx, setStepIdx] = useState(0)
  const [saved, setSaved] = useState(false)
  const [zoom, setZoom] = useState(72) // percent
  const [pdfLoading, setPdfLoading] = useState(false)
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const [pageCount, setPageCount] = useState(1)

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!e.ctrlKey) return
      if (e.key === 'g' || e.key === 'G') { e.preventDefault(); if (!isRewriting) runRewrite() }
      else if (e.key === 'e' || e.key === 'E') { e.preventDefault(); if (resumeData && !isRewriting) setShowPreview(true) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRewriting, resumeData])

  // Cycle step messages during rewrite
  useEffect(() => {
    if (!isRewriting) { setStepIdx(0); return }
    const id = setInterval(() => setStepIdx(i => (i + 1) % REWRITE_STEPS.length), 3000)
    return () => clearInterval(id)
  }, [isRewriting])

  // Auto-advance to Export step after rewrite completes
  useEffect(() => {
    if (!isRewriting && resumeData) {
      setWizardStep(4)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRewriting])

  // Estimate page count from rendered height
  useEffect(() => {
    if (!previewContainerRef.current) return
    const el = previewContainerRef.current.querySelector('#resume-output') as HTMLElement | null
    if (!el) return
    const A4_PX = 1122 // 297mm at 96dpi
    const rawH = el.scrollHeight / (zoom / 100)
    setPageCount(Math.max(1, Math.ceil(rawH / A4_PX)))
  })

  // Load saved resume
  useEffect(() => {
    if (!loadId) return
    fetch('/api/save')
      .then(async r => {
        if (!r.ok) return null
        const text = await r.text()
        if (!text) return null
        try { return JSON.parse(text) as { resumes?: SavedResume[] } } catch { return null }
      })
      .then(payload => {
        const found = payload?.resumes?.find((r: SavedResume) => r.id === loadId)
        if (found) { setResumeData(found.resumeData); setWizardStep(4) }
      })
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
      if (!payloadText) throw new Error('Empty response')
      const { resumeData: newData, warning } = JSON.parse(payloadText) as { resumeData: ResumeData; warning?: string }
      const finalData = { ...newData, templateId: selectedTemplate }
      setResumeData(finalData)
      if (warning) alert(`Note: ${warning}`)
      // Auto-save to history
      const record: SavedResume = {
        id: `${Date.now()}`,
        clientName: finalData.name,
        jobTitle: finalData.jobTitle,
        createdAt: new Date().toISOString(),
        resumeData: finalData,
      }
      await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      })
      setSaved(true)
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsRewriting(false)
      setRewriteStatus('')
    }
  }

  async function downloadPDF() {
    if (!resumeData) return
    setPdfLoading(true)
    const html = getResumeHTML(resumeData, selectedTemplate)
    const filename = `${resumeData.name.replace(/\s+/g, '_')}_Resume`
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html, filename }),
      })
      if (!res.ok) { alert('PDF generation failed.'); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `${filename}.pdf`; a.click()
      URL.revokeObjectURL(url)
    } finally {
      setPdfLoading(false)
    }
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

  // Render the currently selected template for page-count preview
  if (!_hasHydrated) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-sm">Loading workspace…</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {showPreview && resumeData && (
        <PagePreviewModal
          resumeData={{ ...resumeData, templateId: selectedTemplate }}
          templateId={selectedTemplate}
          onClose={() => setShowPreview(false)}
          onDownload={downloadPDF}
        />
      )}

      <div className="h-screen bg-slate-50 text-slate-900 flex flex-col overflow-hidden">

        {/* ── Top bar ──────────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-b border-slate-200 bg-white px-5 flex items-center gap-3" style={{ height: '48px' }}>
          <Link href="/" className="text-slate-400 hover:text-slate-700 text-sm transition-colors flex items-center gap-1">
            ← Back
          </Link>
          <span className="text-slate-200">│</span>

          {/* App name */}
          <span className="text-sm font-bold text-slate-800 tracking-tight">FreelancePro <span className="text-blue-600">Studio</span></span>

          {/* Active client chip */}
          {formData.name && (
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200">
              {formData.name}
              {formData.jobTitle && <span className="text-slate-400"> · {formData.jobTitle}</span>}
            </span>
          )}

          {/* AI progress */}
          {isRewriting && (
            <div className="flex items-center gap-2 ml-1">
              <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-blue-600 font-medium">{REWRITE_STEPS[stepIdx]}</span>
            </div>
          )}

          {/* New Resume / confirm */}
          <div className="ml-auto flex items-center">
            {showClearConfirm ? (
              <div className="flex items-center gap-2 bg-white border border-red-200 rounded-lg px-3 py-1.5 shadow-sm">
                <span className="text-xs text-slate-700">Clear everything?</span>
                <button
                  onClick={() => { reset(); setSaved(false); setShowClearConfirm(false); setWizardStep(1) }}
                  className="text-xs font-bold text-white bg-red-600 hover:bg-red-500 px-2.5 py-0.5 rounded transition-colors"
                >Yes, clear</button>
                <button onClick={() => setShowClearConfirm(false)} className="text-xs text-slate-400 hover:text-slate-700">Cancel</button>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition-all"
              >
                ✕ New Resume
              </button>
            )}
          </div>
        </div>

        {/* ── Step wizard bar ──────────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-b border-slate-200 bg-white px-6 flex items-center gap-0" style={{ height: '52px' }}>
          {STEPS.map((s, i) => {
            const done = s.n < wizardStep || (s.n === 3 && hasResume)
            const active = s.n === wizardStep
            const locked = s.n > wizardStep && !(s.n === 3 && hasResume) && !(s.n === 4 && hasResume)
            return (
              <div key={s.n} className="flex items-center">
                <button
                  onClick={() => !locked && setWizardStep(s.n)}
                  disabled={locked}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : done
                      ? 'text-emerald-600 hover:bg-emerald-50 cursor-pointer'
                      : locked
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    active ? 'bg-blue-600 text-white'
                    : done ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-slate-100 text-slate-400'
                  }`}>
                    {done && !active ? '✓' : s.n}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <span className="w-8 h-px bg-slate-200 mx-1 flex-shrink-0" />
                )}
              </div>
            )
          })}

          {/* Right: step hint */}
          <div className="ml-auto text-xs text-slate-400 hidden md:block">
            {wizardStep === 1 && 'Select a template to start'}
            {wizardStep === 2 && 'Fill in your details — or use Smart Paste'}
            {wizardStep === 3 && 'Run AI to professionally rewrite your content'}
            {wizardStep === 4 && 'Preview, then download your PDF'}
          </div>
        </div>

        {/* ── Main workspace ───────────────────────────────────────────────── */}
        <div className="flex-1 flex overflow-hidden">

          {/* ── LEFT PANEL — changes per step ──────────────────────────────── */}
          <div
            className="flex-shrink-0 border-r border-slate-200 bg-white flex flex-col overflow-hidden"
            style={{ width: '420px' }}
          >
            {/* Step 1: Template Gallery */}
            {wizardStep === 1 && (
              <div className="flex-1 overflow-hidden flex flex-col">
                <TemplateGallery onSelect={() => setWizardStep(2)} />
                {/* Next CTA */}
                <div className="p-4 border-t border-slate-200 flex-shrink-0 bg-white">
                  <button
                    onClick={() => setWizardStep(2)}
                    className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors"
                  >
                    Next: Fill Details →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Details Form */}
            {wizardStep === 2 && (
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-10">
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">Your Details</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Fill in or paste raw text via Smart Paste</p>
                  </div>
                  <button onClick={() => setWizardStep(3)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium border border-blue-200 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-all">
                    Next: AI Rewrite →
                  </button>
                </div>
                <div className="p-4 bg-slate-50">
                  <ClientForm />
                </div>
              </div>
            )}

            {/* Step 3: AI Rewrite Panel */}
            {wizardStep === 3 && (
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
                <div>
                  <h2 className="text-sm font-bold text-slate-800 mb-1">AI Rewrite</h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    AI reads your raw details and rewrites every section — summary, bullets, and skills — professionally in about 10 seconds.
                  </p>
                </div>

                {/* Checklist */}
                <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 shadow-sm">
                  {[
                    { label: 'Name & Job Title', ok: !!(formData.name && formData.jobTitle) },
                    { label: 'Work Experience', ok: formData.experiences.some(e => e.rawDuties.trim()) },
                    { label: 'Skills', ok: !!formData.rawSkills.trim() },
                    { label: 'Education', ok: formData.education.some(e => e.degree.trim()) },
                    { label: 'Job Description (optional)', ok: !!formData.jobDescription?.trim() },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3 px-4 py-3">
                      <span className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold
                        ${item.ok ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        {item.ok ? '✓' : '○'}
                      </span>
                      <span className={`text-xs ${item.ok ? 'text-slate-700' : 'text-slate-400'}`}>{item.label}</span>
                      {!item.ok && item.label !== 'Job Description (optional)' && (
                        <button onClick={() => setWizardStep(2)}
                          className="ml-auto text-[10px] text-blue-500 hover:text-blue-700">Fill in →</button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Run button */}
                <button
                  onClick={runRewrite}
                  disabled={isRewriting || !formData.name || !formData.jobTitle}
                  className="w-full py-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2.5"
                  style={{
                    background: isRewriting ? '#1e40af' : (!formData.name || !formData.jobTitle) ? '#f1f5f9' : '#2563eb',
                    color: (!formData.name || !formData.jobTitle) ? '#94a3b8' : '#fff',
                    cursor: isRewriting || !formData.name || !formData.jobTitle ? 'not-allowed' : 'pointer',
                    border: (!formData.name || !formData.jobTitle) ? '1px solid #e2e8f0' : 'none',
                  }}
                >
                  {isRewriting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{REWRITE_STEPS[stepIdx]}</span>
                    </>
                  ) : (
                    <>
                      <span>✦</span>
                      <span>Run AI Rewrite</span>
                      <span className="text-blue-200 text-xs font-normal ml-auto">Ctrl+G</span>
                    </>
                  )}
                </button>

                {hasResume && (
                  <div className="rounded-lg p-3 border border-emerald-200 bg-emerald-50 text-center">
                    <p className="text-emerald-700 text-xs font-bold">✓ Resume ready</p>
                    <button onClick={() => setWizardStep(4)} className="text-xs text-emerald-600 hover:text-emerald-800 mt-1">
                      Go to Export →
                    </button>
                  </div>
                )}

                <button onClick={() => setWizardStep(2)} className="text-xs text-slate-400 hover:text-slate-600 text-center">
                  ← Back to Details
                </button>
              </div>
            )}

            {/* Step 4: Export Panel */}
            {wizardStep === 4 && (
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-800 mb-1">Export Resume</h2>
                  <p className="text-xs text-slate-500">Preview your pages then download as PDF.</p>
                </div>

                {/* Resume summary card */}
                {resumeData && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-800">{resumeData.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{resumeData.jobTitle}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-slate-400">{pageCount} page{pageCount !== 1 ? 's' : ''}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-400">{selectedTemplate} template</span>
                    </div>
                  </div>
                )}

                {/* Preview button */}
                <button
                  onClick={() => setShowPreview(true)}
                  disabled={!hasResume}
                  className="w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                  style={{
                    background: hasResume ? '#0d9488' : '#f1f5f9',
                    color: hasResume ? '#fff' : '#94a3b8',
                    cursor: hasResume ? 'pointer' : 'not-allowed',
                    border: hasResume ? 'none' : '1px solid #e2e8f0',
                  }}
                >
                  <span>👁</span>
                  <span>Preview All Pages</span>
                  <span style={{ color: hasResume ? 'rgba(167,243,208,0.7)' : '#94a3b8', fontSize: '11px', fontWeight: 400, marginLeft: 'auto' }}>Ctrl+E</span>
                </button>

                {/* Download PDF */}
                <button
                  onClick={downloadPDF}
                  disabled={!hasResume || pdfLoading}
                  className="w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                  style={{
                    background: hasResume ? '#2563eb' : '#f1f5f9',
                    color: hasResume ? '#fff' : '#94a3b8',
                    cursor: hasResume ? 'pointer' : 'not-allowed',
                  }}
                >
                  {pdfLoading ? (
                    <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Generating…</span></>
                  ) : (
                    <><span>⬇</span><span>Download PDF</span></>
                  )}
                </button>

                <div className="h-px bg-slate-200" />

                {/* Save to history */}
                <button
                  onClick={saveToHistory}
                  disabled={!hasResume || saved}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all border"
                  style={{
                    background: saved ? '#f0fdf4' : 'transparent',
                    color: hasResume ? (saved ? '#16a34a' : '#64748b') : '#cbd5e1',
                    borderColor: hasResume ? (saved ? '#bbf7d0' : '#e2e8f0') : '#f1f5f9',
                    cursor: (hasResume && !saved) ? 'pointer' : 'not-allowed',
                  }}
                >
                  {saved ? '✓ Auto-saved to History' : '💾 Save to History'}
                </button>

                {/* Change template quick-link */}
                <button
                  onClick={() => setWizardStep(1)}
                  className="text-xs text-slate-400 hover:text-slate-600 text-center transition-colors"
                >
                  ← Change Template
                </button>

                {/* Re-run AI */}
                <button
                  onClick={() => setWizardStep(3)}
                  className="text-xs text-slate-400 hover:text-slate-600 text-center transition-colors"
                >
                  ↺ Edit Details / Re-run AI
                </button>
              </div>
            )}
          </div>

          {/* ── RIGHT PANEL — live preview, always visible ──────────────────── */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">

            {/* Preview toolbar */}
            <div className="flex-shrink-0 flex items-center gap-4 px-5 py-2 border-b border-slate-200 bg-white"
              style={{ height: '42px' }}>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Preview</span>

              <div className="flex items-center gap-2 ml-auto">
                {/* Page count badge */}
                {resumeData && (
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {pageCount} page{pageCount !== 1 ? 's' : ''}
                  </span>
                )}

                {/* Zoom controls */}
                <button onClick={() => setZoom(z => Math.max(40, z - 10))}
                  className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs flex items-center justify-center border border-slate-200">−</button>
                <span className="text-xs text-slate-500 w-9 text-center">{zoom}%</span>
                <button onClick={() => setZoom(z => Math.min(130, z + 10))}
                  className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs flex items-center justify-center border border-slate-200">+</button>
                <button onClick={() => setZoom(72)}
                  className="text-xs text-slate-400 hover:text-slate-700 px-1.5">Reset</button>
              </div>
            </div>

            {/* AI Re-roll bar — per-section regenerate buttons */}
            <RerollBar />

            {/* Scrollable A4 preview area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-4" ref={previewContainerRef}>
              <div
                style={{
                  zoom: `${zoom}%`,
                  transformOrigin: 'top center',
                  margin: '0 auto',
                  width: '210mm',
                }}
              >
                {/* Editable hint banner */}
                {resumeData && (
                  <div style={{
                    background: 'rgba(59,130,246,0.90)',
                    color: '#fff',
                    fontSize: '11px',
                    padding: '5px 12px',
                    textAlign: 'center',
                    letterSpacing: '0.3px',
                    borderRadius: '6px 6px 0 0',
                  }}>
                    ✎ Click any text to edit directly — changes saved instantly
                  </div>
                )}
                {/* A4 page container — shows page boundary lines */}
                <div style={{ position: 'relative' }}>
                  <div style={{
                    background: 'white',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
                    borderRadius: resumeData ? '0 0 6px 6px' : '6px',
                    overflow: 'hidden',
                  }}>
                    <ResumePreview />
                  </div>
                  {/* Page break indicator overlay — dashed red line at every 297mm */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '-12px',
                    right: '-12px',
                    bottom: 0,
                    pointerEvents: 'none',
                    backgroundImage: `repeating-linear-gradient(to bottom,
                      transparent 0,
                      transparent calc(297mm - 1px),
                      rgba(239, 68, 68, 0.35) calc(297mm - 1px),
                      rgba(239, 68, 68, 0.35) calc(297mm + 1px),
                      transparent calc(297mm + 1px))`,
                  }} />
                  {/* Page labels at each boundary */}
                  {Array.from({ length: Math.max(1, pageCount) }, (_, i) => (
                    <div key={i} style={{
                      position: 'absolute',
                      top: `calc(${i} * 297mm + 4px)`,
                      right: '-48px',
                      fontSize: '10px',
                      color: '#94a3b8',
                      fontWeight: '600',
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}>
                      P{i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
