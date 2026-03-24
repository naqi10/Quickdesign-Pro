'use client'
import { TEMPLATES } from '@/templates'
import { useResumeStore } from '@/store/resumeStore'
import clsx from 'clsx'

// Mini SVG thumbnails representing each template layout
function ClassicThumb({ active }: { active: boolean }) {
  const accent = active ? '#3b82f6' : '#1a365d'
  return (
    <svg width="48" height="62" viewBox="0 0 48 62" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="62" rx="2" fill="white" />
      {/* Name bar */}
      <rect x="8" y="6" width="32" height="4" rx="1" fill={accent} />
      {/* Job title */}
      <rect x="12" y="12" width="24" height="2" rx="1" fill="#94a3b8" />
      {/* Divider */}
      <rect x="4" y="17" width="40" height="0.5" fill="#e2e8f0" />
      {/* Section heading */}
      <rect x="4" y="21" width="16" height="1.5" rx="0.5" fill={accent} />
      {/* Text lines */}
      <rect x="4" y="25" width="40" height="1.5" rx="0.5" fill="#cbd5e1" />
      <rect x="4" y="28" width="36" height="1.5" rx="0.5" fill="#cbd5e1" />
      {/* Section heading */}
      <rect x="4" y="33" width="16" height="1.5" rx="0.5" fill={accent} />
      {/* Bullet lines */}
      <circle cx="6" cy="38.5" r="1" fill="#94a3b8" />
      <rect x="9" y="37.5" width="33" height="1.5" rx="0.5" fill="#cbd5e1" />
      <circle cx="6" cy="42.5" r="1" fill="#94a3b8" />
      <rect x="9" y="41.5" width="28" height="1.5" rx="0.5" fill="#cbd5e1" />
      <circle cx="6" cy="46.5" r="1" fill="#94a3b8" />
      <rect x="9" y="45.5" width="30" height="1.5" rx="0.5" fill="#cbd5e1" />
      {/* Section heading */}
      <rect x="4" y="51" width="12" height="1.5" rx="0.5" fill={accent} />
      <rect x="4" y="55" width="38" height="1.5" rx="0.5" fill="#cbd5e1" />
    </svg>
  )
}

function ModernThumb({ active }: { active: boolean }) {
  const sidebar = active ? '#1d4ed8' : '#1e3a5f'
  return (
    <svg width="48" height="62" viewBox="0 0 48 62" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="62" rx="2" fill="white" />
      {/* Sidebar background */}
      <rect x="0" y="0" width="18" height="62" rx="2" fill={sidebar} />
      <rect x="16" y="0" width="2" height="62" fill={sidebar} />
      {/* Name in sidebar */}
      <rect x="2" y="6" width="13" height="2.5" rx="0.5" fill="white" />
      <rect x="2" y="10" width="10" height="1.5" rx="0.5" fill="#90cdf4" />
      {/* Sidebar section */}
      <rect x="2" y="16" width="8" height="1" rx="0.5" fill="#90cdf4" />
      <rect x="2" y="19" width="13" height="1" rx="0.5" fill="#93c5fd" opacity="0.7" />
      <rect x="2" y="21.5" width="11" height="1" rx="0.5" fill="#93c5fd" opacity="0.7" />
      <rect x="2" y="24" width="12" height="1" rx="0.5" fill="#93c5fd" opacity="0.7" />
      {/* Sidebar section 2 */}
      <rect x="2" y="29" width="8" height="1" rx="0.5" fill="#90cdf4" />
      <rect x="2" y="32" width="13" height="1" rx="0.5" fill="white" opacity="0.7" />
      <rect x="2" y="34.5" width="10" height="1" rx="0.5" fill="#90cdf4" opacity="0.7" />
      {/* Main content heading */}
      <rect x="21" y="6" width="20" height="2" rx="0.5" fill={sidebar} />
      <rect x="21" y="9" width="24" height="0.5" fill="#bee3f8" />
      {/* Main text lines */}
      <rect x="21" y="12" width="24" height="1.5" rx="0.5" fill="#cbd5e1" />
      <rect x="21" y="15" width="20" height="1.5" rx="0.5" fill="#cbd5e1" />
      {/* Section heading */}
      <rect x="21" y="20" width="20" height="2" rx="0.5" fill={sidebar} />
      <rect x="21" y="23" width="24" height="0.5" fill="#bee3f8" />
      {/* Experience bullets */}
      <rect x="21" y="26" width="18" height="1.5" rx="0.5" fill="#94a3b8" />
      <rect x="21" y="29" width="24" height="1" rx="0.5" fill="#cbd5e1" />
      <rect x="21" y="31.5" width="22" height="1" rx="0.5" fill="#cbd5e1" />
      <rect x="21" y="34" width="20" height="1" rx="0.5" fill="#cbd5e1" />
    </svg>
  )
}

