'use client'
import { useMemo, useState } from 'react'
import { useResumeStore } from '@/store/resumeStore'
import { scoreResume, ScoreCheck } from '@/lib/resumeScore'

export default function ResumeScorePanel() {
  const resumeData = useResumeStore(s => s.resumeData)
  const [open, setOpen] = useState(true)

  const result = useMemo(() => (resumeData ? scoreResume(resumeData) : null), [resumeData])
  if (!result) return null

  const { score, grade, checks, passed, total } = result
  const color = score >= 85 ? '#16a34a' : score >= 70 ? '#2563eb' : score >= 50 ? '#d97706' : '#dc2626'
  const ring = `conic-gradient(${color} ${score * 3.6}deg, #e2e8f0 0deg)`

  const issues = checks.filter(c => c.status !== 'pass')

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex-shrink-0">
      {/* Header — score ring + grade */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div
          className="relative flex-shrink-0 rounded-full flex items-center justify-center"
          style={{ width: 52, height: 52, background: ring }}
        >
          <div className="absolute inset-[4px] bg-white rounded-full flex items-center justify-center">
            <span className="text-sm font-bold" style={{ color }}>{score}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">Resume Strength</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color, background: `${color}15` }}>
              {grade}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{passed}/{total} checks passed</p>
        </div>
        <span className="text-slate-400 text-xs">{open ? '▾' : '▸'}</span>
      </button>

      {/* Checklist */}
      {open && (
        <div className="border-t border-slate-100 divide-y divide-slate-100">
          {issues.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-emerald-600 font-semibold">🎉 Everything looks great!</p>
              <p className="text-xs text-slate-500 mt-1">Your resume passes all strength checks.</p>
            </div>
          ) : (
            <>
              <div className="px-4 py-2 bg-amber-50">
                <p className="text-xs text-amber-700 font-medium">{issues.length} thing{issues.length > 1 ? 's' : ''} to improve</p>
              </div>
              {issues.map(c => <CheckRow key={c.id} check={c} />)}
            </>
          )}
          {/* Passed checks, collapsed summary */}
          <details className="group">
            <summary className="px-4 py-2 text-xs text-slate-400 cursor-pointer hover:text-slate-600 list-none flex items-center gap-1">
              <span className="group-open:hidden">Show {checks.filter(c => c.status === 'pass').length} passed checks ▸</span>
              <span className="hidden group-open:inline">Hide passed checks ▾</span>
            </summary>
            <div className="divide-y divide-slate-100">
              {checks.filter(c => c.status === 'pass').map(c => <CheckRow key={c.id} check={c} />)}
            </div>
          </details>
        </div>
      )}
    </div>
  )
}

function CheckRow({ check }: { check: ScoreCheck }) {
  const icon = check.status === 'pass' ? '✓' : check.status === 'warn' ? '!' : '✕'
  const cls =
    check.status === 'pass' ? 'bg-emerald-100 text-emerald-600'
    : check.status === 'warn' ? 'bg-amber-100 text-amber-600'
    : 'bg-red-100 text-red-600'

  return (
    <div className="flex items-start gap-2.5 px-4 py-2.5">
      <span className={`w-4 h-4 mt-0.5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${cls}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className={`text-xs ${check.status === 'pass' ? 'text-slate-600' : 'text-slate-800 font-medium'}`}>
          {check.label}
        </p>
        {check.tip && <p className="text-xs text-slate-500 mt-0.5">{check.tip}</p>}
      </div>
    </div>
  )
}
