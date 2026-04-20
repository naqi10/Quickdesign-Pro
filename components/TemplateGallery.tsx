'use client'
import { useState } from 'react'
import { TEMPLATES } from '@/templates'
import { useResumeStore } from '@/store/resumeStore'
import { THUMB_COMPONENTS } from '@/components/TemplateThumbs'
import { getRecommendedTemplates } from '@/lib/templateRecommender'
import clsx from 'clsx'

// Industry tags per template
const TEMPLATE_TAGS: Record<string, string[]> = {
  'classic':      ['Finance', 'Law', 'Academia', 'Banking'],
  'modern':       ['Tech', 'Marketing', 'Sales'],
  'minimal':      ['Any Industry', 'Clean', 'Simple'],
  'ats-pro':      ['ATS Optimized', 'Any Industry', 'Job Portals', 'Govt'],
  'sidebar':      ['Creative', 'Design', 'Standout'],
  'tech-clean':   ['Tech', 'Software', 'Engineering'],
  'harvard':      ['Law', 'Academia', 'Teaching', 'Govt', 'Medical'],
  'executive':    ['Management', 'Finance', 'Banking', 'Director'],
  'fresher':      ['Fresh Grad', 'Student', 'Entry Level', 'Internship'],
  'google-style': ['Tech', 'Software', 'Engineering', 'Product'],
  'dubai-gold':   ['Gulf', 'Pakistan', 'Premium', 'Any Industry'],
}

const ALL_TAGS = ['All', 'Tech', 'Law', 'Teaching', 'Medical', 'Management', 'Fresh Grad', 'Finance', 'Govt', 'Gulf', 'ATS Optimized']

interface Props {
  onSelect?: () => void // called after picking a template (e.g. advance wizard step)
}

export default function TemplateGallery({ onSelect }: Props) {
  const { selectedTemplate, setTemplate, formData } = useResumeStore()
  const [activeTag, setActiveTag] = useState('All')

  const recommendations = getRecommendedTemplates(formData?.jobTitle ?? '')
  const recommendedIds = new Set(recommendations.map(r => r.templateId))
  const recommendedReasonMap = Object.fromEntries(recommendations.map(r => [r.templateId, r.reason]))

  const filtered = TEMPLATES.filter(t =>
    activeTag === 'All' || (TEMPLATE_TAGS[t.id] ?? []).includes(activeTag)
  )

  function pick(id: string) {
    setTemplate(id)
    onSelect?.()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-slate-200">
        <h2 className="text-base font-bold text-slate-800 mb-1">Choose a Template</h2>
        <p className="text-xs text-slate-500">Pick the layout that fits your industry, then fill in your details.</p>
      </div>

      {/* Filter tags */}
      <div className="px-5 py-3 flex gap-2 flex-wrap border-b border-slate-100">
        {ALL_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={clsx(
              'px-3 py-1 rounded-full text-xs font-medium transition-all border',
              activeTag === tag
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-600'
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Template cards grid */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-slate-50">
        {/* Recommended banner */}
        {recommendedIds.size > 0 && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2">
            <span className="text-amber-500 text-xs">✦</span>
            <span className="text-amber-700 text-xs">
              Recommended for <strong>&ldquo;{formData?.jobTitle}&rdquo;</strong> — highlighted below
            </span>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          {filtered.map(t => {
            const Thumb = THUMB_COMPONENTS[t.id]
            const active = selectedTemplate === t.id
            const tags = TEMPLATE_TAGS[t.id] ?? []
            const isRecommended = recommendedIds.has(t.id)

            return (
              <button
                key={t.id}
                onClick={() => pick(t.id)}
                className={clsx(
                  'group relative flex flex-col items-center text-center rounded-xl border transition-all duration-200 overflow-hidden',
                  active
                    ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100'
                    : isRecommended
                    ? 'border-amber-300 bg-amber-50/60 hover:border-amber-400'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                )}
              >
                {/* Active badge */}
                {active && (
                  <span className="absolute top-2 right-2 z-10 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    Active
                  </span>
                )}
                {/* Recommended badge */}
                {!active && isRecommended && (
                  <span className="absolute top-2 left-2 z-10 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    ✦ Best fit
                  </span>
                )}

                {/* Thumbnail */}
                <div className={clsx(
                  'mt-4 mb-3 rounded-lg overflow-hidden shadow-md transition-transform duration-200 group-hover:scale-[1.03]',
                  active ? 'ring-2 ring-blue-400' : 'ring-1 ring-slate-200'
                )}>
                  {Thumb && <Thumb active={active} width={110} height={142} />}
                </div>

                {/* Name */}
                <p className={clsx(
                  'text-sm font-semibold px-2',
                  active ? 'text-blue-700' : 'text-slate-800'
                )}>
                  {t.name}
                </p>

                {/* Description */}
                <p className="text-[11px] text-slate-500 px-2 mt-0.5 leading-tight">
                  {t.description}
                </p>
                {/* Recommendation reason */}
                {isRecommended && recommendedReasonMap[t.id] && (
                  <p className="text-[10px] text-amber-600 px-2 mt-1 leading-tight italic">
                    {recommendedReasonMap[t.id]}
                  </p>
                )}

                {/* Industry tags */}
                <div className="flex flex-wrap justify-center gap-1 px-2 py-2.5 mt-1">
                  {tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 leading-none border border-slate-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">
            No templates match this filter.
          </div>
        )}
      </div>
    </div>
  )
}
