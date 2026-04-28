'use client'
import { useResumeStore } from '@/store/resumeStore'
import RerollButton from './RerollButton'

/**
 * Compact toolbar of "Regenerate this section" buttons shown above the preview.
 * Each button calls /api/rewrite-section for one section, updating the store
 * in place — no full re-run needed.
 */
export default function RerollBar() {
  const resumeData = useResumeStore(s => s.resumeData)
  const formData = useResumeStore(s => s.formData)

  if (!resumeData) return null

  // How many experiences/projects exist in the form (drives the buttons)
  const expCount = formData.experiences.filter(e => e.rawDuties.trim() || e.role.trim()).length
  const projCount = (formData.projects ?? []).filter(p => p.name.trim() || p.description.trim()).length
  const hasSummary = !!formData.rawSummary.trim()
  const hasSkills = !!formData.rawSkills.trim()

  if (!hasSummary && !hasSkills && expCount === 0 && projCount === 0) return null

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '8px',
      padding: '8px 12px',
      background: '#fafbfc',
      borderBottom: '1px solid #e2e8f0',
      fontSize: '11px',
      color: '#475569',
    }}>
      <span style={{ fontWeight: 600, letterSpacing: '0.3px', textTransform: 'uppercase', color: '#64748b', fontSize: '10px' }}>
        AI Regenerate
      </span>

      {hasSummary && (
        <Pill label="Summary">
          <RerollButton section={{ kind: 'summary' }} label="Regenerate summary" />
        </Pill>
      )}

      {hasSkills && (
        <Pill label="Skills">
          <RerollButton section={{ kind: 'skills' }} label="Regenerate skills" />
        </Pill>
      )}

      {Array.from({ length: expCount }).map((_, i) => (
        <Pill key={`exp-${i}`} label={`Experience ${expCount > 1 ? i + 1 : ''}`.trim()}>
          <RerollButton section={{ kind: 'experience', index: i }} label={`Regenerate experience #${i + 1}`} />
        </Pill>
      ))}

      {Array.from({ length: projCount }).map((_, i) => (
        <Pill key={`proj-${i}`} label={`Project ${projCount > 1 ? i + 1 : ''}`.trim()}>
          <RerollButton section={{ kind: 'project', index: i }} label={`Regenerate project #${i + 1}`} />
        </Pill>
      ))}
    </div>
  )
}

function Pill({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '2px',
      padding: '3px 4px 3px 10px',
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '999px',
      color: '#334155',
      fontSize: '11px',
      fontWeight: 500,
    }}>
      {label}
      {children}
    </span>
  )
}
