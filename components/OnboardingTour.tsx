'use client'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'fps-onboarding-done'

interface Step {
  icon: string
  title: string
  body: string
}

const STEPS: Step[] = [
  {
    icon: '👋',
    title: 'Welcome to FreelancePro Studio',
    body: 'Turn rough notes into a polished, ATS-friendly resume in a few minutes. Here is the 4-step flow.',
  },
  {
    icon: '▣',
    title: '1. Pick a template',
    body: 'Choose from 11 professional designs. You can switch templates anytime — your content stays intact.',
  },
  {
    icon: '✎',
    title: '2. Add your details',
    body: 'Fill the form, or use Smart Paste to drop in raw text (a WhatsApp message, an old CV) and auto-fill every field.',
  },
  {
    icon: '✦',
    title: '3. Let AI rewrite',
    body: 'One click turns your notes into polished, quantified bullet points. Use the ↻ buttons to regenerate any single section.',
  },
  {
    icon: '⬇',
    title: '4. Review & export',
    body: 'Check your strength score, match against a job posting, generate a cover letter, then download your PDF. Edits auto-save as you go.',
  },
]

export default function OnboardingTour() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  // Show only on first visit (per browser).
  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
    } catch { /* localStorage unavailable — skip the tour */ }
  }, [])

  function finish() {
    try { localStorage.setItem(STORAGE_KEY, '1') } catch {}
    setVisible(false)
  }

  if (!visible) return null

  const s = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onClick={finish}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-7 text-center">
          <div className="text-4xl mb-3">{s.icon}</div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">{s.title}</h2>
          <p className="text-sm text-slate-500 leading-relaxed">{s.body}</p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 pb-4">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === step ? 'w-5 bg-blue-600' : 'w-1.5 bg-slate-300'}`}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={finish}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="text-sm text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={() => (isLast ? finish() : setStep(s => s + 1))}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-1.5 rounded-lg transition-colors"
            >
              {isLast ? 'Get started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
