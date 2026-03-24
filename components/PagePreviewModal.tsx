'use client'
import { useEffect, useRef, useState } from 'react'
import { ResumeData } from '@/lib/types'
import { TEMPLATE_COMPONENTS } from '@/templates'

interface Props {
  resumeData: ResumeData
  templateId: string
  onClose: () => void
  onDownload: () => Promise<void>
}

// A4 page height in mm — this is the exact same unit templates use
const PAGE_H_MM = 297
// 1mm = 96px/25.4 = 3.7795px at standard screen DPI
const MM_TO_PX = 96 / 25.4

export default function PagePreviewModal({ resumeData, templateId, onClose, onDownload }: Props) {
  const TemplateComponent = TEMPLATE_COMPONENTS[templateId] ?? TEMPLATE_COMPONENTS['classic']
  const contentRef = useRef<HTMLDivElement>(null)
  const [pageCount, setPageCount] = useState(1)
  const [downloading, setDownloading] = useState(false)
  const [zoom, setZoom] = useState(0.82)

  // Calculate zoom to fit within viewport width and measure page count
  useEffect(() => {
    const templateWidthPx = 210 * MM_TO_PX // 793px at 96dpi
    const available = window.innerWidth - 80  // 40px padding each side
    setZoom(Math.min(0.95, available / templateWidthPx))
  }, [])

  // Measure actual rendered height → derive page count
  useEffect(() => {
    if (!contentRef.current) return
    const pageHeightPx = PAGE_H_MM * MM_TO_PX
    const h = contentRef.current.scrollHeight
    setPageCount(Math.max(1, Math.ceil(h / pageHeightPx)))
  }, [resumeData, templateId])

  // Escape key to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleDownload() {
    setDownloading(true)
    try { await onDownload() } finally { setDownloading(false) }
  }

  // Page break marker positions: 1 per page boundary (not including top of page 1)
  const breakPositions = Array.from({ length: Math.max(0, pageCount - 1) }, (_, i) => i + 1)

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(3,7,18,0.96)' }}>

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center gap-3 px-5 border-b border-gray-800"
        style={{ height: '52px', background: '#0f1117' }}>

        {/* Left: info */}
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-sm font-semibold text-gray-100">{resumeData.name}</span>
          <span className="text-gray-600">·</span>
          <span className="text-xs text-gray-400">{pageCount} page{pageCount !== 1 ? 's' : ''}</span>
        </div>

        {/* Center: legend */}
        <div className="flex items-center gap-1.5 ml-4 bg-gray-900 rounded px-2.5 py-1">
          <span className="inline-block w-5 h-0.5" style={{
            background: 'repeating-linear-gradient(90deg,#ef4444 0,#ef4444 5px,transparent 5px,transparent 9px)',
          }} />
          <span className="text-xs text-gray-500">page break</span>
        </div>

        {/* Right: actions */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
            style={{ background: downloading ? '#14532d' : '#16a34a', color: '#fff' }}
          >
            {downloading
              ? <><Spinner /> Generating PDF…</>
              : <>⬇ Download PDF</>}
          </button>
          <button
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors"
          >
            ✕ Close  <span className="text-gray-600 ml-1">Esc</span>
          </button>
        </div>
      </div>

      {/* ── Scrollable preview ──────────────────────────────────── */}
      <div className="flex-1 overflow-auto" style={{ background: '#1a1d27' }}>
        <div className="py-8 px-10 flex flex-col items-center">

          {/* Resume + page break overlays, all inside the zoomed wrapper */}
          <div style={{ zoom, position: 'relative', width: '210mm', flexShrink: 0 }}>

            {/* Template renders at natural 210mm width */}
            <div ref={contentRef}>
              <TemplateComponent data={{ ...resumeData, templateId }} />
            </div>

            {/* Page break marker lines + labels */}
            {breakPositions.map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: `${(i + 1) * PAGE_H_MM}mm`,
                  zIndex: 20,
                  pointerEvents: 'none',
                }}
              >
                {/* Dashed red line */}
                <div style={{
                  height: '2px',
                  background: 'repeating-linear-gradient(90deg,#ef4444 0,#ef4444 8px,transparent 8px,transparent 14px)',
                }} />

                {/* Left badge: "End of Page N" */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  transform: 'translateY(-100%)',
                  background: '#7f1d1d',
                  color: '#fca5a5',
                  fontSize: '7.5pt',
                  padding: '2px 8px',
                  fontWeight: 600,
                  letterSpacing: '0.3px',
                  borderRadius: '3px 3px 0 0',
                }}>
                  ↑ End of page {i + 1}
                </div>

                {/* Right badge: "Page N+1 starts" */}
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '2px',
                  background: '#1e3a5f',
                  color: '#93c5fd',
                  fontSize: '7.5pt',
                  padding: '2px 8px',
                  fontWeight: 600,
                  letterSpacing: '0.3px',
                  borderRadius: '0 0 3px 3px',
                }}>
                  Page {i + 2} starts ↓
                </div>
              </div>
            ))}
          </div>

          {/* Page count summary below resume */}
          <div className="mt-6 text-center">
            <span className="text-xs text-gray-600">
              {pageCount} page{pageCount !== 1 ? 's' : ''} total · Press Esc to close
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <span
      className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"
    />
  )
}
