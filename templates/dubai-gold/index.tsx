import { ResumeData } from '@/lib/types'
import EditableText from '@/components/EditableText'

// Dubai Gold — Premium look with gold accents, dark navy header.
// Designed for Pakistan + Gulf/Middle East market.
// Professional across all industries: IT, medical, banking, management.

interface Props {
  data: ResumeData
  editable?: boolean
  onFieldChange?: (path: string, value: string) => void
}

const NAVY   = '#1e3a5f'   // softer medium navy blue
const GOLD   = '#c9a84c'   // warm gold
const GOLD2  = '#e8c96d'   // lighter gold for gradients
const WHITE  = '#ffffff'
const OFF    = '#ffffff'   // pure white body

export default function DubaiGoldTemplate({ data, editable = false, onFieldChange }: Props) {
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
      fontFamily: '"Segoe UI", "Trebuchet MS", Arial, sans-serif',
      fontSize: '10.5pt',
      lineHeight: '1.4',
      color: '#1a1a2e',
      background: OFF,
      width: '210mm',
      minHeight: '297mm',
      boxSizing: 'border-box',
      margin: '0 auto',
      padding: '0',
    }}>

      {/* ── HEADER — full-width navy block ── */}
      <div style={{ background: NAVY, padding: '0 20mm', position: 'relative', overflow: 'hidden' }}>
        {/* Gold shimmer top */}
        <div style={{ height: '4px', background: `linear-gradient(90deg, ${NAVY}, ${GOLD}, ${GOLD2}, ${GOLD}, ${NAVY})` }} />

        {/* Decorative gold arc — top right */}
        <div style={{
          position: 'absolute', top: '-30px', right: '-30px',
          width: '160px', height: '160px', borderRadius: '50%',
          border: `2px solid ${GOLD}22`,
        }} />
        <div style={{
          position: 'absolute', top: '-10px', right: '-10px',
          width: '100px', height: '100px', borderRadius: '50%',
          border: `1px solid ${GOLD}33`,
        }} />

        <div style={{ padding: '12mm 0 10mm', position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontFamily: '"Segoe UI", Arial, sans-serif',
            fontSize: '26pt', fontWeight: '600',
            color: WHITE, margin: '0 0 4px', lineHeight: '1.1', letterSpacing: '0.3px',
          }}>
            <T value={data.name} path="name" />
          </h1>

          {/* Gold rule after name */}
          <div style={{ width: '60px', height: '2px', background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, margin: '6px 0 8px' }} />

          <div style={{ fontSize: '12pt', color: GOLD, fontWeight: '500', margin: '0 0 12px', letterSpacing: '0.3px' }}>
            <T value={data.jobTitle} path="jobTitle" />
          </div>

          {/* Contact pills */}
          {contacts.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {contacts.map((val, i) => (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  background: 'rgba(201,168,76,0.12)', border: `1px solid ${GOLD}44`,
                  borderRadius: '20px', padding: '3px 10px',
                  fontSize: '8.5pt', color: '#c8d4e8',
                }}>
                  <span style={{ color: GOLD, fontSize: '7pt' }}>◆</span>
                  <T value={val!} path={contactPaths[i]} />
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Gold shimmer bottom */}
        <div style={{ height: '3px', background: `linear-gradient(90deg, ${NAVY}, ${GOLD}, ${GOLD2}, ${GOLD}, ${NAVY})` }} />
      </div>

      {/* ── BODY ── */}
      <div style={{ padding: '8mm 16mm' }}>

        {/* ── SUMMARY ── */}
        {data.summary && (
          <DSection title="Professional Summary" navy={NAVY} gold={GOLD}>
            <T value={data.summary} path="summary" tag="p" style={{
              margin: 0, lineHeight: '1.5', textAlign: 'justify',
              fontSize: '10.5pt', color: '#2c2c3e',
            }} />
          </DSection>
        )}

        {/* ── EXPERIENCE ── */}
        {data.experience.length > 0 && (
          <DSection title="Professional Experience" navy={NAVY} gold={GOLD}>
            {data.experience.map((exp, i) => (
              <div key={i} style={{
                marginBottom: i < data.experience.length - 1 ? '10px' : 0,
                breakInside: 'avoid', pageBreakInside: 'avoid',
                borderLeft: `3px solid ${GOLD}`,
                paddingLeft: '12px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
                  <strong style={{ fontSize: '11pt', color: NAVY, fontWeight: '700' }}>
                    <T value={exp.role} path={`experience~~${i}~~role`} />
                  </strong>
                  <span style={{
                    fontSize: '8.5pt', background: NAVY, color: GOLD,
                    padding: '1px 8px', borderRadius: '12px', whiteSpace: 'nowrap', fontWeight: '500',
                  }}>
                    <T value={exp.duration} path={`experience~~${i}~~duration`} />
                  </span>
                </div>
                <div style={{ fontSize: '10pt', color: GOLD, fontWeight: '600', margin: '1px 0 6px' }}>
                  <T value={exp.company} path={`experience~~${i}~~company`} />
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                  {exp.bullets.map((b, j) => (
                    <li key={j} style={{ marginBottom: '2px', lineHeight: '1.4', fontSize: '10pt', color: '#2c2c3e' }}>
                      <T value={b} path={`experience~~${i}~~bullets~~${j}`} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </DSection>
        )}

        {/* ── PROJECTS ── */}
        {data.projects && data.projects.some(p => p.name) && (
          <DSection title="Projects" navy={NAVY} gold={GOLD}>
            {data.projects.filter(p => p.name).map((proj, i) => (
              <div key={i} style={{
                marginBottom: i < data.projects.filter(p => p.name).length - 1 ? '12px' : 0,
                breakInside: 'avoid', pageBreakInside: 'avoid',
                borderLeft: `3px solid ${GOLD}`,
                paddingLeft: '12px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
                  <strong style={{ fontSize: '11pt', color: NAVY, fontWeight: '700' }}>
                    <T value={proj.name} path={`projects~~${i}~~name`} />
                  </strong>
                  {proj.link && (
                    <span style={{ fontSize: '8.5pt', color: GOLD, fontWeight: '500' }}>
                      <T value={proj.link} path={`projects~~${i}~~link`} />
                    </span>
                  )}
                </div>
                {proj.techStack && proj.techStack.length > 0 && (
                  <div style={{ fontSize: '10pt', color: GOLD, fontWeight: '600', margin: '1px 0 5px' }}>
                    {proj.techStack.join(' · ')}
                  </div>
                )}
                <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                  {proj.bullets.map((b, j) => (
                    <li key={j} style={{ marginBottom: '2px', lineHeight: '1.4', fontSize: '10pt', color: '#2c2c3e' }}>
                      <T value={b} path={`projects~~${i}~~bullets~~${j}`} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </DSection>
        )}

        {/* ── EDUCATION ── */}
        {data.education.length > 0 && (
          <DSection title="Education" navy={NAVY} gold={GOLD}>
            {data.education.map((edu, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                marginBottom: i < data.education.length - 1 ? '10px' : 0,
                breakInside: 'avoid', pageBreakInside: 'avoid',
                background: 'rgba(201,168,76,0.06)', borderRadius: '6px',
                padding: '8px 12px',
              }}>
                <div>
                  <strong style={{ fontSize: '11pt', color: NAVY }}>
                    <T value={edu.degree} path={`education~~${i}~~degree`} />
                  </strong>
                  <div style={{ fontSize: '10pt', color: '#555', marginTop: '2px' }}>
                    <T value={edu.institution} path={`education~~${i}~~institution`} />
                  </div>
                </div>
                <span style={{ fontSize: '9.5pt', color: GOLD, whiteSpace: 'nowrap', marginLeft: '12px', fontWeight: '600' }}>
                  <T value={edu.year} path={`education~~${i}~~year`} />
                </span>
              </div>
            ))}
          </DSection>
        )}

        {/* ── SKILLS ── */}
        {skillEntries.length > 0 && (
          <DSection title="Skills" navy={NAVY} gold={GOLD}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {skillEntries.map(([cat, skills]) => (
                <div key={cat} style={{ fontSize: '10pt', lineHeight: '1.65' }}>
                  {skillEntries.length > 1 && (
                    <strong style={{ color: NAVY, marginRight: '4px' }}>{cat}:</strong>
                  )}
                  {skills.map((s, i) => (
                    <span key={i}><T value={s} path={`skills~~${cat}~~${i}`} />{i < skills.length - 1 ? ', ' : ''}</span>
                  ))}
                </div>
              ))}
            </div>
          </DSection>
        )}

        {/* ── CERTIFICATIONS ── */}
        {data.certifications.length > 0 && (
          <DSection title="Certifications" navy={NAVY} gold={GOLD}>
            <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
              {data.certifications.map((cert, i) => (
                <li key={i} style={{ marginBottom: '2px', fontSize: '10pt', lineHeight: '1.4', color: '#2c2c3e' }}>
                  <T value={cert} path={`certifications~~${i}`} />
                </li>
              ))}
            </ul>
          </DSection>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ height: '4px', background: `linear-gradient(90deg, ${NAVY}, ${GOLD}, ${GOLD2}, ${GOLD}, ${NAVY})`, marginTop: 'auto' }} />
    </div>
  )
}

function DSection({ title, children, navy, gold }: { title: string; children: React.ReactNode; navy: string; gold: string }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ breakAfter: 'avoid', pageBreakAfter: 'avoid', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Gold diamond marker */}
        <span style={{ color: gold, fontSize: '9pt', flexShrink: 0 }}>◆</span>
        <h2 style={{
          fontFamily: '"Segoe UI", Arial, sans-serif',
          fontSize: '11pt', fontWeight: '700', color: navy,
          textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0,
        }}>{title}</h2>
        <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${gold}66, transparent)` }} />
      </div>
      {children}
    </div>
  )
}
