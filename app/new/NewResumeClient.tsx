'use client'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useResumeStore } from '@/store/resumeStore'
import ClientForm from '@/components/ClientForm'
import TemplateSelector from '@/components/TemplateSelector'
import ResumePreview, { getResumeHTML } from '@/components/ResumePreview'
import { ResumeData, SavedResume } from '@/lib/types'

export default function NewResumeClient() {
  const searchParams = useSearchParams()
  const loadId = searchParams.get('load')

  const {
    formData, resumeData, selectedTemplate,
    setResumeData, setIsRewriting, setRewriteStatus,
    isRewriting, reset,
  } = useResumeStore()

  // Load saved resume if ?load= param is present
  useEffect(() => {
    if (loadId) {
      fetch(`/api/save`)
        .then(async (r) => {
          if (!r.ok) return null
          const text = await r.text()
          if (!text) return null
          try {
            return JSON.parse(text) as { resumes?: SavedResume[] }
          } catch {
            return null
          }
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

    setIsRewriting(true)
    setRewriteStatus('Sending to AI...')

    try {
      setRewriteStatus('AI is rewriting all sections in parallel...')

      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const errText = await res.text()
        if (!errText) {
          throw new Error('Rewrite failed')
        }
        try {
          const err = JSON.parse(errText) as { error?: string }
          throw new Error(err.error ?? 'Rewrite failed')
        } catch {
          throw new Error(errText)
        }
      }

      const payloadText = await res.text()
      if (!payloadText) {
        throw new Error('Rewrite failed: empty response from server')
      }

      let payload: { resumeData: ResumeData }
      try {
        payload = JSON.parse(payloadText) as { resumeData: ResumeData }
      } catch {
        throw new Error('Rewrite failed: invalid JSON response from server')
      }

      const { resumeData: newData, warning } = payload as { resumeData: ResumeData; warning?: string }
      setResumeData({ ...newData, templateId: selectedTemplate })
      setRewriteStatus(warning ? `Done (fallback mode)` : 'Done!')
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

    if (!res.ok) {
      alert('PDF generation failed. Make sure Puppeteer is installed.')
      return
    }

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

    alert('Saved to history!')
  }

  return (
    <div className="h-screen bg-gray-950 text-gray-100 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex-shrink-0 border-b border-gray-800 px-5 py-3 flex items-center gap-4">
        <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
          ← Dashboard
        </Link>
        <span className="text-gray-700">|</span>
        <h1 className="text-sm font-semibold text-gray-200">New Resume</h1>
        {formData.name && (
          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
            {formData.name} · {formData.jobTitle || 'No job title'}
          </span>
        )}
        <button
          onClick={reset}
          className="ml-auto text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          Clear form
        </button>
      </div>

      {/* Three-panel layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT: Client Form */}
        <div className="w-[380px] flex-shrink-0 border-r border-gray-800 overflow-y-auto p-4">
          <ClientForm />
        </div>

        {/* CENTER: Preview */}
        <div className="flex-1 overflow-y-auto bg-gray-900/50 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
              <ResumePreview />
            </div>
          </div>
        </div>

        {/* RIGHT: Actions */}
        <div className="w-[220px] flex-shrink-0 border-l border-gray-800 p-4 flex flex-col gap-5 overflow-y-auto">

          {/* Template selector */}
          <TemplateSelector />

          <div className="border-t border-gray-800 pt-4 flex flex-col gap-3">
            {/* Run AI Rewrite */}
            <button
              onClick={runRewrite}
              disabled={isRewriting}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
            >
              {isRewriting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Rewriting...
                </>
              ) : (
                '▶ Run AI Rewrite'
              )}
            </button>

            {/* Download PDF */}
            <button
              onClick={downloadPDF}
              disabled={!resumeData || isRewriting}
              className="w-full bg-green-700 hover:bg-green-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm"
            >
              ⬇ Download PDF
            </button>

            {/* Save to history */}
            <button
              onClick={saveToHistory}
              disabled={!resumeData || isRewriting}
              className="w-full border border-gray-700 hover:border-gray-500 disabled:border-gray-800 disabled:text-gray-700 disabled:cursor-not-allowed text-gray-300 hover:text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
            >
              💾 Save Client
            </button>
          </div>

          {/* Status / tips */}
          {resumeData && !isRewriting && (
            <div className="border border-green-800 bg-green-900/20 rounded-lg p-3">
              <p className="text-green-400 text-xs font-semibold mb-1">✓ Resume ready</p>
              <p className="text-green-600 text-xs">
                You can switch templates — no need to rerun AI.
              </p>
            </div>
          )}

          {!resumeData && !isRewriting && (
            <div className="border border-gray-800 rounded-lg p-3">
              <p className="text-gray-500 text-xs leading-relaxed">
                <strong className="text-gray-400">Tip:</strong> Fill in the form on the left, then click "Run AI Rewrite". The entire process takes ~15 seconds.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
