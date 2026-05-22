import { ResumeData } from './types'

// ─── Job-Description Keyword Matcher ─────────────────────────────────────────
// Pure client-side ATS-style matcher. Extracts the meaningful keywords from a
// pasted job description, then checks how many appear in the resume. Returns a
// match score plus the matched/missing keyword lists. No AI call — instant.

export interface JdMatchResult {
  score: number          // 0–100 (% of JD keywords found in resume)
  matched: string[]
  missing: string[]
  total: number
}

// Words that carry no signal — ignored during extraction.
const STOPWORDS = new Set([
  'the','and','for','are','but','not','you','all','any','can','her','was','one','our','out','day','get','has','him',
  'his','how','man','new','now','old','see','two','way','who','boy','did','its','let','put','say','she','too','use',
  'with','that','this','from','they','will','would','there','their','what','about','which','when','make','like','time',
  'just','know','take','into','your','some','could','them','than','then','look','only','come','over','also','back',
  'after','work','first','well','even','want','because','these','give','most','role','team','working','ability','strong',
  'experience','years','year','including','etc','must','should','within','across','using','help','need','required',
  'responsibilities','requirements','qualifications','plus','join','looking','seeking','candidate','candidates','ideal',
  'position','opportunity','company','job','employer','benefits','salary','apply','please','email','resume','cover',
  'letter','equal','opportunity','we','our','us','a','an','to','of','in','on','as','is','it','be','or','at','by','if',
  'so','up','do','no','my','me','he','per','via','etc','and/or','e.g','i.e','more','other','those','such','very','able',
])

const SPECIAL_RE = /[+#./]/ // keywords like c++, c#, node.js, ci/cd need substring match

function tokenize(text: string): string[] {
  // Keep letters, digits, and a few tech chars (+ # . /)
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, ' ')
    .split(/\s+/)
    .map(w => w.replace(/^[-.]+|[-.]+$/g, '')) // trim stray punctuation
    .filter(Boolean)
}

/** Extract candidate keywords (unigrams + bigrams) ranked by relevance. */
function extractKeywords(jd: string): string[] {
  const words = tokenize(jd)
  const freq = new Map<string, number>()
  const display = new Map<string, string>() // lowercase → nicest casing seen

  // Track original casing for nicer display (proper nouns / tech terms)
  const original = jd.split(/\s+/)
  for (const raw of original) {
    const clean = raw.replace(/[^A-Za-z0-9+#./-]/g, '')
    if (clean) display.set(clean.toLowerCase(), display.get(clean.toLowerCase()) ?? clean)
  }

  // Unigrams
  for (const w of words) {
    if (w.length < 2 || STOPWORDS.has(w)) continue
    if (/^\d+$/.test(w)) continue // skip pure numbers
    freq.set(w, (freq.get(w) ?? 0) + 1)
  }

  // Bigrams (two meaningful words in a row) — captures "machine learning", "rest api"
  for (let i = 0; i < words.length - 1; i++) {
    const a = words[i], b = words[i + 1]
    if (STOPWORDS.has(a) || STOPWORDS.has(b)) continue
    if (a.length < 2 || b.length < 2) continue
    if (/^\d+$/.test(a) || /^\d+$/.test(b)) continue
    const bigram = `${a} ${b}`
    freq.set(bigram, (freq.get(bigram) ?? 0) + 2) // weight phrases higher
  }

  // Rank: phrases and repeated terms first
  const ranked = [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .map(([k]) => k)

  // De-duplicate: drop a unigram if it's already covered by a chosen bigram
  const chosen: string[] = []
  for (const term of ranked) {
    if (chosen.length >= 25) break
    const isSubOfChosen = chosen.some(c => c.includes(term) && c !== term)
    if (isSubOfChosen) continue
    chosen.push(term)
  }

  // Prettify casing
  return chosen.map(term => {
    if (term.includes(' ')) {
      return term.split(' ').map(w => display.get(w) ?? w).join(' ')
    }
    return display.get(term) ?? term
  })
}

/** Flatten all resume text into one lowercase searchable string. */
function resumeText(data: ResumeData): string {
  const parts: string[] = [
    data.jobTitle,
    data.summary,
    ...Object.values(data.skills).flat(),
    ...data.experience.flatMap(e => [e.role, e.company, ...e.bullets]),
    ...data.projects.flatMap(p => [p.name, ...p.techStack, ...p.bullets]),
    ...data.certifications,
  ]
  return parts.join(' \n ').toLowerCase()
}

function isInText(keyword: string, text: string): boolean {
  const k = keyword.toLowerCase()
  if (SPECIAL_RE.test(k)) return text.includes(k) // c++, node.js → substring
  const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`\\b${escaped}\\b`, 'i').test(text)
}

export function matchJobDescription(jd: string, data: ResumeData): JdMatchResult {
  const keywords = extractKeywords(jd)
  if (keywords.length === 0) return { score: 0, matched: [], missing: [], total: 0 }

  const text = resumeText(data)
  const matched: string[] = []
  const missing: string[] = []
  for (const k of keywords) {
    if (isInText(k, text)) matched.push(k)
    else missing.push(k)
  }

  const score = Math.round((matched.length / keywords.length) * 100)
  return { score, matched, missing, total: keywords.length }
}
