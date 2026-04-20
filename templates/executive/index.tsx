import { ResumeData } from '@/lib/types'
import EditableText from '@/components/EditableText'

interface Props {
  data: ResumeData
  editable?: boolean
  onFieldChange?: (path: string, value: string) => void
}

const DARK = '#1a1f2e'
const GOLD = '#c9a84c'
const GOLD_LIGHT = '#f0d080'

export default function ExecutiveTemplate({ data, editable = false, onFieldChange }: Props) {
  const skillEntries = Object.entries(data.skills)

  function T({ value, path, tag: Tag = 'span', style }: {
    value: string; path: string; tag?: keyof React.JSX.IntrinsicElements; style?: React.CSSProperties
  }) {
    if (editable && onFieldChange)
      return <EditableText value={value} path={path} onCommit={onFieldChange} tag={Tag} style={style} />
    return <Tag style={style}>{value}</Tag>
  }

  const contacts = [data.phone, data.email, data.linkedin, data.portfolio].filter(Boolean)
  const contactPaths = ['phone', 'email', 'linkedin', 'portfolio']

  return (
    <div id="resume-output" style={{
      fontFamily: '"Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif',
      fontSize: '10.5pt',
      color: '#1a1a1a',
      background: '#fff',
      width: '210mm',
      minHeight: '297mm',
      boxSizing: 'border-box',
      margin: '0 auto',
      lineHeight: '1.4',
    }}>

      {/* ── DARK HEADER BLOCK ── */}
      <div style={{ background: DARK, padding: '12mm 16mm 10mm', position: 'relative' }}>
        {/* Gold top accent stripe */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT}, ${GOLD})` }} />

        <h1 style={{
          fontFamily: '"Palatino Linotype", Palatino, Georgia, serif',
          fontSize: '26pt',
          fontWeight: '700',
          color: '#ffffff',
          margin: '0 0 4px',
          letterSpacing: '1px',
          lineHeight: '1.1',
        }}>
          <T value={data.name} path="name" />
        </h1>

        <div style={{ fontSize: '13pt', color: GOLD, fontWeight: '600', margin: '0 0 12px', letterSpacing: '0.5px' }}>
          <T value={data.jobTitle} path="jobTitle" />
        </div>

        {/* Gold divider */}
        <div style={{ width: '50px', height: '2px', background: GOLD, marginBottom: '12px' }} />

        {/* Contact row */}
        {contacts.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {contacts.map((val, i) => (
              <span key={i} style={{ fontSize: '9pt', color: '#c0c8d8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ color: GOLD, fontSize: '8pt' }}>◆</span>
                <T value={val!} path={contactPaths[i]} />
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── BODY ── */}
      <div style={{ padding: '10mm 16mm' }}>

        {/* ── PROFILE ── */}
        {data.summary && (
          <ESection title="Executive Profile" gold={GOLD} dark={DARK}>
            <T value={data.summary} path="summary" tag="p" style={{
              margin: 0, lineHeight: '1.5', textAlign: 'justify', fontSize: '10.5pt',
              color: '#2a2a2a', fontStyle: 'italic',
            }} />
          </ESection>
        )}

        {/* ── EXPERIENCE ── */}
        {data.experience.length > 0 && (
          <ESection title="Professional Experience" gold={GOLD} dark={DARK}>
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < data.experience.length - 1 ? '10px' : 0, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
                  <strong style={{ fontSize: '11pt', color: DARK, fontWeight: '700' }}>
                    <T value={exp.role} path={`experience~~${i}~~role`} />
                  </strong>
                  <span style={{
                    fontSize: '9pt', color: '#fff', background: DARK,
                    padding: '1px 8px', borderRadius: '3px', whiteSpace: 'nowrap',
                  }}>
                    <T value={exp.duration} path={`experience~~${i}~~duration`} />
                  </span>
                </div>
                <div style={{ fontSize: '10pt', color: GOLD, fontWeight: '600', margin: '2px 0 6px', fontStyle: 'italic' }}>
                  <T value={exp.company} path={`experience~~${i}~~company`} />
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                  {exp.bullets.map((b, j) => (
                    <li key={j} style={{ marginBottom: '2px', lineHeight: '1.4', fontSize: '10.5pt', color: '#222' }}>
                      <T value={b} path={`experience~~${i}~~bullets~~${j}`} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </ESection>
        )}

        {/* ── PROJECTS ── */}
        {data.projects && data.projects.some(p => p.name) && (
          <ESection title="Key Projects" gold={GOLD} dark={DARK}>
            {data.projects.filter(p => p.name).map((proj, i) => (
              <div key={i} style={{ marginBottom: i < data.projects.filter(p => p.name).length - 1 ? '12px' : 0, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
                  <strong style={{ fontSize: '11pt', color: DARK }}>
                    <T value={proj.name} path={`projects~~${i}~~name`} />
                  </strong>
                  {proj.link && (
                    <span style={{ fontSize: '9pt', color: GOLD, fontStyle: 'italic' }}>
                      <T value={proj.link} path={`projects~~${i}~~link`} />
                    </span>
                  )}
                </div>
                {proj.techStack && proj.techStack.length > 0 && (
                  <div style={{ fontSize: '10pt', color: GOLD, fontStyle: 'italic', margin: '2px 0 5px' }}>
                    {proj.techStack.join(' · ')}
                  </div>
                )}
                <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                  {proj.bullets.map((b, j) => (
                    <li key={j} style={{ marginBottom: '2px', lineHeight: '1.4', fontSize: '10.5pt', color: '#222' }}>
                      <T value={b} path={`projects~~${i}~~bullets~~${j}`} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </ESection>
        )}

        {/* ── EDUCATION ── */}
        {data.education.length > 0 && (
          <ESection title="Education" gold={GOLD} dark={DARK}>
            {data.education.map((edu, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: i < data.education.length - 1 ? '10px' : 0, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <div>
                  <strong style={{ fontSize: '11pt', color: DARK }}><T value={edu.degree} path={`education~~${i}~~degree`} /></strong>
                  <div style={{ fontSize: '10pt', color: '#555', fontStyle: 'italic', marginTop: '2px' }}>
                    <T value={edu.institution} path={`education~~${i}~~institution`} />
                  </div>
                </div>
                <span style={{ fontSize: '10pt', color: '#555', whiteSpace: 'nowrap', marginLeft: '16px', fontStyle: 'italic' }}>
                  <T value={edu.year} path={`education~~${i}~~year`} />
                </span>
              </div>
            ))}
          </ESection>
        )}

        {/* Two-column bottom: Skills | Certifications */}
        <div style={{ display: 'flex', gap: '20px' }}>
          {skillEntries.length > 0 && (
            <div style={{ flex: 1 }}>
              <ESection title="Core Competencies" gold={GOLD} dark={DARK}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {skillEntries.map(([cat, skills]) => (
                    <div key={cat} style={{ fontSize: '10pt', lineHeight: '1.6' }}>
                      {skillEntries.length > 1 && <strong style={{ color: DARK }}>{cat}: </strong>}
                      {skills.map((s, i) => (
                        <span key={i}><T value={s} path={`skills~~${cat}~~${i}`} />{i < skills.length - 1 ? ', ' : ''}</span>
                      ))}
                    </div>
                  ))}
                </div>
              </ESection>
            </div>
          )}

          {data.certifications.length > 0 && (
            <div style={{ flex: 1 }}>
              <ESection title="Certifications" gold={GOLD} dark={DARK}>
                <ul style={{ margin: 0, paddingLeft: '18px', listStyleType: 'disc' }}>
                  {data.certifications.map((cert, i) => (
                    <li key={i} style={{ marginBottom: '3px', fontSize: '10pt', lineHeight: '1.6' }}>
                      <T value={cert} path={`certifications~~${i}`} />
                    </li>
                  ))}
                </ul>
              </ESection>
            </div>
          )}
        </div>
      </div>

      {/* Gold bottom bar */}
      <div style={{ height: '6px', background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT}, ${GOLD})`, marginTop: 'auto' }} />
    </div>
  )
}

function ESection({ title, children, gold, dark }: { title: string; children: React.ReactNode; gold: string; dark: string }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ breakAfter: 'avoid', pageBreakAfter: 'avoid', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
        <span style={{ width: '4px', height: '18px', background: gold, flexShrink: 0, borderRadius: '2px' }} />
        <h2 style={{
          fontFamily: '"Palatino Linotype", Palatino, Georgia, serif',
          fontSize: '11pt', fontWeight: '700', color: dark,
          textTransform: 'uppercase', letterSpacing: '2px', margin: 0,
        }}>{title}</h2>
        <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${gold}44, transparent)` }} />
      </div>
      {children}
    </div>
  )
}
