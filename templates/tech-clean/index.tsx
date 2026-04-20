import { ResumeData } from '@/lib/types'
import EditableText from '@/components/EditableText'

interface Props {
  data: ResumeData
  editable?: boolean
  onFieldChange?: (path: string, value: string) => void
}

// Tech Clean — consistent with Classic Professional blue theme:
// • BLUE (#0047AB) section headings + full-width 1px blue rule
// • Near-black (#111111) body text — zero gray
// • Skills: 2-col table when categorised, grid when 5+, pills otherwise
// • Dates: italic dark charcoal — not light gray
// • Company: bold blue

const BLUE   = '#0047AB'   // cobalt blue — headings, rules, company, links
const DARK   = '#0f172a'   // near-black — name, role titles
const BODY   = '#111111'   // near-black — all body/bullet text
const SUB    = '#444444'   // dark muted — subtitle, institution
const BORDER = '#e2e8f0'   // light gray — contact bar only

function safeHref(raw: string, scheme: 'http' | 'mailto' | 'tel'): string {
  if (scheme === 'mailto') return `mailto:${raw}`
  if (scheme === 'tel')    return `tel:${raw.replace(/\s/g, '')}`
  return raw.startsWith('http') ? raw : `https://${raw}`
}

export default function TechClean({ data, editable = false, onFieldChange }: Props) {
  const skillEntries = Object.entries(data.skills)
  const totalSkills  = skillEntries.reduce((n, [, s]) => n + s.length, 0)
  const useTable     = skillEntries.length > 1
  const useGrid      = !useTable && totalSkills >= 5

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
        fontFamily: '"Inter", "Segoe UI", Arial, sans-serif',
        fontSize: '10pt',
        lineHeight: '1.4',
        color: BODY,
        background: '#ffffff',
        width: '210mm',
        minHeight: '297mm',
        boxSizing: 'border-box',
        margin: '0 auto',
        padding: '10mm 12mm',
      }}
    >
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: '14px' }}>
        <h1 style={{
          fontSize: '26pt',
          fontWeight: '700',
          margin: '0 0 2px',
          color: DARK,
          letterSpacing: '-0.5px',
        }}>
          <T value={data.name} path="name" />
        </h1>

        {/* Job title — blue accent */}
        <div style={{ fontSize: '12pt', color: BLUE, fontWeight: '600', marginBottom: '8px' }}>
          <T value={data.jobTitle} path="jobTitle" />
        </div>

        {/* Contact bar — dark text, blue links, thin border top/bottom */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px 16px',
          fontSize: '9pt',
          color: SUB,
          borderTop: `1px solid ${BORDER}`,
          borderBottom: `1px solid ${BORDER}`,
          padding: '7px 0',
        }}>
          {data.phone && (
            <a href={safeHref(data.phone, 'tel')} style={{ color: SUB, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: BLUE }}>↳</span>
              <T value={data.phone} path="phone" />
            </a>
          )}
          {data.email && (
            <a href={safeHref(data.email, 'mailto')} style={{ color: BLUE, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: BLUE }}>↳</span>
              <T value={data.email} path="email" />
            </a>
          )}
          {data.linkedin && (
            <a href={safeHref(data.linkedin, 'http')} style={{ color: BLUE, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: BLUE }}>↳</span>
              <T value={data.linkedin} path="linkedin" />
            </a>
          )}
          {data.portfolio && (
            <a href={safeHref(data.portfolio, 'http')} style={{ color: BLUE, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: BLUE }}>↳</span>
              <T value={data.portfolio} path="portfolio" />
            </a>
          )}
        </div>
      </div>

      {/* ── SUMMARY ─────────────────────────────────────────────── */}
      {data.summary && (
        <TechSection title="Summary">
          <T
            value={data.summary}
            path="summary"
            tag="p"
            style={{ margin: 0, color: BODY, lineHeight: '1.5', textAlign: 'justify' }}
          />
        </TechSection>
      )}

      {/* ── WORK EXPERIENCE ─────────────────────────────────────── */}
      {data.experience.length > 0 && (
        <TechSection title="Work Experience">
          {data.experience.map((exp, i) => (
            <div
              key={i}
              style={{
                marginBottom: i < data.experience.length - 1 ? '10px' : 0,
                breakInside: 'avoid',
                pageBreakInside: 'avoid',
              }}
            >
              {/* Role + Duration */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
                <strong style={{ fontSize: '10.5pt', color: DARK, fontWeight: '700' }}>
                  <T value={exp.role} path={`experience~~${i}~~role`} />
                </strong>
                {/* Date — italic dark charcoal, NOT light gray */}
                <span style={{ fontSize: '9pt', color: '#1a1a1a', fontStyle: 'italic', whiteSpace: 'nowrap' }}>
                  <T value={exp.duration} path={`experience~~${i}~~duration`} />
                </span>
              </div>

              {/* Company — bold blue */}
              <div style={{ fontSize: '9.5pt', color: BLUE, fontWeight: '700', marginBottom: '6px' }}>
                <T value={exp.company} path={`experience~~${i}~~company`} />
              </div>

              {/* Bullets — › marker + near-black text */}
              <ul style={{ margin: 0, paddingLeft: '16px', listStyleType: 'none' }}>
                {exp.bullets.map((b, j) => (
                  <li key={j} style={{ marginBottom: '2px', color: BODY, lineHeight: '1.4', position: 'relative', paddingLeft: '12px' }}>
                    <span style={{ position: 'absolute', left: 0, color: BLUE, fontWeight: '700', fontSize: '10pt' }}>›</span>
                    <T value={b} path={`experience~~${i}~~bullets~~${j}`} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </TechSection>
      )}

      {/* ── PROJECTS ────────────────────────────────────────────── */}
      {data.projects && data.projects.some(p => p.name) && (
        <TechSection title="Projects">
          {data.projects.filter(p => p.name).map((proj, i) => (
            <div key={i} style={{ marginBottom: i < data.projects!.filter(p => p.name).length - 1 ? '10px' : 0, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
                <strong style={{ fontSize: '10.5pt', color: DARK, fontWeight: '700' }}>
                  <T value={proj.name} path={`projects~~${i}~~name`} />
                </strong>
                {proj.link && (
                  <a href={safeHref(proj.link, 'http')} style={{ fontSize: '9pt', color: BLUE, textDecoration: 'underline' }}>
                    <T value={proj.link} path={`projects~~${i}~~link`} />
                  </a>
                )}
              </div>
              {proj.techStack && proj.techStack.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '4px 0 6px' }}>
                  {proj.techStack.map((tech, j) => (
                    <span key={j} style={{
                      background: '#E8F0FB', border: `1px solid ${BLUE}33`,
                      color: BLUE, padding: '1px 8px', borderRadius: '4px', fontSize: '8.5pt', fontWeight: '500',
                    }}>
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              <ul style={{ margin: 0, paddingLeft: '16px', listStyleType: 'none' }}>
                {proj.bullets.map((b, j) => (
                  <li key={j} style={{ marginBottom: '2px', color: BODY, lineHeight: '1.4', position: 'relative', paddingLeft: '12px' }}>
                    <span style={{ position: 'absolute', left: 0, color: BLUE, fontWeight: '700', fontSize: '10pt' }}>›</span>
                    <T value={b} path={`projects~~${i}~~bullets~~${j}`} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </TechSection>
      )}

      {/* ── EDUCATION ───────────────────────────────────────────── */}
      {data.education.length > 0 && (
        <TechSection title="Education">
          {data.education.map((edu, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: i < data.education.length - 1 ? '8px' : 0,
                breakInside: 'avoid',
                pageBreakInside: 'avoid',
              }}
            >
              <div>
                <strong style={{ fontSize: '10.5pt', color: DARK, fontWeight: '700' }}>
                  <T value={edu.degree} path={`education~~${i}~~degree`} />
                </strong>
                <div style={{ fontSize: '9.5pt', color: SUB, marginTop: '1px' }}>
                  <T value={edu.institution} path={`education~~${i}~~institution`} />
                </div>
              </div>
              {/* Year — italic dark, NOT light gray */}
              <span style={{ fontSize: '9pt', color: '#1a1a1a', fontStyle: 'italic', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                <T value={edu.year} path={`education~~${i}~~year`} />
              </span>
            </div>
          ))}
        </TechSection>
      )}

      {/* ── SKILLS ──────────────────────────────────────────────── */}
      {skillEntries.length > 0 && (
        <TechSection title="Skills">
          {useTable ? (
            /* 2-column table for multiple categories */
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt', lineHeight: '1.5' }}>
              <tbody>
                {skillEntries.map(([category, skills]) => (
                  <tr key={category} style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <td style={{
                      width: '165px', padding: '5px 10px',
                      border: '1px solid #c8c8c8',
                      fontWeight: '700', color: BLUE,
                      verticalAlign: 'top', whiteSpace: 'nowrap',
                    }}>
                      {category}
                    </td>
                    <td style={{
                      padding: '5px 10px', border: '1px solid #c8c8c8',
                      color: BODY, verticalAlign: 'top',
                    }}>
                      {skills.map((s, i) => (
                        <span key={i}>
                          <T value={s} path={`skills~~${category}~~${i}`} />
                          {i < skills.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : useGrid ? (
            /* 3-column grid for single category 5+ skills */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px' }}>
              {skillEntries[0][1].map((s, i) => (
                <div key={i} style={{
                  background: '#E8F0FB', border: `1px solid ${BLUE}33`,
                  borderLeft: `3px solid ${BLUE}`,
                  color: BODY, padding: '5px 10px',
                  borderRadius: '4px', fontSize: '9pt', fontWeight: '500',
                  breakInside: 'avoid',
                }}>
                  <T value={s} path={`skills~~${skillEntries[0][0]}~~${i}`} />
                </div>
              ))}
            </div>
          ) : (
            /* Pill tags for few skills */
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {skillEntries.flatMap(([cat, skills]) =>
                skills.map((s, i) => (
                  <span key={`${cat}-${i}`} style={{
                    background: '#E8F0FB', border: `1px solid ${BLUE}33`,
                    color: BODY, padding: '2px 9px',
                    borderRadius: '4px', fontSize: '9pt', fontWeight: '500',
                  }}>
                    <T value={s} path={`skills~~${cat}~~${i}`} />
                  </span>
                ))
              )}
            </div>
          )}
        </TechSection>
      )}

      {/* ── CERTIFICATIONS ──────────────────────────────────────── */}
      {data.certifications.length > 0 && (
        <TechSection title="Certifications">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {data.certifications.map((cert, i) => (
              <span key={i} style={{
                background: '#E8F0FB', border: `1px solid ${BLUE}33`,
                color: BODY, padding: '2px 12px',
                borderRadius: '4px', fontSize: '9.5pt', fontWeight: '500',
              }}>
                <T value={cert} path={`certifications~~${i}`} />
              </span>
            ))}
          </div>
        </TechSection>
      )}
    </div>
  )
}

// ── Section wrapper ──────────────────────────────────────────
// BLUE heading + full-width 1px blue rule (was gray DIVIDER before)
function TechSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ breakAfter: 'avoid', pageBreakAfter: 'avoid', marginBottom: '5px' }}>
        <h2 style={{
          fontSize: '10pt',
          fontWeight: '800',
          color: BLUE,           // was DARK (#0f172a) — now cobalt blue
          margin: '0 0 3px',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ color: BLUE, fontWeight: '400', fontSize: '11pt' }}>—</span>
          {title}
        </h2>
        {/* Full-width 1px blue rule — was #e2e8f0 gray before */}
        <div style={{ height: '1px', background: BLUE }} />
      </div>
      {children}
    </div>
  )
}
