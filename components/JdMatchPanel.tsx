'use client'
import { useMemo, useState } from 'react'
import { useResumeStore } from '@/store/resumeStore'
import { matchJobDescription } from '@/lib/jdMatch'

export default function JdMatchPanel() {
  const resumeData = useResumeStore(s => s.resumeData)
  const formData = useResumeStore(s => s.formData)
  const [jd, setJd] = useState(formData.jobDescription ?? '')
  const [open, setOpen] = useState(false)

  const result = useMemo(
    () => (resumeData && jd.trim().length > 40 ? matchJobDescription(jd, resumeData) : null),
    [jd, resumeData]
  )

  if (!resumeData) return null

  const color = !result ? '#94a3b8'
    : result.score >= 75 ? '#16a34a'
    : result.score >= 50 ? '#d97706'
    : '#dc2626'

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex-shrink-0">
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center text-base flex-shrink-0">
          🎯
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">Job Match</span>
            {result && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color, background: `${color}15` }}>
                {result.score}% match
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {result ? `${result.matched.length}/${result.total} keywords found` : 'Paste a job description to check your match'}
          </p>
        </div>
        <span className="text-slate-400 text-xs">{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div className="border-t border-slate-100 p-4 space-y-3">
          <textarea
            value={jd}
            onChange={e => setJd(e.target.value)}
            placeholder="Paste the job description here…"
            rows={5}
            className="w-full text-xs text-slate-800 placeholder:text-slate-400 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-y"
          />

          {!result && jd.trim().length > 0 && jd.trim().length <= 40 && (
            <p className="text-xs text-slate-400">Paste a bit more of the job description…</p>
          )}

          {result && (
            <>
              {/* Missing keywords — the actionable part */}
              {result.missing.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold text-amber-700 mb-1.5">
                    Missing keywords — add these to boost your match:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missing.map((k, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-emerald-600 font-semibold">🎉 Your resume covers every keyword in this job posting!</p>
              )}

              {/* Matched keywords */}
              {result.matched.length > 0 && (
                <details className="group">
                  <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 list-none">
                    <span className="group-open:hidden">Show {result.matched.length} matched keywords ▸</span>
                    <span className="hidden group-open:inline">Hide matched keywords ▾</span>
                  </summary>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {result.matched.map((k, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ✓ {k}
                      </span>
                    ))}
                  </div>
                </details>
              )}

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tip: weave the missing keywords naturally into your bullets and skills — then re-check. Don&apos;t keyword-stuff.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
