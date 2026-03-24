import { ResumeData } from '@/lib/types'
import EditableText from '@/components/EditableText'

interface Props {
  data: ResumeData
  editable?: boolean
  onFieldChange?: (path: string, value: string) => void
}

const ACCENT  = '#0070f3'
const DARK    = '#0f172a'
const MEDIUM  = '#475569'
const LIGHT   = '#94a3b8'
const DIVIDER = '#e2e8f0'

export default function TechClean({ data, editable = false, onFieldChange }: Props) {
  const skillEntries = Object.entries(data.skills)

  function T({
    value, path, tag: Tag = 'span', style,
  }: {
    value: string; path: string; tag?: keyof React.JSX.IntrinsicElements
    style?: React.CSSProperties
  }) {
    if (editable && onFieldChange) {
      return <EditableText value={value} path={path} onCommit={onFieldChange} tag={Tag} style={style} />
    }
    return <Tag style={style}>{value}</Tag>
  }

  return (
    <div
      id="resume-output"
      style={{
        fontFamily: '"Inter", "Segoe UI", Arial, sans-serif',
        fontSize: '10pt',
        lineHeight: '1.6',
        color: DARK,
        background: '#ffffff',
        width: '210mm',
        minHeight: '297mm',
        boxSizing: 'border-box',
        margin: '0 auto',
        padding: '14mm 16mm',
      }}
    >
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: '14px' }}>
        <h1 style={{
          fontSize: '26pt',
          fontWeight: '700',
          margin: '0 0 2px',
          color: DARK,
          letterSpacing: '-0.5px',
        }}>
          <T value={data.name} path="name" />
        </h1>
        <div style={{ fontSize: '12pt', color: ACCENT, fontWeight: '600', marginBottom: '8px' }}>
          <T value={data.jobTitle} path="jobTitle" />
        </div>
        {/* Contact bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px 16px',
          fontSize: '9pt',
          color: MEDIUM,
          borderTop: `1px solid ${DIVIDER}`,
          borderBottom: `1px solid ${DIVIDER}`,
          padding: '7px 0',
        }}>
          {data.phone && (
            <span>
              <span style={{ color: ACCENT, marginRight: '4px' }}>↳</span>
              <T value={data.phone} path="phone" />
            </span>
          )}
          {data.email && (
            <span>
              <span style={{ color: ACCENT, marginRight: '4px' }}>↳</span>
              <T value={data.email} path="email" />
            </span>
          )}
          {data.linkedin && (
            <span>
              <span style={{ color: ACCENT, marginRight: '4px' }}>↳</span>
              <T value={data.linkedin} path="linkedin" />
            </span>
          )}
          {data.portfolio && (
            <span>
              <span style={{ color: ACCENT, marginRight: '4px' }}>↳</span>
              <T value={data.portfolio} path="portfolio" />
            </span>
          )}
        </div>
      </div>

      {/* ── SUMMARY ─────────────────────────────────────────────── */}
      {data.summary && (
        <TechSection title="Summary">
          <T
            value={data.summary}
            path="summary"
            tag="p"
            style={{ margin: 0, color: MEDIUM, lineHeight: '1.7', textAlign: 'justify' }}
          />
        </TechSection>
      )}

      {/* ── WORK EXPERIENCE ─────────────────────────────────────── */}
      {data.experience.length > 0 && (
        <TechSection title="Work Experience">
          {data.experience.map((exp, i) => (
            <div
              key={i}
              style={{
                marginBottom: i < data.experience.length - 1 ? '14px' : 0,
                paddingLeft: '0',
                breakInside: 'avoid',
                pageBreakInside: 'avoid',
              }}
            >
              {/* Role + Duration on same row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
                <strong style={{ fontSize: '10.5pt', color: DARK }}>
                  <T value={exp.role} path={`experience~~${i}~~role`} />
                </strong>
                <span style={{ fontSize: '9pt', color: LIGHT, fontStyle: 'italic', whiteSpace: 'nowrap' }}>
                  <T value={exp.duration} path={`experience~~${i}~~duration`} />
                </span>
              </div>
              {/* Company */}
              <div style={{
                fontSize: '9.5pt',
                color: ACCENT,
                fontWeight: '600',
                marginBottom: '6px',
              }}>
                <T value={exp.company} path={`experience~~${i}~~company`} />
              </div>
              {/* Bullets */}
              <ul style={{ margin: 0, paddingLeft: '16px', listStyleType: 'none' }}>
                {exp.bullets.map((b, j) => (
                  <li key={j} style={{ marginBottom: '3px', color: MEDIUM, lineHeight: '1.55', position: 'relative', paddingLeft: '12px' }}>
                    <span style={{ position: 'absolute', left: 0, color: ACCENT, fontWeight: '700', fontSize: '10pt' }}>›</span>
                    <T value={b} path={`experience~~${i}~~bullets~~${j}`} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </TechSection>
      )}

      {/* ── EDUCATION ───────────────────────────────────────────── */}
      {data.education.length > 0 && (
        <TechSection title="Education">
          {data.education.map((edu, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: i < data.education.length - 1 ? '8px' : 0,
                breakInside: 'avoid',
                pageBreakInside: 'avoid',
              }}
            >
              <div>
                <strong style={{ fontSize: '10.5pt', color: DARK }}>
                  <T value={edu.degree} path={`education~~${i}~~degree`} />
                </strong>
                <div style={{ fontSize: '9.5pt', color: MEDIUM, marginTop: '1px' }}>
                  <T value={edu.institution} path={`education~~${i}~~institution`} />
                </div>
              </div>
              <span style={{ fontSize: '9pt', color: LIGHT, fontStyle: 'italic', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                <T value={edu.year} path={`education~~${i}~~year`} />
              </span>
            </div>
          ))}
        </TechSection>
      )}

      {/* ── SKILLS ──────────────────────────────────────────────── */}
      {skillEntries.length > 0 && (
        <TechSection title="Skills">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {skillEntries.map(([cat, skills]) => (
              <div key={cat} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'baseline' }}>
                {skillEntries.length > 1 && (
                  <span style={{
                    fontSize: '9pt',
                    fontWeight: '700',
                    color: DARK,
                    minWidth: '110px',
                    flexShrink: 0,
                  }}>
                    {cat}
                  </span>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {skills.map((s, i) => (
                    <span
                      key={i}
                      style={{
                        background: '#f0f9ff',
                        border: `1px solid #bae6fd`,
                        color: '#0369a1',
                        padding: '1px 9px',
                        borderRadius: '4px',
                        fontSize: '9pt',
                        fontWeight: '500',
                        display: 'inline-block',
                      }}
                    >
                      <T value={s} path={`skills~~${cat}~~${i}`} />
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TechSection>
      )}

      {/* ── CERTIFICATIONS ──────────────────────────────────────── */}
      {data.certifications.length > 0 && (
        <TechSection title="Certifications">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {data.certifications.map((cert, i) => (
              <span
                key={i}
                style={{
                  background: '#fefce8',
                  border: `1px solid #fde68a`,
                  color: '#92400e',
                  padding: '2px 12px',
                  borderRadius: '4px',
                  fontSize: '9.5pt',
                  fontWeight: '500',
                }}
              >
                <T value={cert} path={`certifications~~${i}`} />
              </span>
            ))}
          </div>
        </TechSection>
      )}
    </div>
  )
}

function TechSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
        <h2 style={{
          fontSize: '9.5pt',
          fontWeight: '700',
          color: DARK,
          margin: '0 0 6px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ color: ACCENT }}>—</span>
          {title}
          <div style={{ flex: 1, height: '1px', background: DIVIDER }} />
        </h2>
      </div>
      {children}
    </div>
  )
}