function MinimalThumb({ active }: { active: boolean }) {
  const line = active ? '#3b82f6' : '#e0e0e0'
  return (
    <svg width="48" height="62" viewBox="0 0 48 62" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="62" rx="2" fill="white" />
      {/* Name — light weight */}
      <rect x="4" y="5" width="28" height="3" rx="0.5" fill="#111111" opacity="0.7" />
      {/* Job title */}
      <rect x="4" y="10" width="20" height="1.5" rx="0.5" fill="#aaaaaa" />
      {/* Contact */}
      <rect x="4" y="13.5" width="36" height="1" rx="0.5" fill="#cccccc" />
      {/* Divider */}
      <rect x="4" y="17" width="40" height="0.5" fill={line} />
      {/* Section label (tiny caps) */}
      <rect x="4" y="20" width="12" height="1" rx="0.5" fill="#aaaaaa" />
      {/* Summary text */}
      <rect x="4" y="23" width="40" height="1" rx="0.5" fill="#cccccc" />
      <rect x="4" y="25.5" width="36" height="1" rx="0.5" fill="#cccccc" />
      {/* Divider */}
      <rect x="4" y="29" width="40" height="0.3" fill="#f0f0f0" />
      {/* Section label */}
      <rect x="4" y="32" width="14" height="1" rx="0.5" fill="#aaaaaa" />
      {/* Experience */}
      <rect x="4" y="35.5" width="22" height="1.5" rx="0.5" fill="#333333" opacity="0.8" />
      <rect x="4" y="38.5" width="40" height="1" rx="0.5" fill="#cccccc" />
      <rect x="4" y="41" width="36" height="1" rx="0.5" fill="#cccccc" />
      <rect x="4" y="43.5" width="38" height="1" rx="0.5" fill="#cccccc" />
      {/* Divider */}
      <rect x="4" y="47" width="40" height="0.3" fill="#f0f0f0" />
      {/* Skills */}
      <rect x="4" y="50" width="10" height="1" rx="0.5" fill="#aaaaaa" />
      <rect x="4" y="53" width="38" height="1" rx="0.5" fill="#cccccc" />
    </svg>
  )
}

// ATS Pro — centered header, all-caps sections, no color blocks
function AtsProThumb({ active }: { active: boolean }) {
  const line = active ? '#3b82f6' : '#111111'
  return (
    <svg width="48" height="62" viewBox="0 0 48 62" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="62" rx="2" fill="white" />
      {/* Centered name */}
      <rect x="10" y="5" width="28" height="3.5" rx="0.5" fill="#111" opacity="0.85" />
      {/* Job title centered */}
      <rect x="14" y="10" width="20" height="2" rx="0.5" fill="#555" opacity="0.7" />
      {/* Contact pipe row */}
      <rect x="4" y="14" width="40" height="1.5" rx="0.5" fill="#999" />
      {/* Full-width rule */}
      <rect x="4" y="17" width="40" height="0.8" fill={line} />
      {/* Section ALL CAPS */}
      <rect x="4" y="21" width="20" height="1.5" rx="0.5" fill="#111" opacity="0.8" />
      <rect x="4" y="24" width="40" height="0.5" fill="#111" opacity="0.5" />
      {/* Company + date */}
      <rect x="4" y="27" width="22" height="1.5" rx="0.5" fill="#111" opacity="0.7" />
      <rect x="34" y="27" width="10" height="1.5" rx="0.5" fill="#888" />
      {/* Role italic */}
      <rect x="4" y="30" width="18" height="1" rx="0.5" fill="#666" />
      {/* Bullets */}
      <circle cx="6.5" cy="34" r="0.8" fill="#555" />
      <rect x="9" y="33.3" width="33" height="1.3" rx="0.4" fill="#ccc" />
      <circle cx="6.5" cy="37" r="0.8" fill="#555" />
      <rect x="9" y="36.3" width="28" height="1.3" rx="0.4" fill="#ccc" />
      {/* Section 2 */}
      <rect x="4" y="41" width="14" height="1.5" rx="0.5" fill="#111" opacity="0.8" />
      <rect x="4" y="44" width="40" height="0.5" fill="#111" opacity="0.5" />
      <rect x="4" y="47" width="26" height="1.3" rx="0.4" fill="#111" opacity="0.7" />
      <rect x="34" y="47" width="10" height="1.3" rx="0.4" fill="#888" />
      <rect x="4" y="51" width="38" height="1" rx="0.4" fill="#ccc" />
      <rect x="4" y="54" width="30" height="1" rx="0.4" fill="#ccc" />
    </svg>
  )
}

