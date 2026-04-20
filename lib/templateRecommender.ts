/**
 * Smart Template Recommender
 * Takes a job title string and returns the best-matching template IDs + reason.
 * Used to highlight recommended templates in the gallery.
 * Zero AI cost — pure keyword matching.
 */

interface Recommendation {
  templateId: string
  reason: string
  score: number
}

// Keyword → template mapping for Pakistani job market
const RULES: Array<{
  keywords: string[]
  templates: Array<{ id: string; reason: string }>
}> = [
  // ── Software / IT ───────────────────────────────────────────────────────────
  {
    keywords: ['software', 'developer', 'engineer', 'programmer', 'coding', 'coder', 'backend', 'frontend', 'fullstack', 'full stack', 'web developer', 'app developer', 'mobile developer', 'ios', 'android', 'react', 'node', 'python', 'java', 'php', 'laravel', 'django', 'flutter', 'kotlin', 'swift', 'typescript', 'javascript', 'devops', 'cloud', 'aws', 'azure', 'data scientist', 'machine learning', 'ml engineer', 'ai engineer', 'data analyst', 'database', 'qa engineer', 'quality assurance', 'tester', 'cybersecurity', 'network engineer', 'system administrator', 'sysadmin'],
    templates: [
      { id: 'google-style', reason: 'Clean tech look preferred by software companies' },
      { id: 'tech-clean',   reason: 'Skill chips highlight your tech stack clearly' },
      { id: 'ats-pro',      reason: 'Maximises ATS score for job portal applications' },
    ],
  },

  // ── Teaching / Education ────────────────────────────────────────────────────
  {
    keywords: ['teacher', 'lecturer', 'professor', 'instructor', 'educator', 'tutor', 'principal', 'headmaster', 'headmistress', 'academic', 'faculty', 'training', 'trainer', 'school', 'college', 'university', 'montessori', 'preschool', 'curriculum', 'education officer'],
    templates: [
      { id: 'harvard',  reason: 'Formal serif format trusted in academic institutions' },
      { id: 'classic',  reason: 'Traditional professional look for educational sector' },
    ],
  },

  // ── Medical / Healthcare ────────────────────────────────────────────────────
  {
    keywords: ['doctor', 'physician', 'surgeon', 'medical', 'mbbs', 'nurse', 'nursing', 'pharmacist', 'pharmacy', 'dentist', 'dental', 'physiotherapist', 'physiotherapy', 'paramedic', 'lab technician', 'radiologist', 'medical officer', 'clinical', 'hospital', 'healthcare', 'health', 'pathologist', 'cardiologist', 'paediatrician', 'gynecologist', 'ophthalmologist', 'psychiatrist', 'medical representative', 'medical rep', 'pharma rep', 'sales rep pharma'],
    templates: [
      { id: 'harvard',  reason: 'Formal professional format respected in medical sector' },
      { id: 'ats-pro',  reason: 'Clean ATS-friendly format for hospital applications' },
    ],
  },

  // ── Law / Legal ──────────────────────────────────────────────────────────────
  {
    keywords: ['lawyer', 'advocate', 'attorney', 'legal', 'barrister', 'solicitor', 'judge', 'magistrate', 'law officer', 'legal advisor', 'corporate lawyer', 'criminal lawyer', 'civil lawyer', 'paralegal', 'law clerk', 'legal assistant', 'llb', 'llm'],
    templates: [
      { id: 'harvard',  reason: 'The standard format for law professionals globally' },
      { id: 'classic',  reason: 'Traditional serif style suits legal professionals' },
    ],
  },

  // ── Management / Executive ───────────────────────────────────────────────────
  {
    keywords: ['manager', 'director', 'ceo', 'cto', 'cfo', 'coo', 'vp', 'vice president', 'head of', 'chief', 'executive', 'general manager', 'country manager', 'regional manager', 'operations manager', 'project manager', 'product manager', 'business development', 'bd manager', 'managing director', 'senior manager', 'team lead', 'team leader', 'department head', 'administrator'],
    templates: [
      { id: 'executive', reason: 'Dark header commands authority for leadership roles' },
      { id: 'dubai-gold', reason: 'Premium gold design reinforces executive stature' },
    ],
  },

  // ── Finance / Banking / Accounting ──────────────────────────────────────────
  {
    keywords: ['accountant', 'accounting', 'finance', 'financial', 'auditor', 'audit', 'banker', 'banking', 'ca', 'acca', 'cfa', 'cpa', 'tax consultant', 'tax officer', 'budget analyst', 'investment', 'credit analyst', 'risk analyst', 'treasury', 'compliance officer', 'financial analyst', 'portfolio manager', 'wealth manager', 'forex', 'stock broker'],
    templates: [
      { id: 'classic',   reason: 'Trusted traditional format for finance sector' },
      { id: 'executive', reason: 'Authoritative look for senior finance roles' },
    ],
  },

  // ── Government / Civil Services ──────────────────────────────────────────────
  {
    keywords: ['civil servant', 'government', 'govt', 'bps', 'css', 'pms', 'federal', 'provincial', 'district officer', 'tehsildar', 'naib', 'police', 'army', 'navy', 'air force', 'armed forces', 'revenue officer', 'custom officer', 'customs', 'fgei', 'fpsc', 'ppsc', 'spsc', 'kppsc', 'bpsc', 'public sector', 'municipality', 'patwari', 'clerk', 'grade', 'basic pay scale'],
    templates: [
      { id: 'harvard',  reason: 'Formal format accepted by govt departments' },
      { id: 'ats-pro',  reason: 'Plain text format scores well on govt portals' },
    ],
  },

  // ── Marketing / Sales ───────────────────────────────────────────────────────
  {
    keywords: ['marketing', 'digital marketing', 'seo', 'sem', 'social media', 'content writer', 'copywriter', 'brand manager', 'sales executive', 'sales officer', 'sales manager', 'sales representative', 'channel sales', 'trade marketing', 'key account', 'retail', 'e-commerce', 'shopify', 'amazon seller', 'graphic designer', 'ui designer', 'ux designer', 'video editor', 'photographer', 'creative'],
    templates: [
      { id: 'modern',   reason: 'Two-column sidebar stands out for marketing roles' },
      { id: 'sidebar',  reason: 'Creative layout impresses in marketing/design industry' },
    ],
  },

  // ── Fresh Graduate / Student ─────────────────────────────────────────────────
  {
    keywords: ['fresh graduate', 'recent graduate', 'student', 'internship', 'intern', 'entry level', 'junior', 'trainee', 'apprentice', 'no experience', 'fresher'],
    templates: [
      { id: 'fresher',  reason: 'Education-first layout perfect for fresh graduates' },
      { id: 'minimal',  reason: 'Clean one-page format for entry-level applications' },
    ],
  },

  // ── Gulf / International ─────────────────────────────────────────────────────
  {
    keywords: ['uae', 'dubai', 'saudi', 'qatar', 'kuwait', 'bahrain', 'oman', 'gulf', 'middle east', 'abroad', 'overseas', 'international', 'expat'],
    templates: [
      { id: 'dubai-gold', reason: 'Designed for Gulf market — premium and professional' },
      { id: 'executive',  reason: 'Strong first impression for international applications' },
    ],
  },

  // ── Service / Fast Food / Hospitality ────────────────────────────────────────
  {
    keywords: ['kfc', 'mcdonalds', 'burger king', 'pizza', 'restaurant', 'hotel', 'hospitality', 'waiter', 'cook', 'chef', 'cashier', 'customer service', 'receptionist', 'front desk', 'call centre', 'call center', 'bpo', 'support agent', 'customer support'],
    templates: [
      { id: 'fresher',  reason: 'Simple clean format suitable for service sector applications' },
      { id: 'ats-pro',  reason: 'Plain format passes ATS systems used by large chains' },
    ],
  },
]

/**
 * Returns up to 2 recommended template IDs for the given job title.
 * Returns empty array if no match found (show all templates normally).
 */
export function getRecommendedTemplates(jobTitle: string): Recommendation[] {
  if (!jobTitle || jobTitle.trim().length < 2) return []

  const lower = jobTitle.toLowerCase()
  const found: Map<string, Recommendation> = new Map()

  for (const rule of RULES) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) {
        for (const t of rule.templates) {
          if (!found.has(t.id)) {
            found.set(t.id, { templateId: t.id, reason: t.reason, score: kw.length })
          } else {
            const existing = found.get(t.id)!
            if (kw.length > existing.score) existing.score = kw.length
          }
        }
      }
    }
  }

  return Array.from(found.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
}
