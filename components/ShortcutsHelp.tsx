'use client'
import { useEffect, useState } from 'react'

interface Shortcut { keys: string[]; label: string }

const SHORTCUTS: Shortcut[] = [
  { keys: ['Ctrl', 'G'], label: 'Run AI rewrite' },
  { keys: ['Ctrl', 'E'], label: 'Preview all pages' },
  { keys: ['?'], label: 'Show this shortcuts help' },
  { keys: ['Esc'], label: 'Close dialogs' },
]

const TIPS = [
  'Click any text in the preview to edit it directly.',
  'Use the ↻ buttons to regenerate a single section.',
  'Your edits auto-save as you type.',
]

function isTyping(el: EventTarget | null): boolean {
  const node = el as HTMLElement | null
  if (!node) return false
  const tag = node.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || node.isContentEditable
}

export default function ShortcutsHelp() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setOpen(false); return }
      // "?" is Shift+/ — only when NOT typing in a field
      if (e.key === '?' && !isTyping(e.target)) {
        e.preventDefault()
        setOpen(o => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      {/* Discoverable trigger — always visible in the top bar */}
      <button
        onClick={() => setOpen(true)}
        title="Keyboard shortcuts (?)"
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-2.5 py-1 rounded-lg transition-colors"
      >
        <span className="text-sm leading-none">⌨</span>
        <span className="hidden md:inline">Shortcuts</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800">Keyboard Shortcuts</h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700 text-lg leading-none">×</button>
            </div>

            <div className="px-5 py-4 space-y-2.5">
              {SHORTCUTS.map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{s.label}</span>
                  <span className="flex items-center gap-1">
                    {s.keys.map((k, j) => (
                      <kbd key={j} className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-300 rounded px-1.5 py-0.5 min-w-[22px] text-center">
                        {k}
                      </kbd>
                    ))}
                  </span>
                </div>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Tips</p>
              <ul className="space-y-1.5">
                {TIPS.map((t, i) => (
                  <li key={i} className="text-xs text-slate-500 flex gap-2">
                    <span className="text-slate-300">•</span>{t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
