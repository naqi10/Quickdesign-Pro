import { ResumeData } from '@/lib/types'
import EditableText from '@/components/EditableText'

// Fresher / Fresh Graduate template — Education FIRST, then Experience, then Skills
// Clean, one-page-friendly. Perfect for students, fresh grads, entry-level.

interface Props {
  data: ResumeData
  editable?: boolean
  onFieldChange?: (path: string, value: string) => void
}

const ACCENT = '#2563eb'   // blue
const LIGHT  = '#eff6ff'   // pale blue for tag backgrounds

export default function FresherTemplate({ data, editable = false, onFieldChange }: Props) {
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
      fontFamily: '"Segoe UI", Arial, "Helvetica Neue", sans-serif',
      fontSize: '10.5pt',
      lineHeight: '1.4',
      color: '#1e293b',
      background: '#fff',
      width: '210mm',
      minHeight: '297mm',
      boxSizing: 'border-box',
      margin: '0 auto',
      padding: '0',
    }}>

      {/* ── HEADER — blue accent left bar ── */}
      <div style={{
        display: 'flex',
        borderBottom: `3px solid ${ACCENT}`,
        padding: '10mm 14mm 8mm',
        background: '#fafbff',
      }}>
        {/* Left accent bar */}
        <div style={{ width: '4px', background: ACCENT, borderRadius: '2px', marginRight: '16px', flexShrink: 0 }} />

        <div style={{ flex: 1 }}>
          <h1 style={{
            fontFamily: '"Segoe UI", Arial, sans-serif',
            fontSize: '22pt', fontWeight: '700',
            color: '#0f172a', margin: '0 0 3px', lineHeight: '1.1',
          }}>
            <T value={data.name} path="name" />
          </h1>
          <div style={{ fontSize: '12pt', color: ACCENT, fontWeight: '600', margin: '0 0 8px' }}>
            <T value={data.jobTitle} path="jobTitle" />
          </div>
          {contacts.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 16px', fontSize: '9pt', color: '#475569' }}>
              {contacts.map((val, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: ACCENT, fontSize: '9pt' }}>●</span>
                  <T value={val!} path={contactPaths[i]} />
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '8mm 14mm' }}>

        {/* ── OBJECTIVE / SUMMARY ── */}
        {data.summary && (
          <FSection title="Career Objective" accent={ACCENT}>
            <T value={data.summary} path="summary" tag="p" style={{
              margin: 0, lineHeight: '1.5', textAlign: 'justify',
              fontSize: '10.5pt', color: '#111111',
            }} />
          </FSection>
        )}

        {/* ── EDUCATION FIRST ── */}
        {data.education.length > 0 && (
          <FSection title="Education" accent={ACCENT}>
            {data.education.map((edu, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                marginBottom: i < data.education.length - 1 ? '10px' : 0,
                breakInside: 'avoid', pageBreakInside: 'avoid',
                background: LIGHT, borderRadius: '6px', padding: '6px 10px',
                borderLeft: `3px solid ${ACCENT}`,
              }}>
                <div>
                  <strong style={{ fontSize: '11pt', color: '#0f172a' }}>
                    <T value={edu.degree} path={`education~~${i}~~degree`} />
                  </strong>
                  <div style={{ fontSize: '10pt', color: '#444444', marginTop: '2px' }}>
                    <T value={edu.institution} path={`education~~${i}~~institution`} />
                  </div>
                </div>
                <span style={{ fontSize: '9.5pt', color: '#1a1a1a', whiteSpace: 'nowrap', marginLeft: '12px', fontStyle: 'italic' }}>
                  <T value={edu.year} path={`education~~${i}~~year`} />
                </span>
              </div>
            ))}
          </FSection>
        )}

        {/* ── SKILLS — pill tags ── */}
        {skillEntries.length > 0 && (
          <FSection title="Skills" accent={ACCENT}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {skillEntries.map(([cat, skills]) => (
                <div key={cat} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                  {skillEntries.length > 1 && (
                    <span style={{ fontSize: '9pt', fontWeight: '700', color: '#475569', minWidth: '80px' }}>{cat}:</span>
                  )}
                  {skills.map((s, i) => (
                    <span key={i} style={{
                      fontSize: '9pt', background: LIGHT, color: ACCENT,
                      border: `1px solid ${ACCENT}33`, borderRadius: '12px',
                      padding: '2px 8px', fontWeight: '500',
                    }}>
                      <T value={s} path={`skills~~${cat}~~${i}`} />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </FSection>
        )}

        {/* ── EXPERIENCE ── */}
        {data.experience.length > 0 && data.experience.some(e => e.role || e.company) && (
          <FSection title="Experience / Internships" accent={ACCENT}>
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < data.experience.length - 1 ? '8px' : 0, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
                  <strong style={{ fontSize: '10.5pt', color: '#0f172a' }}>
                    <T value={exp.role} path={`experience~~${i}~~role`} />
                  </strong>
                  <span style={{ fontSize: '9.5pt', color: '#1a1a1a', whiteSpace: 'nowrap', fontStyle: 'italic' }}>
                    <T value={exp.duration} path={`experience~~${i}~~duration`} />
                  </span>
                </div>
                <div style={{ fontSize: '10pt', color: ACCENT, marginBottom: '5px' }}>
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
          </FSection>
        )}

        {/* ── PROJECTS ── */}
        {data.projects && data.projects.some(p => p.name) && (
          <FSection title="Projects" accent={ACCENT}>
            {data.projects.filter(p => p.name).map((proj, i) => (
              <div key={i} style={{ marginBottom: i < data.projects.filter(p => p.name).length - 1 ? '12px' : 0, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
                  <strong style={{ fontSize: '10.5pt', color: '#0f172a' }}>
                    <T value={proj.name} path={`projects~~${i}~~name`} />
                  </strong>
                  {proj.link && (
                    <span style={{ fontSize: '8.5pt', color: ACCENT }}>
                      <T value={proj.link} path={`projects~~${i}~~link`} />
                    </span>
                  )}
                </div>
                {proj.techStack && proj.techStack.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '3px 0 5px' }}>
                    {proj.techStack.map((tech, j) => (
                      <span key={j} style={{ fontSize: '8.5pt', background: LIGHT, color: ACCENT, border: `1px solid ${ACCENT}33`, borderRadius: '10px', padding: '1px 7px', fontWeight: '500' }}>
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
          </FSection>
        )}

        {/* ── CERTIFICATIONS ── */}
        {data.certifications.length > 0 && (
          <FSection title="Certifications & Courses" accent={ACCENT}>
            <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
              {data.certifications.map((cert, i) => (
                <li key={i} style={{ marginBottom: '2px', fontSize: '10pt', lineHeight: '1.4', color: '#111111' }}>
                  <T value={cert} path={`certifications~~${i}`} />
                </li>
              ))}
            </ul>
          </FSection>
        )}
      </div>
    </div>
  )
}

function FSection({ title, children, accent }: { title: string; children: React.ReactNode; accent: string }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ breakAfter: 'avoid', pageBreakAfter: 'avoid', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <h2 style={{
          fontFamily: '"Segoe UI", Arial, sans-serif',
          fontSize: '10pt', fontWeight: '700', color: accent,
          textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0,
        }}>{title}</h2>
        <div style={{ flex: 1, height: '1px', background: `${accent}44` }} />
      </div>
      {children}
    </div>
  )
}