// Sidebar Creative — dark sidebar left, white right
function SidebarThumb({ active }: { active: boolean }) {
  const sidebar = active ? '#1d4ed8' : '#1a2744'
  const accent  = '#e57c23'
  return (
    <svg width="48" height="62" viewBox="0 0 48 62" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="62" rx="2" fill="white" />
      {/* Sidebar */}
      <rect x="0" y="0" width="18" height="62" rx="2" fill={sidebar} />
      <rect x="16" y="0" width="2" height="62" fill={sidebar} />
      {/* Name in sidebar */}
      <rect x="2" y="6" width="13" height="2.5" rx="0.5" fill="white" />
      {/* Orange accent line */}
      <rect x="2" y="10" width="13" height="1" rx="0.5" fill={accent} />
      {/* Contact section */}
      <rect x="2" y="14" width="6" height="0.8" rx="0.3" fill={accent} opacity="0.8" />
      <rect x="2" y="16.5" width="13" height="1" rx="0.3" fill="#8fa3cc" />
      <rect x="2" y="18.5" width="11" height="1" rx="0.3" fill="#8fa3cc" />
      {/* Skills section */}
      <rect x="2" y="23" width="5" height="0.8" rx="0.3" fill={accent} opacity="0.8" />
      <rect x="2" y="25.5" width="13" height="1.2" rx="0.5" fill="#243461" />
      <rect x="2" y="27.5" width="10" height="1.2" rx="0.5" fill="#243461" />
      <rect x="2" y="29.5" width="12" height="1.2" rx="0.5" fill="#243461" />
      {/* Education section */}
      <rect x="2" y="34" width="7" height="0.8" rx="0.3" fill={accent} opacity="0.8" />
      <rect x="2" y="36.5" width="13" height="1" rx="0.3" fill="white" opacity="0.6" />
      <rect x="2" y="39" width="8" height="1" rx="0.3" fill={accent} opacity="0.6" />
      {/* Main heading */}
      <rect x="21" y="6" width="16" height="2" rx="0.5" fill={sidebar} />
      <rect x="21" y="9" width="24" height="0.5" fill={accent} />
      {/* Summary text */}
      <rect x="21" y="12" width="24" height="1" rx="0.3" fill="#94a3b8" />
      <rect x="21" y="14" width="20" height="1" rx="0.3" fill="#94a3b8" />
      {/* Experience heading */}
      <rect x="21" y="19" width="18" height="2" rx="0.5" fill={sidebar} />
      <rect x="21" y="22" width="24" height="0.5" fill={accent} />
      {/* Job entries */}
      <rect x="21" y="25" width="16" height="1.5" rx="0.3" fill="#1a1a2e" opacity="0.8" />
      <rect x="36" y="25" width="9" height="1.5" rx="3" fill={accent} />
      <rect x="21" y="28" width="12" height="1" rx="0.3" fill={accent} opacity="0.6" />
      <rect x="21" y="31" width="24" height="1" rx="0.3" fill="#94a3b8" />
      <rect x="21" y="33.5" width="21" height="1" rx="0.3" fill="#94a3b8" />
    </svg>
  )
}

