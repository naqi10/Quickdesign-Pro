import { RawExperience, ClientFormData } from './types'

/**
 * Builds the professional summary rewrite prompt.
 */
export function summaryPrompt(
  rawSummary: string,
  jobTitle: string,
  keywords: string[]
): string {
  const keywordLine = keywords.length > 0
    ? `Naturally incorporate some of these industry keywords where relevant: ${keywords.slice(0, 8).join(', ')}.`
    : ''

  // Longer raw summary = the person has more to say → give them more room
  const rawWordCount = rawSummary.trim().split(/\s+/).length
  const sentenceCount = rawWordCount > 60 ? '4–5' : '3'

  return `You are an expert professional resume writer with 15 years of experience.
Target job title: ${jobTitle}
Raw input from the client (may be informal or poorly written): "${rawSummary}"

Rewrite this into a powerful ${sentenceCount}-sentence professional resume summary.
Rules:
- First sentence: strong professional identity (years of experience, field, core strength)
- Middle sentences: key skills, notable achievements, and domain expertise
- Final sentence: value proposition for the employer
- Use confident, active, third-person voice — NO "I", "my", "me"
- Avoid clichés like "hardworking", "team player", "passionate"
- Be specific and professional
${keywordLine}

Output ONLY the rewritten summary. No labels, no explanations, no quotes.`
}

/**
 * Builds the experience bullet points rewrite prompt.
 */
export function experiencePrompt(
  exp: RawExperience,
  jobTitle: string,
  keywords: string[]
): string {
  const keywordLine = keywords.length > 0
    ? `Where natural, incorporate keywords like: ${keywords.slice(0, 6).join(', ')}.`
    : ''

  // Give more bullets for roles with richer raw content
  const rawWordCount = exp.rawDuties.trim().split(/\s+/).length
  const bulletCount = rawWordCount > 80 ? 6 : rawWordCount > 40 ? 5 : 4

  return `You are an expert professional resume writer.
Candidate's target job: ${jobTitle}
Company: ${exp.company}
Role: ${exp.role}
Duration: ${exp.duration}
Raw duties described by client (informal language): "${exp.rawDuties}"

Convert these into ${bulletCount} professional resume bullet points.
Rules:
- Start each bullet with a strong past-tense action verb (Led, Managed, Developed, Achieved, Streamlined, Delivered, Implemented, etc.)
- Quantify achievements where possible — use approximate numbers if exact ones aren't given (e.g., "50+ clients", "team of 3", "20% efficiency gain")
- Focus on IMPACT and RESULTS, not just tasks
- Each bullet must be one concise sentence, max 20 words
- Use industry-standard language appropriate for the target job
${keywordLine}

Output ONLY a JSON array of ${bulletCount} strings. Example: ["Led a team...", "Developed...", "Achieved...", "Streamlined..."]
No explanations, no markdown, just the raw JSON array.`
}

/**
 * Builds the skills rewrite and enhancement prompt.
 */
export function skillsPrompt(
  rawSkills: string,
  jobTitle: string,
  keywords: string[]
): string {
  const keywordLine = keywords.length > 0
    ? `Standard skills for this role include: ${keywords.join(', ')}. Add the most relevant ones if missing from client's list.`
    : ''

  return `You are an expert professional resume writer.
Target job title: ${jobTitle}
Raw skills provided by client: "${rawSkills}"

Task:
1. Clean and professionally format the client's skills
2. Remove duplicates and informal phrasing
3. Add 3–5 standard skills for this role that are missing
4. Group into categories if 8+ skills total
${keywordLine}

Output ONLY a JSON object where keys are category names and values are arrays of skill strings.
If fewer than 8 skills, use a single key: "Core Skills".
Example: { "Technical Skills": ["Python", "SQL"], "Soft Skills": ["Leadership"] }
No explanations, no markdown, just the raw JSON object.`
}

/**
 * Builds a keyword extraction prompt when a job description is provided.
 */
export function jdKeywordPrompt(jobDescription: string): string {
  return `Extract the top 12 ATS-critical keywords from this job description.
Focus on: technical skills, tools, methodologies, certifications, and role-specific terms.
Exclude generic words like "communication", "teamwork", "motivated".

Job Description:
"${jobDescription}"

Output ONLY a JSON array of keyword strings.
Example: ["Python", "Agile", "REST APIs", "stakeholder management"]
No explanations, no markdown, just the raw JSON array.`
}
