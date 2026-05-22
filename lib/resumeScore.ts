import { ResumeData } from './types'

// ─── Resume Strength Score ───────────────────────────────────────────────────
// Pure client-side analysis — no AI cost, instant feedback. Scores a resume
// 0–100 across weighted checks recruiters and ATS systems actually care about,
// and returns actionable tips for anything that fails.

export interface ScoreCheck {
  id: string
  label: string
  /** 'pass' | 'warn' | 'fail' — warn counts as half credit */
  status: 'pass' | 'warn' | 'fail'
  weight: number
  /** Shown when not a full pass — tells the user exactly what to fix */
  tip?: string
}

export interface ResumeScore {
  score: number          // 0–100
  grade: string          // 'Excellent' | 'Strong' | 'Fair' | 'Needs work'
  checks: ScoreCheck[]
  passed: number
  total: number
}

// Strong action verbs that should start experience/project bullets.
const ACTION_VERBS = new Set([
  'led','managed','developed','built','designed','created','implemented','launched',
  'achieved','delivered','improved','increased','reduced','streamlined','optimized',
  'optimised','drove','spearheaded','engineered','architected','automated','migrated',
  'scaled','mentored','coordinated','executed','established','generated','negotiated',
  'analyzed','analysed','transformed','accelerated','boosted','cut','grew','founded',
  'directed','oversaw','produced','resolved','revamped','redesigned','integrated',
  'deployed','maintained','collaborated','facilitated','initiated','introduced',
])

const QUANTIFY_RE = /\d|%|\$|€|£|million|billion|thousand|hundred|\bk\b/i

function allBullets(data: ResumeData): string[] {
  const exp = data.experience.flatMap(e => e.bullets)
  const proj = data.projects.flatMap(p => p.bullets)
  return [...exp, ...proj].map(b => b.trim()).filter(Boolean)
}

function startsWithActionVerb(bullet: string): boolean {
  const first = bullet.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '')
  return !!first && ACTION_VERBS.has(first)
}

