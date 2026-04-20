'use client'
import { TEMPLATES } from '@/templates'
import { useResumeStore } from '@/store/resumeStore'
import { THUMB_COMPONENTS } from '@/components/TemplateThumbs'
import clsx from 'clsx'

// Compact sidebar selector — used as a quick-switch inside the preview toolbar if needed.
export default function TemplateSelector() {
  const { selectedTemplate, setTemplate } = useResumeStore()

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
        <span className="w-1 h-4 bg-purple-500 rounded-full inline-block" />
        Template
      </h3>
      <div className="space-y-2">
        {TEMPLATES.map(t => {
          const Thumb = THUMB_COMPONENTS[t.id]
          const active = selectedTemplate === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={clsx(
                'w-full text-left px-2.5 py-2 rounded-lg border transition-all',
                active
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700 bg-gray-800/40 hover:border-gray-600'
              )}
            >
              <div className="flex items-center gap-2.5">
                <div className={clsx(
                  'flex-shrink-0 rounded overflow-hidden shadow-sm',
                  active ? 'ring-1 ring-blue-400' : 'ring-1 ring-gray-700'
                )}>
                  {Thumb && <Thumb active={active} width={48} height={62} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={clsx('text-sm font-medium', active ? 'text-blue-300' : 'text-gray-200')}>
                    {t.name}
                  </p>
                  <p className="text-xs text-gray-500 leading-tight">{t.description}</p>
                  {active && <span className="text-xs text-blue-400 font-medium">Active</span>}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
