'use client'
import { TEMPLATES } from '@/templates'
import { useResumeStore } from '@/store/resumeStore'
import clsx from 'clsx'

export default function TemplateSelector() {
  const { selectedTemplate, setTemplate } = useResumeStore()

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
        <span className="w-1 h-4 bg-purple-500 rounded-full inline-block" />
        Template
      </h3>
      <div className="space-y-2">
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={() => setTemplate(t.id)}
            className={clsx(
              'w-full text-left px-3 py-2.5 rounded-lg border transition-all',
              selectedTemplate === t.id
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 bg-gray-800/40 hover:border-gray-600'
            )}
          >
            <div className="flex items-center gap-2">
              {/* Color swatch */}
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: t.accentColor }}
              />
              <div>
                <p className={clsx('text-sm font-medium', selectedTemplate === t.id ? 'text-blue-300' : 'text-gray-200')}>
                  {t.name}
                </p>
                <p className="text-xs text-gray-500">{t.description}</p>
              </div>
              {selectedTemplate === t.id && (
                <span className="ml-auto text-blue-400 text-xs font-medium">Active</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
