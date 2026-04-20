import { ResumeData } from '@/lib/types'
import EditableText from '@/components/EditableText'

interface Props {
  data: ResumeData
  editable?: boolean
  onFieldChange?: (path: string, value: string) => void
}

// Classic Professional — matches the PDF reference design exactly:
// • White clean header — no colored block
// • BOLD BLUE (#0047AB) section headings + full-width 1px blue rule
// • Skills: 2-col table (category=bold blue | skills=black text) when categorised/5+
// • Experience: role bold black + italic dark date, company bold blue
// • All body text near-black — zero gray text
// • Clickable links (tel/mailto/https) for PDF output

const BLUE = '#0047AB'  // cobalt blue — headings, rules, company, links
const DARK = '#111111'  // near-black — all body text, bullets, names
const SUB  = '#444444'  // dark muted — job-title subtitle only (not gray)

function safeHref(raw: string, scheme: 'http' | 'mailto' | 'tel'): string {
  if (scheme === 'mailto') return `mailto:${raw}`
  if (scheme === 'tel')    return `tel:${raw.replace(/\s/g, '')}`
  return raw.startsWith('http') ? raw : `https://${raw}`
}

export default function ClassicTemplate({ data, editable = false, onFieldChange }: Props) {
  const skillEntries  = Object.entries(data.skills)
  const totalSkills   = skillEntries.reduce((n, [, s]) => n + s.length, 0)
  const useTable      = skillEntries.length > 1               // multiple categories → table
  const useGrid       = !useTable && totalSkills >= 5         // single cat 5+ → grid

  function T({
    value, path, tag: Tag = 'span', style,
  }: {
    value: string; path: string; tag?: keyof React.JSX.IntrinsicElements
    style?: React.CSSProperties
  }) {
    if (editable && onFieldChange)
      return <EditableText value={value} path={path} onCommit={onFieldChange} tag={Tag} style={style} />
    return <Tag style={style}>{value}</Tag>
  }

  // Build contact items for the pipe-separated header row
  type ContactItem = { val: string; path: string; scheme: 'http' | 'mailto' | 'tel'; isLink: boolean }
  const contacts: ContactItem[] = [
    data.email    ? { val: data.email,    path: 'email',     scheme: 'mailto', isLink: true  } : null,
    data.phone    ? { val: data.phone,    path: 'phone',     scheme: 'tel',    isLink: true  } : null,
    data.linkedin ? { val: data.linkedin, path: 'linkedin',  scheme: 'http',   isLink: true  } : null,
    data.portfolio? { val: data.portfolio,path: 'portfolio', scheme: 'http',   isLink: true  } : null,
  ].filter(Boolean) as ContactItem[]

  return (
    <div
      id="resume-output"
      style={{
        fontFamily: '"Helvetica Neue", Arial, sans-serif',
        fontSize: '10.5pt',
        lineHeight: '1.4',
        color: DARK,
        background: '#ffffff',
        width: '210mm',
        minHeight: '297mm',
        boxSizing: 'border-box',
        margin: '0 auto',
        padding: '10mm 14mm',
      }}
    >

      {/* ── HEADER — white background, matches PDF reference ─── */}
      <div style={{ marginBottom: '14px' }}>
        {/* Name */}
        <h1 style={{
          fontSize: '26pt',
          fontWeight: '700',
          color: '#000000',
          margin: '0 0 3px',
          letterSpacing: '0.3px',
          lineHeight: '1.1',
        }}>
          <T value={data.name} path="name" />
        </h1>

        {/* Job title subtitle — dark muted, not gray */}
        <p style={{
          fontSize: '11pt',
          color: SUB,
          fontWeight: '400',
          margin: '0 0 8px',
          letterSpacing: '0.2px',
        }}>
          <T value={data.jobTitle} path="jobTitle" />
        </p>

        {/* Contact row — sandwiched between two 1px blue lines */}
        {contacts.length > 0 && (
          <>
            <div style={{ height: '1px', background: BLUE }} />
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 0,
              padding: '4px 0',
              fontSize: '9pt',
            }}>
              {contacts.map((c, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center' }}>
                  {i > 0 && (
                    <span style={{ margin: '0 8px', color: '#999', userSelect: 'none' }}>|</span>
                  )}
                  <a
                    href={safeHref(c.val, c.scheme)}
                    style={{ color: BLUE, textDecoration: 'none' }}
                  >
                    <T value={c.val} path={c.path} />
                  </a>
                </span>
              ))}
            </div>
            <div style={{ height: '1px', background: BLUE }} />
          </>
        )}
      </div>

      {/* ── PROFESSIONAL SUMMARY ─────────────────────────────── */}
      {data.summary && (
        <Section title="Professional Summary">
          <T
            value={data.summary}
            path="summary"
            tag="p"
            style={{ margin: 0, color: DARK, textAlign: 'justify', lineHeight: '1.5' }}
          />
        </Section>
      )}

      {/* ── WORK EXPERIENCE ──────────────────────────────────── */}
      {data.experience.length > 0 && (
        <Section title="Professional Experience">
          {data.experience.map((exp, i) => (
            <div
              key={i}
              style={{
                marginBottom: i < data.experience.length - 1 ? '10px' : 0,
                breakInside: 'avoid',
                pageBreakInside: 'avoid',
              }}
            >
              {/* Role + Date — bold black role, italic dark date */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                flexWrap: 'wrap',
                gap: '4px',
              }}>
                <strong style={{ fontSize: '11pt', color: '#000000', fontWeight: '700' }}>
                  <T value={exp.role} path={`experience~~${i}~~role`} />
                </strong>
                {/* Date — italic, dark charcoal — NOT gray */}
                <span style={{
                  fontSize: '9.5pt',
                  color: '#1a1a1a',
                  fontStyle: 'italic',
                  fontWeight: '400',
                  whiteSpace: 'nowrap',
                }}>
                  <T value={exp.duration} path={`experience~~${i}~~duration`} />
                </span>
              </div>

              {/* Company — bold blue (matches PDF exactly) */}
              <div style={{
                fontSize: '10pt',
                color: BLUE,
                fontWeight: '700',
                margin: '1px 0 6px',
              }}>
                <T value={exp.company} path={`experience~~${i}~~company`} />
              </div>

              {/* Bullets — near-black body text */}
              <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                {exp.bullets.map((b, j) => (
                  <li key={j} style={{ marginBottom: '2px', color: DARK, lineHeight: '1.4' }}>
                    <T value={b} path={`experience~~${i}~~bullets~~${j}`} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {/* ── PROJECTS ─────────────────────────────────────────── */}
      {data.projects && data.projects.some(p => p.name) && (
        <Section title="Key Projects">
          {data.projects.filter(p => p.name).map((proj, i) => {
            const active = data.projects!.filter(p => p.name)
            return (
              <div key={i} style={{
                marginBottom: i < active.length - 1 ? '10px' : 0,
                breakInside: 'avoid',
                pageBreakInside: 'avoid',
              }}>
                {/* Project name + link */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  flexWrap: 'wrap',
                  gap: '4px',
                }}>
                  <strong style={{ fontSize: '11pt', color: '#000000', fontWeight: '700' }}>
                    <T value={proj.name} path={`projects~~${i}~~name`} />
                  </strong>
                  {proj.link && (
                    <a
                      href={safeHref(proj.link, 'http')}
                      style={{ fontSize: '9pt', color: BLUE, textDecoration: 'underline' }}
                    >
                      <T value={proj.link} path={`projects~~${i}~~link`} />
                    </a>
                  )}
                </div>

                {/* Tech stack — italic dark, matches PDF "Stack:" style */}
                {proj.techStack && proj.techStack.length > 0 && (
                  <div style={{
                    fontSize: '9.5pt',
                    color: SUB,
                    fontStyle: 'italic',
                    margin: '2px 0 5px',
                  }}>
                    Stack: {proj.techStack.join(' · ')}
                  </div>
                )}

                {/* Bullets */}
                <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                  {proj.bullets.map((b, j) => (
                    <li key={j} style={{ marginBottom: '2px', color: DARK, lineHeight: '1.4' }}>
                      <T value={b} path={`projects~~${i}~~bullets~~${j}`} />
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </Section>
      )}

      {/* ── SKILLS ───────────────────────────────────────────── */}
      {skillEntries.length > 0 && (
        <Section title="Core Technical Skills">
          {useTable ? (
            /*
             * 2-COLUMN TABLE — matches PDF reference exactly.
             * Left: category label, bold blue. Right: skills, black text.
             * Triggered when multiple categories exist.
             */
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '9.5pt',
              lineHeight: '1.5',
            }}>
              <tbody>
                {skillEntries.map(([category, skills]) => (
                  <tr
                    key={category}
                    style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
                  >
                    {/* Category — bold blue, fixed width, top-aligned */}
                    <td style={{
                      width: '165px',
                      padding: '5px 10px',
                      border: '1px solid #c8c8c8',
                      fontWeight: '700',
                      color: BLUE,
                      verticalAlign: 'top',
                      whiteSpace: 'nowrap',
                    }}>
                      {category}
                    </td>
                    {/* Skills — near-black comma-separated */}
                    <td style={{
                      padding: '5px 10px',
                      border: '1px solid #c8c8c8',
                      color: DARK,
                      verticalAlign: 'top',
                    }}>
                      {skills.map((skill, i) => (
                        <span key={i}>
                          <T value={skill} path={`skills~~${category}~~${i}`} />
                          {i < skills.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : useGrid ? (
            /*
             * 3-COLUMN GRID — single category with 5+ skills.
             * Each skill in a light-blue accented cell.
             */
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '5px',
            }}>
              {skillEntries[0][1].map((skill, i) => (
                <div key={i} style={{
                  background: '#E8F0FB',
                  border: `1px solid ${BLUE}33`,
                  borderLeft: `3px solid ${BLUE}`,
                  color: DARK,
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '9pt',
                  fontWeight: '500',
                  breakInside: 'avoid',
                }}>
                  <T value={skill} path={`skills~~${skillEntries[0][0]}~~${i}`} />
                </div>
              ))}
            </div>
          ) : (
            /*
             * PILL TAGS — few skills, clean and minimal.
             */
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {skillEntries.flatMap(([cat, skills]) =>
                skills.map((skill, i) => (
                  <span key={`${cat}-${i}`} style={{
                    background: '#E8F0FB',
                    border: `1px solid ${BLUE}33`,
                    color: DARK,
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '9pt',
                    fontWeight: '500',
                  }}>
                    <T value={skill} path={`skills~~${cat}~~${i}`} />
                  </span>
                ))
              )}
            </div>
          )}
        </Section>
      )}

      {/* ── EDUCATION ────────────────────────────────────────── */}
      {data.education.length > 0 && (
        <Section title="Education">
          {data.education.map((edu, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: i < data.education.length - 1 ? '6px' : 0,
                breakInside: 'avoid',
                pageBreakInside: 'avoid',
              }}
            >
              <div>
                <strong style={{ fontSize: '11pt', color: '#000000', fontWeight: '700' }}>
                  <T value={edu.degree} path={`education~~${i}~~degree`} />
                </strong>
                <div style={{ fontSize: '9.5pt', color: SUB, marginTop: '2px' }}>
                  <T value={edu.institution} path={`education~~${i}~~institution`} />
                </div>
              </div>
              {/* Year — italic dark, consistent with dates above */}
              <span style={{
                fontSize: '9.5pt',
                color: '#1a1a1a',
                fontStyle: 'italic',
                whiteSpace: 'nowrap',
                marginLeft: '16px',
              }}>
                <T value={edu.year} path={`education~~${i}~~year`} />
              </span>
            </div>
          ))}
        </Section>
      )}

      {/* ── CERTIFICATIONS ───────────────────────────────────── */}
      {data.certifications.length > 0 && (
        <Section title="Certifications">
          <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
            {data.certifications.map((cert, i) => (
              <li key={i} style={{
                marginBottom: '2px',
                color: DARK,
                lineHeight: '1.4',
                fontSize: '9.5pt',
              }}>
                <T value={cert} path={`certifications~~${i}`} />
              </li>
            ))}
          </ul>
        </Section>
      )}

    </div>
  )
}

// ── Section wrapper ──────────────────────────────────────────
// Bold blue UPPERCASE heading + full-width 1px blue horizontal rule.
// Matches PDF reference exactly.
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      {/* breakAfter:avoid keeps heading glued to its first content row */}
      <div style={{ breakAfter: 'avoid', pageBreakAfter: 'avoid', marginBottom: '5px' }}>
        <h2 style={{
          fontSize: '11pt',
          fontWeight: '800',
          color: BLUE,
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          margin: '0 0 3px',
        }}>
          {title}
        </h2>
        {/* Full-width 1px cobalt blue horizontal rule */}
        <div style={{ height: '1px', background: BLUE }} />
      </div>
      {children}
    </div>
  )
}
