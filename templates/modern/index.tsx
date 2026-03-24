import { ResumeData } from '@/lib/types'
import EditableText from '@/components/EditableText'

interface Props {
  data: ResumeData
  editable?: boolean
  onFieldChange?: (path: string, value: string) => void
}

export default function ModernTemplate({ data, editable = false, onFieldChange }: Props) {
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
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize: '10.5pt',
        lineHeight: '1.55',
        color: '#2d3748',
        // Gradient creates the two-tone background on EVERY page —
        // fixes the "sidebar disappears on page 2" problem completely.
        background: 'linear-gradient(to right, #1e3a5f 38%, #ffffff 38%)',
        width: '210mm',
        minHeight: '297mm',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'stretch',
      }}
    >
      {/* Left sidebar — background is transparent, parent gradient handles color */}
      <div style={{
        width: '38%',
        padding: '24px 18px',
        color: '#e2e8f0',
        flexShrink: 0,
      }}>
        {/* Name */}
        <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #2d6a9f' }}>
          <h1 style={{ fontSize: '17pt', fontWeight: 'bold', color: '#ffffff', margin: '0 0 4px 0', lineHeight: 1.2 }}>
            <T value={data.name} path="name" />
          </h1>
          <p style={{ fontSize: '9.5pt', color: '#90cdf4', margin: 0 }}>
            <T value={data.jobTitle} path="jobTitle" />
          </p>
        </div>

        {/* Contact */}
        <SideSection title="Contact">
          {data.phone && (
            <ContactItem label="Phone">
              <T value={data.phone} path="phone" />
            </ContactItem>
          )}
          {data.email && (
            <ContactItem label="Email">
              <T value={data.email} path="email" />
            </ContactItem>
          )}
          {data.linkedin && (
            <ContactItem label="LinkedIn">
              <T value={data.linkedin} path="linkedin" />
            </ContactItem>
          )}
          {data.portfolio && (
            <ContactItem label="Portfolio">
              <T value={data.portfolio} path="portfolio" />
            </ContactItem>
          )}
        </SideSection>

        {/* Skills */}
        {skillEntries.length > 0 && (
          <SideSection title="Skills">
            {skillEntries.map(([category, skills]) => (
              <div key={category} style={{ marginBottom: '8px' }}>
                {skillEntries.length > 1 && (
                  <p style={{ fontSize: '8.5pt', color: '#90cdf4', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {category}
                  </p>
                )}
                {skills.map((skill, i) => (
                  <div key={i} style={{ fontSize: '9.5pt', color: '#e2e8f0', marginBottom: '2px' }}>
                    • <T value={skill} path={`skills~~${category}~~${i}`} />
                  </div>
                ))}
              </div>
            ))}
          </SideSection>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <SideSection title="Education">
            {data.education.map((edu, i) => (
              <div key={i} style={{ marginBottom: '8px' }}>
                <p style={{ fontSize: '10pt', fontWeight: 'bold', color: '#ffffff', margin: '0 0 2px 0' }}>
                  <T value={edu.degree} path={`education~~${i}~~degree`} />
                </p>
                <p style={{ fontSize: '9pt', color: '#90cdf4', margin: '0 0 1px 0' }}>
                  <T value={edu.institution} path={`education~~${i}~~institution`} />
                </p>
                <p style={{ fontSize: '8.5pt', color: '#a0aec0', margin: 0 }}>
                  <T value={edu.year} path={`education~~${i}~~year`} />
                </p>
              </div>
            ))}
          </SideSection>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <SideSection title="Certifications">
            {data.certifications.map((cert, i) => (
              <p key={i} style={{ fontSize: '9.5pt', margin: '0 0 4px 0' }}>
                • <T value={cert} path={`certifications~~${i}`} />
              </p>
            ))}
          </SideSection>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '24px 20px', background: '#ffffff' }}>
        {/* Summary */}
        {data.summary && (
          <MainSection title="Profile">
            <T value={data.summary} path="summary" tag="p" style={{ margin: 0, textAlign: 'justify', color: '#4a5568' }} />
          </MainSection>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <MainSection title="Experience">
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < data.experience.length - 1 ? '14px' : 0, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '11pt', color: '#1e3a5f' }}>
                    <T value={exp.role} path={`experience~~${i}~~role`} />
                  </strong>
                  <span style={{
                    fontSize: '8.5pt',
                    background: '#ebf8ff',
                    color: '#2b6cb0',
                    padding: '1px 7px',
                    borderRadius: '10px',
                    whiteSpace: 'nowrap',
                  }}>
                    <T value={exp.duration} path={`experience~~${i}~~duration`} />
                  </span>
                </div>
                <p style={{ fontSize: '9.5pt', color: '#718096', margin: '2px 0 6px 0' }}>
                  <T value={exp.company} path={`experience~~${i}~~company`} />
                </p>
                <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                  {exp.bullets.map((b, j) => (
                    <li key={j} style={{ marginBottom: '3px', color: '#4a5568' }}>
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

function SideSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <h3 style={{
        fontSize: '9pt',
        fontWeight: 'bold',
        color: '#90cdf4',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        margin: '0 0 8px 0',
        paddingBottom: '4px',
        borderBottom: '1px solid #2d6a9f',
      }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

function ContactItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '5px' }}>
      <span style={{ fontSize: '8pt', color: '#90cdf4', display: 'block' }}>{label}</span>
      <span style={{ fontSize: '9pt', wordBreak: 'break-all' }}>{children}</span>
    </div>
  )
}

function MainSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <h2 style={{
        fontSize: '12pt',
        fontWeight: 'bold',
        color: '#1e3a5f',
        margin: '0 0 8px 0',
        paddingBottom: '4px',
        borderBottom: '2px solid #bee3f8',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        breakAfter: 'avoid',
        pageBreakAfter: 'avoid',
      }}>
        {title}
      </h2>
      {children}
    </div>
  )
}
