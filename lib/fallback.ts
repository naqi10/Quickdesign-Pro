/**
 * fallback.ts
 *
 * Used when AI is completely unavailable.
 * Produces a clean, professional resume from raw form data
 * without any AI — so the user always gets a usable output.
 */

import { ClientFormData, ResumeData } from './types'

export function buildFallbackResume(formData: ClientFormData): ResumeData {
  const {
    name, phone, email, linkedin, portfolio,
    jobTitle, rawSummary, rawSkills, experiences, education, certifications,
  } = formData

  // Summary — clean up what the user typed, no AI
  const summary = rawSummary.trim() ||
    `${jobTitle} professional with hands-on experience delivering results in their field.`

  // Skills — split by comma, clean, group into one category
  const rawSkillList = rawSkills
    .split(/[,\n]/)
    .map(s => s.trim())
    .filter(Boolean)

  const skills: Record<string, string[]> =
    rawSkillList.length > 0
      ? { 'Core Skills': rawSkillList }
      : { 'Core Skills': ['Communication', 'Problem Solving', 'Team Collaboration'] }

  // Experiences — turn raw duties into simple bullet points
  const experience = experiences
    .filter(e => e.company || e.role)
    .map(exp => {
      const rawLines = exp.rawDuties
        .split(/[.\n]/)
        .map(s => s.trim())
        .filter(s => s.length > 10)
        .slice(0, 4)

      const bullets = rawLines.length > 0
        ? rawLines.map(line => capitalizeFirst(line))
        : [`Performed duties as ${exp.role || 'team member'} at ${exp.company || 'the company'}.`]

      return {
        company: exp.company,
        role: exp.role,
        duration: exp.duration,
        bullets,
      }
    })

  // Certifications
  const certList = certifications
    ? certifications.split('\n').map(c => c.trim()).filter(Boolean)
    : []

  return {
    name,
    phone,
    email,
    linkedin,
    portfolio,
    jobTitle,
    summary,
    experience,
    skills,
    education,
    certifications: certList,
    templateId: 'classic',
    createdAt: new Date().toISOString(),
  }
}

function capitalizeFirst(s: string): string {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1)
}
