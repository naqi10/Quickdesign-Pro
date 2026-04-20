// ─── Raw form input from the client form ────────────────────────────────────

export interface RawExperience {
  id: string
  company: string
  role: string
  duration: string
  rawDuties: string
}

export interface RawEducation {
  id: string
  degree: string
  institution: string
  year: string
}

export interface RawProject {
  id: string
  name: string
  description: string   // raw description — AI rewrites to bullets
  techStack: string     // comma-separated tech (React, Node.js, MongoDB…)
  link: string          // optional URL (GitHub, live demo)
}

export interface ClientFormData {
  // Personal info
  name: string
  phone: string
  email: string
  linkedin: string
  portfolio: string
  // Target
  jobTitle: string
  jobDescription: string
  // Raw sections
  rawSummary: string
  experiences: RawExperience[]
  projects: RawProject[]
  rawSkills: string
  education: RawEducation[]
  certifications: string
}

// ─── AI-processed resume data ────────────────────────────────────────────────

export interface ProcessedExperience {
  company: string
  role: string
  duration: string
  bullets: string[]
}

export interface ProcessedProject {
  name: string
  bullets: string[]
  techStack: string[]
  link: string
}

export interface ResumeData {
  // Personal
  name: string
  phone: string
  email: string
  linkedin: string
  portfolio: string
  // Processed sections
  summary: string
  experience: ProcessedExperience[]
  projects: ProcessedProject[]
  skills: Record<string, string[]>
  education: RawEducation[]
  certifications: string[]
  // Meta
  jobTitle: string
  templateId: string
  createdAt: string
}

// ─── Template meta ────────────────────────────────────────────────────────────

export interface TemplateMeta {
  id: string
  name: string
  description: string
  accentColor: string
}

// ─── Saved client record ─────────────────────────────────────────────────────

export interface SavedResume {
  id: string
  clientName: string
  jobTitle: string
  createdAt: string
  resumeData: ResumeData
}
