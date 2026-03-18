// Golden keyword dictionary — maps job role keywords to ATS-power phrases
// Add more roles as you expand your client base

export const KEYWORD_MAP: Record<string, string[]> = {
  'software developer': [
    'Agile methodology', 'REST APIs', 'version control (Git)', 'CI/CD pipelines',
    'scalable architecture', 'code review', 'technical documentation', 'debugging',
    'object-oriented programming', 'microservices', 'cloud deployment', 'unit testing',
  ],
  'software engineer': [
    'Agile methodology', 'REST APIs', 'version control (Git)', 'CI/CD pipelines',
    'scalable solutions', 'code review', 'system design', 'debugging',
    'object-oriented programming', 'microservices', 'cloud deployment',
  ],
  'web developer': [
    'responsive design', 'REST APIs', 'cross-browser compatibility', 'performance optimization',
    'SEO best practices', 'version control (Git)', 'UI/UX principles', 'accessibility (WCAG)',
    'front-end frameworks', 'backend integration',
  ],
  'frontend developer': [
    'responsive design', 'React/Next.js', 'component architecture', 'state management',
    'CSS/Sass', 'performance optimization', 'cross-browser compatibility', 'accessibility',
    'UI/UX collaboration', 'API integration',
  ],
  'backend developer': [
    'RESTful APIs', 'database design', 'server-side architecture', 'authentication/authorization',
    'microservices', 'CI/CD', 'cloud infrastructure', 'performance tuning', 'security best practices',
  ],
  'data analyst': [
    'data visualization', 'SQL', 'Power BI', 'statistical analysis', 'KPI tracking',
    'ETL pipelines', 'dashboard development', 'Python', 'Excel (advanced)',
    'business intelligence', 'data-driven decision making', 'trend analysis',
  ],
  'data scientist': [
    'machine learning', 'Python (NumPy, Pandas)', 'statistical modeling', 'data pipeline',
    'predictive analytics', 'A/B testing', 'data visualization', 'SQL', 'feature engineering',
    'model evaluation', 'Jupyter Notebook',
  ],
  'customer service': [
    'client satisfaction', 'conflict resolution', 'CRM systems', 'escalation handling',
    'SLA compliance', 'inbound/outbound support', 'customer retention', 'empathy-driven service',
    'first-call resolution', 'stakeholder communication', 'active listening',
  ],
  'sales': [
    'revenue growth', 'pipeline management', 'lead generation', 'B2B sales',
    'quota attainment', 'CRM (Salesforce)', 'upselling/cross-selling', 'deal closing',
    'territory management', 'client acquisition', 'relationship building',
  ],
  'marketing': [
    'digital marketing', 'SEO/SEM', 'content strategy', 'social media management',
    'brand awareness', 'campaign management', 'email marketing', 'Google Analytics',
    'lead generation', 'A/B testing', 'ROI optimization', 'market research',
  ],
  'hr': [
    'talent acquisition', 'onboarding', 'HRIS', 'performance management',
    'employee relations', 'compliance', 'workforce planning', 'recruitment strategy',
    'benefits administration', 'organizational development', 'succession planning',
  ],
  'project manager': [
    'project lifecycle management', 'Agile/Scrum', 'stakeholder management', 'risk mitigation',
    'budget management', 'resource allocation', 'cross-functional collaboration',
    'milestone tracking', 'PMP/PRINCE2', 'change management', 'deliverable ownership',
  ],
  'accountant': [
    'financial reporting', 'GAAP compliance', 'accounts payable/receivable', 'reconciliation',
    'tax preparation', 'audit support', 'ERP systems (SAP/QuickBooks)', 'budgeting/forecasting',
    'cost analysis', 'variance analysis',
  ],
  'graphic designer': [
    'Adobe Creative Suite', 'brand identity', 'typography', 'UI/UX design',
    'print/digital media', 'visual storytelling', 'Figma', 'client presentations',
    'design systems', 'color theory', 'responsive design assets',
  ],
  'teacher': [
    'curriculum development', 'differentiated instruction', 'classroom management',
    'student engagement', 'formative/summative assessment', 'parent communication',
    'e-learning platforms', 'IEP compliance', 'collaborative learning', 'lesson planning',
  ],
  'nurse': [
    'patient care', 'clinical assessment', 'medication administration', 'EHR documentation',
    'care coordination', 'triage', 'patient education', 'infection control', 'HIPAA compliance',
    'critical thinking', 'interdisciplinary collaboration',
  ],
  'operations manager': [
    'process optimization', 'cross-functional leadership', 'KPI management', 'SOP development',
    'supply chain coordination', 'resource planning', 'cost reduction', 'vendor management',
    'continuous improvement (Lean/Six Sigma)', 'team performance management',
  ],
}

/**
 * Returns golden keywords for the given job title.
 * Falls back to empty array if no match (AI handles it via prompt).
 */
export function getKeywordsForRole(jobTitle: string): string[] {
  const normalized = jobTitle.toLowerCase().trim()
  for (const [role, keywords] of Object.entries(KEYWORD_MAP)) {
    if (normalized.includes(role) || role.includes(normalized)) {
      return keywords
    }
  }
  // Partial word match — e.g. "developer" matches "software developer"
  for (const [role, keywords] of Object.entries(KEYWORD_MAP)) {
    const roleWords = role.split(' ')
    if (roleWords.some(word => normalized.includes(word) && word.length > 4)) {
      return keywords
    }
  }
  return []
}
