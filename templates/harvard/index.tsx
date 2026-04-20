import { ResumeData } from '@/lib/types'
import EditableText from '@/components/EditableText'

interface Props {
  data: ResumeData
  editable?: boolean
  onFieldChange?: (path: string, value: string) => void
}

export default function HarvardTemplate({ data, editable = false, onFieldChange }: Props) {
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
      fontFamily: 'Garamond, "Times New Roman", Georgia, serif',
      fontSize: '11pt',
      lineHeight: '1.4',
      color: '#111',
      background: '#fff',
      width: '210mm',
      minHeight: '297mm',
      boxSizing: 'border-box',
      margin: '0 auto',
      padding: '12mm 16mm',
    }}>

      {/* ── HEADER ── */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h1 style={{ fontFamily: 'Garamond, "Times New Roman", Georgia, serif', fontSize: '20pt', fontWeight: '700', margin: '0 0 3px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#000' }}>
          <T value={data.name} path="name" />
        </h1>
        <div style={{ fontSize: '10pt', color: '#444', margin: '3px 0 6px', fontStyle: 'italic' }}>
          <T value={data.jobTitle} path="jobTitle" />
        </div>
        {contacts.length > 0 && (
          <div style={{ fontSize: '9.5pt', color: '#333', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 0 }}>
            {contacts.map((val, i) => (
              <span key={i}>
                {i > 0 && <span style={{ margin: '0 8px', color: '#999' }}>|</span>}
                <T value={val!} path={contactPaths[i]} />
              </span>
            ))}
          </div>
        )}
      </div>

      {/* thick top + thin bottom double rule */}
      <div style={{ borderTop: '2.5px solid #000', marginBottom: '1px' }} />
      <div style={{ borderTop: '0.75px solid #000', marginBottom: '10px' }} />

      {/* ── SUMMARY ── */}
      {data.summary && (
        <HSection title="Summary">
          <T value={data.summary} path="summary" tag="p" style={{ margin: 0, textAlign: 'justify', lineHeight: '1.5', fontSize: '10.5pt' }} />
        </HSection>
      )}

      {/* ── EXPERIENCE ── */}
      {data.experience.length > 0 && (
        <HSection title="Experience">
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < data.experience.length - 1 ? '8px' : 0, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '11pt', color: '#000' }}>
                  <T value={exp.role} path={`experience~~${i}~~role`} />
                  {exp.company && <span style={{ fontWeight: 400, color: '#333' }}>, <T value={exp.company} path={`experience~~${i}~~company`} /></span>}
                </strong>
                <span style={{ fontSize: '10pt', color: '#1a1a1a', whiteSpace: 'nowrap', fontStyle: 'italic' }}>
                  <T value={exp.duration} path={`experience~~${i}~~duration`} />
                </span>
              </div>
              <ul style={{ margin: '4px 0 0', paddingLeft: '20px', listStyleType: 'disc' }}>
                {exp.bullets.map((b, j) => (
                  <li key={j} style={{ marginBottom: '2px', lineHeight: '1.4', fontSize: '10.5pt', color: '#1a1a1a' }}>
                    <T value={b} path={`experience~~${i}~~bullets~~${j}`} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </HSection>
      )}

      {/* ── PROJECTS ── */}
      {data.projects && data.projects.some(p => p.name) && (
        <HSection title="Projects">
          {data.projects.filter(p => p.name).map((proj, i) => (
            <div key={i} style={{ marginBottom: i < data.projects.filter(p => p.name).length - 1 ? '12px' : 0, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '11pt', color: '#000' }}>
                  <T value={proj.name} path={`projects~~${i}~~name`} />
                </strong>
                {proj.link && (
                  <span style={{ fontSize: '9.5pt', color: '#555', fontStyle: 'italic' }}>
                    <T value={proj.link} path={`projects~~${i}~~link`} />
                  </span>
                )}
              </div>
              {proj.techStack && proj.techStack.length > 0 && (
                <div style={{ fontSize: '10pt', color: '#444', fontStyle: 'italic', margin: '2px 0 5px' }}>
                  {proj.techStack.join(' · ')}
                </div>
              )}
              <ul style={{ margin: '4px 0 0', paddingLeft: '20px', listStyleType: 'disc' }}>
                {proj.bullets.map((b, j) => (
                  <li key={j} style={{ marginBottom: '2px', lineHeight: '1.4', fontSize: '10.5pt', color: '#1a1a1a' }}>
                    <T value={b} path={`projects~~${i}~~bullets~~${j}`} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </HSection>
      )}

      {/* ── EDUCATION ── */}
      {data.education.length > 0 && (
        <HSection title="Education">
          {data.education.map((edu, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: i < data.education.length - 1 ? '8px' : 0, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <div>
                <strong style={{ fontSize: '11pt', color: '#000' }}>
                  <T value={edu.degree} path={`education~~${i}~~degree`} />
                </strong>
                <div style={{ fontSize: '10pt', color: '#444', fontStyle: 'italic', marginTop: '1px' }}>
                  <T value={edu.institution} path={`education~~${i}~~institution`} />
                </div>
              </div>
              <span style={{ fontSize: '10pt', color: '#1a1a1a', whiteSpace: 'nowrap', marginLeft: '16px', fontStyle: 'italic' }}>
                <T value={edu.year} path={`education~~${i}~~year`} />
              </span>
            </div>
          ))}
        </HSection>
      )}

      {/* ── SKILLS ── */}
      {skillEntries.length > 0 && (
        <HSection title="Skills">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {skillEntries.map(([cat, skills]) => (
              <div key={cat} style={{ fontSize: '10.5pt', lineHeight: '1.55' }}>
                {skillEntries.length > 1 && <strong style={{ color: '#000' }}>{cat}: </strong>}
                {skills.map((s, i) => (
                  <span key={i}><T value={s} path={`skills~~${cat}~~${i}`} />{i < skills.length - 1 ? ', ' : ''}</span>
                ))}
              </div>
            ))}
          </div>
        </HSection>
      )}

      {/* ── CERTIFICATIONS ── */}
      {data.certifications.length > 0 && (
        <HSection title="Certifications">
          <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
            {data.certifications.map((cert, i) => (
              <li key={i} style={{ marginBottom: '3px', fontSize: '10.5pt', lineHeight: '1.55' }}>
                <T value={cert} path={`certifications~~${i}`} />
              </li>
            ))}
          </ul>
        </HSection>
      )}
    </div>
  )
}

function HSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
        <h2 style={{
          fontFamily: 'Garamond, "Times New Roman", Georgia, serif',
          fontSize: '11.5pt',
          fontWeight: '700',
          color: '#000',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          margin: '0 0 3px',
        }}>{title}</h2>
        <div style={{ borderTop: '1px solid #000', marginBottom: '5px' }} />
      </div>
      {children}
    </div>
  )
}
