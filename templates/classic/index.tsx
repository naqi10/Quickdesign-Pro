import { ResumeData } from '@/lib/types'
import EditableText from '@/components/EditableText'

interface Props {
  data: ResumeData
  editable?: boolean
  onFieldChange?: (path: string, value: string) => void
}

// Accent color palette
const NAVY   = '#1B2A4A'
const TEAL   = '#2A7F8F'
const LIGHT  = '#F0F4F8'
const MUTED  = '#64748B'
const BORDER = '#CBD5E1'

export default function ClassicTemplate({ data, editable = false, onFieldChange }: Props) {
  const skillEntries = Object.entries(data.skills)

  function T({
    value, path, tag: Tag = 'span', className, style,
  }: {
    value: string; path: string; tag?: keyof React.JSX.IntrinsicElements
    className?: string; style?: React.CSSProperties
  }) {
    if (editable && onFieldChange) {
      return <EditableText value={value} path={path} onCommit={onFieldChange} tag={Tag} className={className} style={style} />
    }
    return <Tag className={className} style={style}>{value}</Tag>
  }

  return (
    <div
      id="resume-output"
      style={{
        fontFamily: '"Helvetica Neue", Arial, sans-serif',
        fontSize: '10.5pt',
        lineHeight: '1.55',
        color: '#1E293B',
        background: '#ffffff',
        width: '210mm',
        minHeight: '297mm',
        boxSizing: 'border-box',
        margin: '0 auto',
      }}
    >

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div style={{ background: NAVY, padding: '22px 24px 18px', color: '#ffffff' }}>
        <h1 style={{
          fontSize: '24pt',
          fontWeight: '700',
          letterSpacing: '0.5px',
          margin: '0 0 3px 0',
          color: '#FFFFFF',
        }}>
          <T value={data.name} path="name" />
        </h1>

        <p style={{
          fontSize: '11.5pt',
          color: '#93C5D8',
          fontWeight: '500',
          margin: '0 0 10px 0',
          letterSpacing: '0.2px',
        }}>
          <T value={data.jobTitle} path="jobTitle" />
        </p>

        {/* Contact row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px', fontSize: '9pt', color: '#CBD5E1' }}>
          {data.phone && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ opacity: 0.7 }}>📞</span>
              <T value={data.phone} path="phone" />
            </span>
          )}
          {data.email && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ opacity: 0.7 }}>✉</span>
              <T value={data.email} path="email" />
            </span>
          )}
          {data.linkedin && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ opacity: 0.7 }}>in</span>
              <T value={data.linkedin} path="linkedin" />
            </span>
          )}
          {data.portfolio && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ opacity: 0.7 }}>🔗</span>
              <T value={data.portfolio} path="portfolio" />
            </span>
          )}
        </div>
      </div>

      {/* Teal accent bar */}
      <div style={{ height: '4px', background: `linear-gradient(90deg, ${TEAL}, #4ECDC4)` }} />

      {/* ── BODY ───────────────────────────────────────────────── */}
      <div style={{ padding: '20px 24px' }}>

        {/* Professional Summary */}
        {data.summary && (
          <Section title="Professional Summary" teal={TEAL} border={BORDER} light={LIGHT}>
            <T
              value={data.summary}
              path="summary"
              tag="p"
              style={{ margin: 0, color: '#334155', textAlign: 'justify', lineHeight: '1.65' }}
            />
          </Section>
        )}

        {/* Work Experience */}
        {data.experience.length > 0 && (
          <Section title="Work Experience" teal={TEAL} border={BORDER} light={LIGHT}>
            {data.experience.map((exp, i) => (
              <div
                key={i}
                style={{
                  marginBottom: i < data.experience.length - 1 ? '14px' : 0,
                  paddingLeft: '12px',
                  borderLeft: `3px solid ${i === 0 ? TEAL : BORDER}`,
                }}
              >
                {/* Role + Duration */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
                  <strong style={{ fontSize: '11pt', color: NAVY, fontWeight: '700' }}>
                    <T value={exp.role} path={`experience~~${i}~~role`} />
                  </strong>
                  <span style={{
                    fontSize: '9pt',
                    color: '#ffffff',
                    background: TEAL,
                    padding: '1px 8px',
                    borderRadius: '10px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                  }}>
                    <T value={exp.duration} path={`experience~~${i}~~duration`} />
                  </span>
                </div>

                {/* Company */}
                <div style={{ fontSize: '9pt', color: MUTED, margin: '2px 0 6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                  <T value={exp.company} path={`experience~~${i}~~company`} />
                </div>

                {/* Bullets */}
                <ul style={{ margin: 0, paddingLeft: '16px' }}>
                  {exp.bullets.map((b, j) => (
                    <li key={j} style={{ marginBottom: '3px', color: '#334155', lineHeight: '1.5' }}>
                      <T value={b} path={`experience~~${i}~~bullets~~${j}`} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>
        )}

        {/* Skills */}
        {skillEntries.length > 0 && (
          <Section title="Skills" teal={TEAL} border={BORDER} light={LIGHT}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {skillEntries.map(([category, skills]) => (
                <div key={category} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                  {skillEntries.length > 1 && (
                    <span style={{
                      fontSize: '9pt',
                      fontWeight: '700',
                      color: NAVY,
                      minWidth: '120px',
                      paddingRight: '8px',
                    }}>
                      {category}
                    </span>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {skills.map((skill, i) => (
                      <span
                        key={i}
                        style={{
                          background: LIGHT,
                          border: `1px solid ${BORDER}`,
                          color: NAVY,
                          padding: '2px 10px',
                          borderRadius: '12px',
                          fontSize: '9pt',
                          fontWeight: '500',
                          display: 'inline-block',
                        }}
                      >
                        <T value={skill} path={`skills~~${category}~~${i}`} />
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <Section title="Education" teal={TEAL} border={BORDER} light={LIGHT}>
            {data.education.map((edu, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: i < data.education.length - 1 ? '8px' : 0,
                  padding: '8px 12px',
                  background: LIGHT,
                  borderRadius: '6px',
                  borderLeft: `3px solid ${TEAL}`,
                }}
              >
                <div>
                  <strong style={{ fontSize: '10.5pt', color: NAVY }}>
                    <T value={edu.degree} path={`education~~${i}~~degree`} />
                  </strong>
                  <div style={{ fontSize: '9.5pt', color: MUTED, marginTop: '1px' }}>
                    <T value={edu.institution} path={`education~~${i}~~institution`} />
                  </div>
                </div>
                <span style={{
                  fontSize: '9pt',
                  color: MUTED,
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  marginLeft: '12px',
                }}>
                  <T value={edu.year} path={`education~~${i}~~year`} />
                </span>
              </div>
            ))}
          </Section>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <Section title="Certifications" teal={TEAL} border={BORDER} light={LIGHT}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {data.certifications.map((cert, i) => (
                <span
                  key={i}
                  style={{
                    background: '#EFF6FF',
                    border: `1px solid #BFDBFE`,
                    color: '#1E40AF',
                    padding: '3px 12px',
                    borderRadius: '12px',
                    fontSize: '9.5pt',
                    fontWeight: '500',
                  }}
                >
                  <T value={cert} path={`certifications~~${i}`} />
                </span>
              ))}
            </div>
          </Section>
        )}

      </div>
    </div>
  )
}

// ── Section wrapper ────────────────────────────────────────────
function Section({
  title, children, teal, border, light,
}: {
  title: string
  children: React.ReactNode
  teal: string
  border: string
  light: string
}) {
  return (
    <div style={{ marginBottom: '18px' }}>
      {/* Section header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '10px',
      }}>
        <div style={{ width: '4px', height: '18px', background: teal, borderRadius: '2px', flexShrink: 0 }} />
        <h2 style={{
          fontSize: '10pt',
          fontWeight: '800',
          color: '#0F172A',
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          flex: 1,
        }}>
          {title}
        </h2>
        <div style={{ flex: 1, height: '1px', background: border }} />
      </div>
      {children}
    </div>
  )
}