export function scoreResume(data: ResumeData): ResumeScore {
  const checks: ScoreCheck[] = []
  const bullets = allBullets(data)
  const totalSkills = Object.values(data.skills).reduce((n, s) => n + s.length, 0)
  const summaryWords = data.summary.trim().split(/\s+/).filter(Boolean).length

  // 1. Contact completeness (email + phone) — weight 10
  {
    const hasEmail = !!data.email.trim()
    const hasPhone = !!data.phone.trim()
    checks.push({
      id: 'contact',
      label: 'Contact details complete',
      weight: 10,
      status: hasEmail && hasPhone ? 'pass' : hasEmail || hasPhone ? 'warn' : 'fail',
      tip: !hasEmail ? 'Add an email address.' : !hasPhone ? 'Add a phone number.' : undefined,
    })
  }

  // 2. Professional links (LinkedIn or portfolio) — weight 6
  {
    const hasLink = !!data.linkedin.trim() || !!data.portfolio.trim()
    checks.push({
      id: 'links',
      label: 'LinkedIn or portfolio link',
      weight: 6,
      status: hasLink ? 'pass' : 'warn',
      tip: hasLink ? undefined : 'Add a LinkedIn or portfolio URL — recruiters expect one.',
    })
  }

  // 3. Summary present and substantial — weight 14
  {
    const status = summaryWords >= 30 ? 'pass' : summaryWords >= 12 ? 'warn' : 'fail'
    checks.push({
      id: 'summary',
      label: 'Professional summary (30+ words)',
      weight: 14,
      status,
      tip: status === 'pass' ? undefined
        : summaryWords === 0 ? 'Add a professional summary — it is the first thing recruiters read.'
        : 'Expand your summary to 3–4 sentences (30+ words).',
    })
  }

  // 4. Work experience present — weight 16
  {
    const count = data.experience.filter(e => e.role.trim() || e.bullets.length).length
    checks.push({
      id: 'experience',
      label: 'Work experience listed',
      weight: 16,
      status: count >= 1 ? 'pass' : 'fail',
      tip: count >= 1 ? undefined : 'Add at least one work experience entry.',
    })
  }

  // 5. Enough bullet points overall — weight 10
  {
    const status = bullets.length >= 6 ? 'pass' : bullets.length >= 3 ? 'warn' : 'fail'
    checks.push({
      id: 'bullet-count',
      label: 'Detailed bullet points (6+)',
      weight: 10,
      status,
      tip: status === 'pass' ? undefined : 'Add more bullet points describing your achievements.',
    })
  }

  // 6. Bullets start with action verbs — weight 14
  if (bullets.length > 0) {
    const ratio = bullets.filter(startsWithActionVerb).length / bullets.length
    const status = ratio >= 0.8 ? 'pass' : ratio >= 0.5 ? 'warn' : 'fail'
    checks.push({
      id: 'action-verbs',
      label: 'Bullets start with action verbs',
      weight: 14,
      status,
      tip: status === 'pass' ? undefined
        : `Start more bullets with strong verbs (Led, Built, Increased…). Currently ${Math.round(ratio * 100)}%.`,
    })
  } else {
    checks.push({ id: 'action-verbs', label: 'Bullets start with action verbs', weight: 14, status: 'fail', tip: 'Add bullet points starting with action verbs.' })
  }

  // 7. Bullets are quantified (numbers/metrics) — weight 14
  if (bullets.length > 0) {
    const ratio = bullets.filter(b => QUANTIFY_RE.test(b)).length / bullets.length
    const status = ratio >= 0.5 ? 'pass' : ratio >= 0.25 ? 'warn' : 'fail'
    checks.push({
      id: 'quantified',
      label: 'Achievements quantified with numbers',
      weight: 14,
      status,
      tip: status === 'pass' ? undefined
        : `Add metrics to more bullets (e.g. "increased sales 30%", "managed 5 people"). Currently ${Math.round(ratio * 100)}%.`,
    })
  } else {
    checks.push({ id: 'quantified', label: 'Achievements quantified with numbers', weight: 14, status: 'fail', tip: 'Quantify your achievements with numbers.' })
  }

  // 8. Skills listed — weight 8
  {
    const status = totalSkills >= 5 ? 'pass' : totalSkills >= 1 ? 'warn' : 'fail'
    checks.push({
      id: 'skills',
      label: 'Skills section (5+ skills)',
      weight: 8,
      status,
      tip: status === 'pass' ? undefined : 'List at least 5 relevant skills.',
    })
  }

  // 9. Education present — weight 5
  {
    const has = data.education.some(e => e.degree.trim())
    checks.push({
      id: 'education',
      label: 'Education included',
      weight: 5,
      status: has ? 'pass' : 'warn',
      tip: has ? undefined : 'Add your education background.',
    })
  }

  // 10. No overly long bullets — weight 3
  if (bullets.length > 0) {
    const tooLong = bullets.filter(b => b.split(/\s+/).length > 30).length
    checks.push({
      id: 'concise',
      label: 'Bullets are concise (≤30 words)',
      weight: 3,
      status: tooLong === 0 ? 'pass' : 'warn',
      tip: tooLong === 0 ? undefined : `${tooLong} bullet${tooLong > 1 ? 's are' : ' is'} too long — keep each under 30 words.`,
    })
  }

  // Compute weighted score. pass = full weight, warn = half, fail = 0.
  const totalWeight = checks.reduce((n, c) => n + c.weight, 0)
  const earned = checks.reduce((n, c) => n + c.weight * (c.status === 'pass' ? 1 : c.status === 'warn' ? 0.5 : 0), 0)
  const score = Math.round((earned / totalWeight) * 100)

  const grade =
    score >= 85 ? 'Excellent' :
    score >= 70 ? 'Strong' :
    score >= 50 ? 'Fair' : 'Needs work'

  return {
    score,
    grade,
    checks,
    passed: checks.filter(c => c.status === 'pass').length,
    total: checks.length,
  }
}
