import { ResumeData } from '@/lib/types'
import EditableText from '@/components/EditableText'

// Google-Style — ultra-clean white, Roboto-inspired, blue accent on role title.
// Heavy whitespace, no decorations. Perfect for software engineers, product roles.

interface Props {
  data: ResumeData
  editable?: boolean
  onFieldChange?: (path: string, value: string) => void
}

const BLUE  = '#1a73e8'  // Google blue
const GRAY  = '#5f6368'  // Google gray
const DARK  = '#202124'  // Google dark
const LINE  = '#dadce0'  // Google border

export default function GoogleStyleTemplate({ data, editable = false, onFieldChange }: Props) {
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
      fontFamily: '"Roboto", "Google Sans", Arial, sans-serif',
      fontSize: '10pt',
      lineHeight: '1.4',
      color: DARK,
      background: '#fff',
      width: '210mm',
      minHeight: '297mm',
      boxSizing: 'border-box',
      margin: '0 auto',
      padding: '10mm 14mm',
    }}>

      {/* ── HEADER ── */}
      <div style={{ marginBottom: '10px', paddingBottom: '8px', borderBottom: `2px solid ${BLUE}` }}>
        <h1 style={{
          fontFamily: '"Roboto", Arial, sans-serif',
          fontSize: '24pt', fontWeight: '400',
          color: DARK, margin: '0 0 4px', lineHeight: '1.15', letterSpacing: '-0.5px',
        }}>
          <T value={data.name} path="name" />
        </h1>

        <div style={{ fontSize: '12pt', color: BLUE, fontWeight: '500', margin: '0 0 8px' }}>
          <T value={data.jobTitle} path="jobTitle" />
        </div>

        {contacts.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0', fontSize: '9pt', color: GRAY }}>
            {contacts.map((val, i) => (
              <span key={i}>
                {i > 0 && <span style={{ margin: '0 8px', color: LINE }}>·</span>}
                <T value={val!} path={contactPaths[i]} />
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── SUMMARY ── */}
      {data.summary && (
        <GSection title="Summary" blue={BLUE} line={LINE}>
          <T value={data.summary} path="summary" tag="p" style={{
            margin: 0, lineHeight: '1.5', color: '#111111', fontSize: '10pt',
          }} />
        </GSection>
      )}

      {/* ── EXPERIENCE ── */}
      {data.experience.length > 0 && (
        <GSection title="Experience" blue={BLUE} line={LINE}>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < data.experience.length - 1 ? '10px' : 0, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              {/* Role + dates */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11pt', fontWeight: '500', color: DARK }}>
                  <T value={exp.role} path={`experience~~${i}~~role`} />
                </span>
                <span style={{ fontSize: '9.5pt', color: '#1a1a1a', whiteSpace: 'nowrap', fontStyle: 'italic' }}>
                  <T value={exp.duration} path={`experience~~${i}~~duration`} />
                </span>
              </div>
              {/* Company */}
              <div style={{ fontSize: '10pt', color: BLUE, fontWeight: '400', margin: '1px 0 6px' }}>
                <T value={exp.company} path={`experience~~${i}~~company`} />
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                {exp.bullets.map((b, j) => (
                  <li key={j} style={{ marginBottom: '2px', lineHeight: '1.4', fontSize: '10pt', color: '#111111' }}>
                    <T value={b} path={`experience~~${i}~~bullets~~${j}`} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </GSection>
      )}

      {/* ── PROJECTS ── */}
      {data.projects && data.projects.some(p => p.name) && (
        <GSection title="Projects" blue={BLUE} line={LINE}>
          {data.projects.filter(p => p.name).map((proj, i) => (
            <div key={i} style={{ marginBottom: i < data.projects.filter(p => p.name).length - 1 ? '12px' : 0, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11pt', fontWeight: '500', color: DARK }}>
                  <T value={proj.name} path={`projects~~${i}~~name`} />
                </span>
                {proj.link && (
                  <span style={{ fontSize: '9pt', color: BLUE }}>
                    <T value={proj.link} path={`projects~~${i}~~link`} />
                  </span>
                )}
              </div>
              {proj.techStack && proj.techStack.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '3px 0 5px' }}>
                  {proj.techStack.map((tech, j) => (
                    <span key={j} style={{ fontSize: '8.5pt', background: '#f8f9fa', color: '#111111', border: `1px solid ${LINE}`, borderRadius: '4px', padding: '1px 7px' }}>
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                {proj.bullets.map((b, j) => (
                  <li key={j} style={{ marginBottom: '2px', lineHeight: '1.4', fontSize: '10pt', color: '#111111' }}>
                    <T value={b} path={`projects~~${i}~~bullets~~${j}`} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </GSection>
      )}

      {/* ── EDUCATION ── */}
      {data.education.length > 0 && (
        <GSection title="Education" blue={BLUE} line={LINE}>
          {data.education.map((edu, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              marginBottom: i < data.education.length - 1 ? '8px' : 0,
              breakInside: 'avoid', pageBreakInside: 'avoid',
            }}>
              <div>
                <span style={{ fontSize: '11pt', fontWeight: '500', color: DARK }}>
                  <T value={edu.degree} path={`education~~${i}~~degree`} />
                </span>
                <div style={{ fontSize: '10pt', color: GRAY, marginTop: '2px' }}>
                  <T value={edu.institution} path={`education~~${i}~~institution`} />
                </div>
              </div>
              <span style={{ fontSize: '9.5pt', color: '#1a1a1a', whiteSpace: 'nowrap', marginLeft: '16px', fontStyle: 'italic' }}>
                <T value={edu.year} path={`education~~${i}~~year`} />
              </span>
            </div>
          ))}
        </GSection>
      )}

      {/* ── SKILLS — chip style ── */}
      {skillEntries.length > 0 && (
        <GSection title="Technical Skills" blue={BLUE} line={LINE}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {skillEntries.map(([cat, skills]) => (
              <div key={cat} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
                {skillEntries.length > 1 && (
                  <span style={{ fontSize: '9pt', fontWeight: '700', color: GRAY, paddingTop: '3px', minWidth: '70px' }}>{cat}</span>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', flex: 1 }}>
                  {skills.map((s, i) => (
                    <span key={i} style={{
                      fontSize: '9pt', background: '#f8f9fa', color: '#111111',
                      border: `1px solid ${LINE}`, borderRadius: '4px',
                      padding: '2px 8px',
                    }}>
                      <T value={s} path={`skills~~${cat}~~${i}`} />
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </GSection>
      )}

      {/* ── CERTIFICATIONS ── */}
      {data.certifications.length > 0 && (
        <GSection title="Certifications" blue={BLUE} line={LINE}>
          <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
            {data.certifications.map((cert, i) => (
              <li key={i} style={{ marginBottom: '2px', fontSize: '10pt', lineHeight: '1.4', color: '#111111' }}>
                <T value={cert} path={`certifications~~${i}`} />
              </li>
            ))}
          </ul>
        </GSection>
      )}
    </div>
  )
}

function GSection({ title, children, blue, line }: { title: string; children: React.ReactNode; blue: string; line: string }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ breakAfter: 'avoid', pageBreakAfter: 'avoid', marginBottom: '5px' }}>
        <h2 style={{
          fontFamily: '"Roboto", Arial, sans-serif',
          fontSize: '10.5pt', fontWeight: '500', color: blue,
          textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 3px',
        }}>{title}</h2>
        <div style={{ height: '1px', background: line }} />
      </div>
      {children}
    </div>
  )
}
