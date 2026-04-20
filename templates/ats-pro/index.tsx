import { ResumeData } from '@/lib/types'
import EditableText from '@/components/EditableText'

interface Props {
  data: ResumeData
  editable?: boolean
  onFieldChange?: (path: string, value: string) => void
}

export default function AtsPro({ data, editable = false, onFieldChange }: Props) {
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

  const contacts = [data.phone, data.email, data.linkedin, data.portfolio].filter(Boolean)
  const contactPaths = ['phone', 'email', 'linkedin', 'portfolio']

  return (
    <div
      id="resume-output"
      style={{
        fontFamily: '"Times New Roman", Georgia, serif',
        fontSize: '11pt',
        lineHeight: '1.4',
        color: '#111111',
        background: '#ffffff',
        width: '210mm',
        minHeight: '297mm',
        boxSizing: 'border-box',
        margin: '0 auto',
        padding: '10mm 14mm',
      }}
    >
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h1 style={{
          fontFamily: '"Times New Roman", Georgia, serif',
          fontSize: '24pt',
          fontWeight: '700',
          margin: '0 0 4px',
          letterSpacing: '0.5px',
          color: '#000000',
          lineHeight: '1.2',
        }}>
          <T value={data.name} path="name" />
        </h1>

        <div style={{
          fontSize: '11.5pt',
          color: '#333',
          fontWeight: '400',
          margin: '0 0 8px',
          fontStyle: 'italic',
        }}>
          <T value={data.jobTitle} path="jobTitle" />
        </div>

        {/* Pipe-separated contact line */}
        {contacts.length > 0 && (
          <div style={{
            fontSize: '9.5pt',
            color: '#333',
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '0',
            lineHeight: '1.6',
          }}>
            {contacts.map((val, i) => (
              <span key={i}>
                {i > 0 && <span style={{ margin: '0 8px', color: '#aaa' }}>|</span>}
                <T value={val!} path={contactPaths[i]} />
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bold full-width divider under header */}
      <div style={{ borderTop: '2px solid #000', margin: '0 0 14px' }} />

      {/* ── SUMMARY ─────────────────────────────────────────────── */}
      {data.summary && (
        <AtsSection title="Summary">
          <T
            value={data.summary}
            path="summary"
            tag="p"
            style={{
              margin: 0,
              lineHeight: '1.5',
              textAlign: 'justify',
              color: '#1a1a1a',
              fontSize: '10.5pt',
            }}
          />
        </AtsSection>
      )}

      {/* ── WORK EXPERIENCE ─────────────────────────────────────── */}
      {data.experience.length > 0 && (
        <AtsSection title="Work Experience">
          {data.experience.map((exp, i) => (
            <div
              key={i}
              style={{
                marginBottom: i < data.experience.length - 1 ? '10px' : 0,
                breakInside: 'avoid',
                pageBreakInside: 'avoid',
              }}
            >
              {/* Role (bold) + Duration same row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                flexWrap: 'wrap',
                gap: '4px',
                marginBottom: '1px',
              }}>
                <strong style={{ fontSize: '11pt', color: '#000', fontWeight: '700' }}>
                  <T value={exp.role} path={`experience~~${i}~~role`} />
                </strong>
                <span style={{ fontSize: '10pt', color: '#333', whiteSpace: 'nowrap', fontStyle: 'italic' }}>
                  <T value={exp.duration} path={`experience~~${i}~~duration`} />
                </span>
              </div>

              {/* Company name */}
              <div style={{
                fontSize: '10.5pt',
                color: '#333',
                fontStyle: 'italic',
                marginBottom: '6px',
              }}>
                <T value={exp.company} path={`experience~~${i}~~company`} />
              </div>

              {/* Bullet points — listStyleType: disc overrides Tailwind reset */}
              <ul style={{
                margin: '0',
                paddingLeft: '20px',
                listStyleType: 'disc',
              }}>
                {exp.bullets.map((b, j) => (
                  <li key={j} style={{
                    marginBottom: '2px',
                    lineHeight: '1.4',
                    color: '#111',
                    fontSize: '10.5pt',
                  }}>
                    <T value={b} path={`experience~~${i}~~bullets~~${j}`} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </AtsSection>
      )}

      {/* ── PROJECTS ────────────────────────────────────────────── */}
      {data.projects && data.projects.some(p => p.name) && (
        <AtsSection title="Projects">
          {data.projects.filter(p => p.name).map((proj, i) => (
            <div key={i} style={{ marginBottom: i < data.projects.filter(p => p.name).length - 1 ? '12px' : 0, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
                <strong style={{ fontSize: '11pt', color: '#000', fontWeight: '700' }}>
                  <T value={proj.name} path={`projects~~${i}~~name`} />
                </strong>
                {proj.link && (
                  <span style={{ fontSize: '9.5pt', color: '#333', fontStyle: 'italic' }}>
                    <T value={proj.link} path={`projects~~${i}~~link`} />
                  </span>
                )}
              </div>
              {proj.techStack && proj.techStack.length > 0 && (
                <div style={{ fontSize: '10pt', color: '#333', fontStyle: 'italic', margin: '2px 0 5px' }}>
                  Tech: {proj.techStack.join(', ')}
                </div>
              )}
              <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                {proj.bullets.map((b, j) => (
                  <li key={j} style={{ marginBottom: '2px', lineHeight: '1.4', color: '#111', fontSize: '10.5pt' }}>
                    <T value={b} path={`projects~~${i}~~bullets~~${j}`} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </AtsSection>
      )}

      {/* ── EDUCATION ───────────────────────────────────────────── */}
      {data.education.length > 0 && (
        <AtsSection title="Education">
          {data.education.map((edu, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: i < data.education.length - 1 ? '10px' : 0,
                breakInside: 'avoid',
                pageBreakInside: 'avoid',
              }}
            >
              <div>
                <strong style={{ fontSize: '11pt', color: '#000', fontWeight: '700' }}>
                  <T value={edu.degree} path={`education~~${i}~~degree`} />
                </strong>
                <div style={{ fontSize: '10.5pt', color: '#333', marginTop: '2px', fontStyle: 'italic' }}>
                  <T value={edu.institution} path={`education~~${i}~~institution`} />
                </div>
              </div>
              <span style={{
                fontSize: '10pt',
                color: '#333',
                whiteSpace: 'nowrap',
                marginLeft: '16px',
                fontStyle: 'italic',
              }}>
                <T value={edu.year} path={`education~~${i}~~year`} />
              </span>
            </div>
          ))}
        </AtsSection>
      )}

      {/* ── SKILLS ──────────────────────────────────────────────── */}
      {skillEntries.length > 0 && (
        <AtsSection title="Skills">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {skillEntries.map(([cat, skills]) => (
              <div key={cat} style={{ fontSize: '10.5pt', color: '#111', lineHeight: '1.6' }}>
                {skillEntries.length > 1 && (
                  <strong style={{ color: '#000', fontWeight: '700' }}>{cat}:{' '}</strong>
                )}
                {skills.map((s, i) => (
                  <span key={i}>
                    <T value={s} path={`skills~~${cat}~~${i}`} />
                    {i < skills.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </AtsSection>
      )}

      {/* ── CERTIFICATIONS ──────────────────────────────────────── */}
      {data.certifications.length > 0 && (
        <AtsSection title="Certifications">
          <ul style={{
            margin: 0,
            paddingLeft: '20px',
            listStyleType: 'disc',
          }}>
            {data.certifications.map((cert, i) => (
              <li key={i} style={{
                marginBottom: '4px',
                color: '#111',
                lineHeight: '1.6',
                fontSize: '10.5pt',
              }}>
                <T value={cert} path={`certifications~~${i}`} />
              </li>
            ))}
          </ul>
        </AtsSection>
      )}
    </div>
  )
}

// ── Section wrapper ──────────────────────────────────────────
function AtsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      {/* Heading stays with first entry below it */}
      <div style={{ breakAfter: 'avoid', pageBreakAfter: 'avoid', marginBottom: '5px' }}>
        <h2 style={{
          fontFamily: '"Times New Roman", Georgia, serif',
          fontSize: '11.5pt',
          fontWeight: '700',
          color: '#000000',
          margin: '0 0 3px',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
        }}>
          {title}
        </h2>
        {/* Solid horizontal rule — clearly visible separator */}
        <div style={{ borderTop: '1.5px solid #000', marginTop: '3px' }} />
      </div>
      {children}
    </div>
  )
}