// Tech Clean — large name, blue accent markers, skill chips
function TechCleanThumb({ active }: { active: boolean }) {
  const accent = active ? '#3b82f6' : '#0070f3'
  return (
    <svg width="48" height="62" viewBox="0 0 48 62" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="62" rx="2" fill="white" />
      {/* Large name */}
      <rect x="4" y="4" width="30" height="4" rx="0.5" fill="#0f172a" opacity="0.9" />
      {/* Blue job title */}
      <rect x="4" y="10" width="20" height="2" rx="0.5" fill={accent} opacity="0.9" />
      {/* Contact bar between two lines */}
      <rect x="4" y="14" width="40" height="0.5" fill="#e2e8f0" />
      <rect x="4" y="16" width="38" height="1.2" rx="0.3" fill="#94a3b8" />
      <rect x="4" y="18" width="40" height="0.5" fill="#e2e8f0" />
      {/* — SUMMARY section */}
      <rect x="4" y="22" width="3" height="1.5" rx="0.3" fill={accent} />
      <rect x="9" y="22" width="14" height="1.5" rx="0.3" fill="#0f172a" opacity="0.8" />
      <rect x="26" y="23.2" width="18" height="0.5" fill="#e2e8f0" />
      <rect x="4" y="25" width="40" height="1" rx="0.3" fill="#94a3b8" />
      <rect x="4" y="27" width="36" height="1" rx="0.3" fill="#94a3b8" />
      {/* — EXPERIENCE */}
      <rect x="4" y="31" width="3" height="1.5" rx="0.3" fill={accent} />
      <rect x="9" y="31" width="18" height="1.5" rx="0.3" fill="#0f172a" opacity="0.8" />
      <rect x="30" y="32.2" width="14" height="0.5" fill="#e2e8f0" />
      <rect x="4" y="34.5" width="22" height="1.5" rx="0.3" fill="#0f172a" opacity="0.7" />
      <rect x="38" y="34.5" width="6" height="1.5" rx="0.3" fill="#94a3b8" />
      <rect x="4" y="37" width="14" height="1" rx="0.3" fill={accent} opacity="0.6" />
      <rect x="4" y="39.5" width="38" height="1" rx="0.3" fill="#cbd5e1" />
      <rect x="4" y="42" width="32" height="1" rx="0.3" fill="#cbd5e1" />
      {/* — SKILLS chips */}
      <rect x="4" y="46" width="3" height="1.5" rx="0.3" fill={accent} />
      <rect x="9" y="46" width="10" height="1.5" rx="0.3" fill="#0f172a" opacity="0.8" />
      <rect x="22" y="47.2" width="22" height="0.5" fill="#e2e8f0" />
      {/* Skill chips */}
      <rect x="4" y="50" width="10" height="3" rx="1.5" fill="#f0f9ff" stroke="#bae6fd" strokeWidth="0.5" />
      <rect x="16" y="50" width="8" height="3" rx="1.5" fill="#f0f9ff" stroke="#bae6fd" strokeWidth="0.5" />
      <rect x="26" y="50" width="12" height="3" rx="1.5" fill="#f0f9ff" stroke="#bae6fd" strokeWidth="0.5" />
    </svg>
  )
}

const THUMBS: Record<string, React.ComponentType<{ active: boolean }>> = {
  classic: ClassicThumb,
  modern: ModernThumb,
  minimal: MinimalThumb,
  'ats-pro': AtsProThumb,
  sidebar: SidebarThumb,
  'tech-clean': TechCleanThumb,
}

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
          const Thumb = THUMBS[t.id]
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
                {/* Mini thumbnail */}
                <div className={clsx(
                  'flex-shrink-0 rounded overflow-hidden shadow-sm',
                  active ? 'ring-1 ring-blue-400' : 'ring-1 ring-gray-700'
                )}>
                  <Thumb active={active} />
                </div>
                {/* Name + description */}
                <div className="min-w-0 flex-1">
                  <p className={clsx('text-sm font-medium', active ? 'text-blue-300' : 'text-gray-200')}>
                    {t.name}
                  </p>
                  <p className="text-xs text-gray-500 leading-tight">{t.description}</p>
                  {active && (
                    <span className="text-xs text-blue-400 font-medium">Active</span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
