import { ResumeData } from '@/lib/types'
import EditableText from '@/components/EditableText'

interface Props {
  data: ResumeData
  editable?: boolean
  onFieldChange?: (path: string, value: string) => void
}

export default function MinimalTemplate({ data, editable = false, onFieldChange }: Props) {
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
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        fontSize: '10pt',
        lineHeight: '1.6',
        color: '#333333',
        background: '#ffffff',
        width: '210mm',
        minHeight: '297mm',
        padding: '18mm 20mm',
        boxSizing: 'border-box',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '18px' }}>
        <h1 style={{ fontSize: '24pt', fontWeight: '300', color: '#111111', margin: '0 0 2px 0', letterSpacing: '2px' }}>
          <T value={data.name.toUpperCase()} path="name" />
        </h1>
        <p style={{ fontSize: '10pt', color: '#888888', margin: '0 0 8px 0', letterSpacing: '1px' }}>
          <T value={data.jobTitle.toUpperCase()} path="jobTitle" />
        </p>
        <p style={{ fontSize: '9pt', color: '#aaaaaa', margin: 0 }}>
          <T value={data.phone} path="phone" />
          {data.phone && data.email && '   ·   '}
          <T value={data.email} path="email" />
          {data.email && data.linkedin && '   ·   '}
          {data.linkedin && <T value={data.linkedin} path="linkedin" />}
          {data.linkedin && data.portfolio && '   ·   '}
          {data.portfolio && <T value={data.portfolio} path="portfolio" />}
        </p>
      </div>

      <div style={{ borderTop: '1px solid #e0e0e0', marginBottom: '18px' }} />

      {/* Summary */}
      {data.summary && (
        <MinSection title="Summary">
          <T value={data.summary} path="summary" tag="p" style={{ margin: 0, color: '#555555' }} />
        </MinSection>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <MinSection title="Experience">
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < data.experience.length - 1 ? '14px' : 0, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold', color: '#222222' }}>
                  <T value={exp.role} path={`experience~~${i}~~role`} />
                </span>
                <span style={{ color: '#aaaaaa', fontSize: '9pt' }}>
                  <T value={exp.duration} path={`experience~~${i}~~duration`} />
                </span>
              </div>
              <p style={{ color: '#888888', fontSize: '9.5pt', margin: '1px 0 6px 0' }}>
                <T value={exp.company} path={`experience~~${i}~~company`} />
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc', color: '#555555' }}>
                {exp.bullets.map((b, j) => (
                  <li key={j} style={{ marginBottom: '2px' }}>
                    <T value={b} path={`experience~~${i}~~bullets~~${j}`} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </MinSection>
      )}

      {/* Skills */}
      {skillEntries.length > 0 && (
        <MinSection title="Skills">
          {skillEntries.map(([category, skills]) => (
            <div key={category} style={{ marginBottom: '4px' }}>
              {skillEntries.length > 1 && (
                <span style={{ color: '#888888', fontSize: '9pt' }}>{category}: </span>
              )}
              {skills.map((skill, i) => (
                <span key={i} style={{ color: '#555555' }}>
                  <T value={skill} path={`skills~~${category}~~${i}`} />
                  {i < skills.length - 1 && ' · '}
                </span>
              ))}
            </div>
          ))}
        </MinSection>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <MinSection title="Education">
          {data.education.map((edu, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>
                <strong style={{ color: '#222222' }}>
                  <T value={edu.degree} path={`education~~${i}~~degree`} />
                </strong>
                <span style={{ color: '#888888' }}> · </span>
                <T value={edu.institution} path={`education~~${i}~~institution`} style={{ color: '#888888' }} />
              </span>
              <span style={{ color: '#aaaaaa', fontSize: '9pt' }}>
                <T value={edu.year} path={`education~~${i}~~year`} />
              </span>
            </div>
          ))}
        </MinSection>
      )}

      {/* Certifications */}
      {data.certifications.length > 0 && (
        <MinSection title="Certifications">
          <p style={{ margin: 0, color: '#555555' }}>
            {data.certifications.map((cert, i) => (
              <span key={i}>
                <T value={cert} path={`certifications~~${i}`} />
                {i < data.certifications.length - 1 && ' · '}
              </span>
            ))}
          </p>
        </MinSection>
      )}
    </div>
  )
}

function MinSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <h2 style={{
        fontSize: '8pt',
        fontWeight: 'bold',
        color: '#aaaaaa',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        margin: '0 0 8px 0',
        breakAfter: 'avoid',
        pageBreakAfter: 'avoid',
      }}>
        {title}
      </h2>
      {children}
      <div style={{ borderTop: '1px solid #f0f0f0', marginTop: '14px' }} />
    </div>
  )
}
