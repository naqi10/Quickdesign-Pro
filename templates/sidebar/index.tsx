import { ResumeData } from '@/lib/types'
import EditableText from '@/components/EditableText'

interface Props {
  data: ResumeData
  editable?: boolean
  onFieldChange?: (path: string, value: string) => void
}

const SIDEBAR_BG  = '#1a2744'
const SIDEBAR_MID = '#243461'
const ACCENT      = '#e57c23'
const LIGHT_TEXT  = '#c8d4f0'
const MUTED_TEXT  = '#8fa3cc'

export default function SidebarCreative({ data, editable = false, onFieldChange }: Props) {
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
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize: '10pt',
        lineHeight: '1.55',
        color: '#1a1a2e',
        background: `linear-gradient(to right, ${SIDEBAR_BG} 36%, #ffffff 36%)`,
        width: '210mm',
        minHeight: '297mm',
        boxSizing: 'border-box',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'stretch',
      }}
    >
      {/* ── LEFT SIDEBAR ────────────────────────────────────────── */}
      <div style={{
        width: '36%',
        flexShrink: 0,
        padding: '26px 18px 24px',
        color: LIGHT_TEXT,
        boxSizing: 'border-box',
      }}>
        {/* Name block */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{
            fontSize: '17pt',
            fontWeight: '700',
            color: '#ffffff',
            margin: '0 0 4px',
            lineHeight: '1.2',
            letterSpacing: '0.3px',
          }}>
            <T value={data.name} path="name" />
          </h1>
          <div style={{
            fontSize: '9.5pt',
            color: ACCENT,
            fontWeight: '600',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}>
            <T value={data.jobTitle} path="jobTitle" />
          </div>
          <div style={{ height: '2px', background: ACCENT, marginTop: '10px', borderRadius: '1px' }} />
        </div>

        {/* Contact */}
        <SideSection title="Contact" accent={ACCENT}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '9pt' }}>
            {data.phone && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: ACCENT, fontSize: '10pt', flexShrink: 0, marginTop: '1px' }}>📞</span>
                <T value={data.phone} path="phone" style={{ color: LIGHT_TEXT, wordBreak: 'break-all' }} />
              </div>
            )}
            {data.email && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: ACCENT, fontSize: '10pt', flexShrink: 0, marginTop: '1px' }}>✉</span>
                <T value={data.email} path="email" style={{ color: LIGHT_TEXT, wordBreak: 'break-all' }} />
              </div>
            )}
            {data.linkedin && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: ACCENT, fontWeight: '700', fontSize: '9pt', flexShrink: 0, marginTop: '1px' }}>in</span>
                <T value={data.linkedin} path="linkedin" style={{ color: LIGHT_TEXT, wordBreak: 'break-all' }} />
              </div>
            )}
            {data.portfolio && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: ACCENT, fontSize: '10pt', flexShrink: 0, marginTop: '1px' }}>🔗</span>
                <T value={data.portfolio} path="portfolio" style={{ color: LIGHT_TEXT, wordBreak: 'break-all' }} />
              </div>
            )}
          </div>
        </SideSection>

        {/* Education */}
        {data.education.length > 0 && (
          <SideSection title="Education" accent={ACCENT}>
            {data.education.map((edu, i) => (
              <div key={i} style={{ marginBottom: i < data.education.length - 1 ? '10px' : 0 }}>
                <div style={{ fontSize: '9pt', fontWeight: '700', color: '#ffffff', lineHeight: '1.35' }}>
                  <T value={edu.degree} path={`education~~${i}~~degree`} />
                </div>
                <div style={{ fontSize: '8.5pt', color: MUTED_TEXT, marginTop: '2px' }}>
                  <T value={edu.institution} path={`education~~${i}~~institution`} />
                </div>
                <div style={{ fontSize: '8.5pt', color: ACCENT, marginTop: '1px' }}>
                  <T value={edu.year} path={`education~~${i}~~year`} />
                </div>
              </div>
            ))}
          </SideSection>
        )}

        {/* Skills */}
        {skillEntries.length > 0 && (
          <SideSection title="Skills" accent={ACCENT}>
            {skillEntries.map(([cat, skills]) => (
              <div key={cat} style={{ marginBottom: '8px' }}>
                {skillEntries.length > 1 && (
                  <div style={{ fontSize: '8.5pt', color: ACCENT, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                    {cat}
                  </div>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {skills.map((s, i) => (
                    <span
                      key={i}
                      style={{
                        background: SIDEBAR_MID,
                        border: `1px solid rgba(229,124,35,0.3)`,
                        color: LIGHT_TEXT,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '8.5pt',
                        display: 'inline-block',
                      }}
                    >
                      <T value={s} path={`skills~~${cat}~~${i}`} />
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </SideSection>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <SideSection title="Certifications" accent={ACCENT}>
            <ul style={{ margin: 0, paddingLeft: '14px', color: LIGHT_TEXT }}>
              {data.certifications.map((cert, i) => (
                <li key={i} style={{ marginBottom: '4px', fontSize: '8.5pt', lineHeight: '1.4' }}>
                  <T value={cert} path={`certifications~~${i}`} />
                </li>
              ))}
            </ul>
          </SideSection>
        )}
      </div>

      {/* ── RIGHT MAIN ──────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        background: '#ffffff',
        padding: '26px 22px 24px 20px',
        boxSizing: 'border-box',
      }}>

        {/* Summary */}
        {data.summary && (
          <MainSection title="Profile" accent={ACCENT}>
            <T
              value={data.summary}
              path="summary"
              tag="p"
              style={{ margin: 0, color: '#334155', lineHeight: '1.65', textAlign: 'justify' }}
            />
          </MainSection>
        )}

        {/* Work Experience */}
        {data.experience.length > 0 && (
          <MainSection title="Work Experience" accent={ACCENT}>
            {data.experience.map((exp, i) => (
              <div
                key={i}
                style={{
                  marginBottom: i < data.experience.length - 1 ? '14px' : 0,
                  breakInside: 'avoid',
                  pageBreakInside: 'avoid',
                }}
              >
                {/* Role + duration */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
                  <strong style={{ fontSize: '10.5pt', color: '#1a1a2e' }}>
                    <T value={exp.role} path={`experience~~${i}~~role`} />
                  </strong>
                  <span style={{
                    fontSize: '8.5pt',
                    color: '#ffffff',
                    background: ACCENT,
                    padding: '1px 9px',
                    borderRadius: '10px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                  }}>
                    <T value={exp.duration} path={`experience~~${i}~~duration`} />
                  </span>
                </div>
                {/* Company */}
                <div style={{ fontSize: '9pt', color: '#5a6b8a', marginBottom: '5px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                  <T value={exp.company} path={`experience~~${i}~~company`} />
                </div>
                {/* Bullets */}
                <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                  {exp.bullets.map((b, j) => (
                    <li key={j} style={{ marginBottom: '3px', color: '#334155', lineHeight: '1.5', fontSize: '10pt' }}>
                      <T value={b} path={`experience~~${i}~~bullets~~${j}`} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </MainSection>
        )}
      </div>
    </div>
  )
}

function SideSection({ title, children, accent }: { title: string; children: React.ReactNode; accent: string }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{
        fontSize: '8.5pt',
        fontWeight: '700',
        color: accent,
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <div style={{ flex: 1, height: '1px', background: `rgba(229,124,35,0.3)` }} />
        {title}
        <div style={{ flex: 1, height: '1px', background: `rgba(229,124,35,0.3)` }} />
      </div>
      {children}
    </div>
  )
}

function MainSection({ title, children, accent }: { title: string; children: React.ReactNode; accent: string }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{
        breakAfter: 'avoid',
        pageBreakAfter: 'avoid',
        marginBottom: '10px',
      }}>
        <h2 style={{
          fontSize: '10.5pt',
          fontWeight: '800',
          color: '#1a1a2e',
          margin: '0 0 4px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}>
          {title}
        </h2>
        <div style={{ height: '2px', background: `linear-gradient(90deg, ${accent}, transparent)`, borderRadius: '1px' }} />
      </div>
      {children}
    </div>
  )
}
