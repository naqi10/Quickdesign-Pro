/**
 * POST /api/parse-raw
 *
 * Takes raw WhatsApp/Instagram message text from a client and parses it
 * into structured ClientFormData fields using AI.
 * This is the "Smart Paste" feature — paste anything, form fills itself.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { ClientFormData } from '@/lib/types'
import { callAI, stripFences } from '@/lib/ai'
import { rateLimitUser } from '@/lib/rateLimit'

const PARSE_PROMPT = (raw: string) => `
You are extracting resume information from a client's raw message (could be WhatsApp text, informal notes, or a rough CV).

Extract all available information and return ONLY a valid JSON object with this exact structure:
{
  "name": "full name or empty string",
  "phone": "phone number or empty string",
  "email": "email or empty string",
  "linkedin": "linkedin URL or empty string",
  "portfolio": "portfolio/github URL or empty string",
  "jobTitle": "target job title — infer from context if not stated explicitly",
  "rawSummary": "a brief description of the person's background in their words — combine any bio/intro text",
  "rawSkills": "comma-separated skills list",
  "experiences": [
    {
      "id": "1",
      "company": "company name",
      "role": "job title/role",
      "duration": "date range e.g. Jan 2022 - Dec 2023",
      "rawDuties": "description of what they did there"
    }
  ],
  "education": [
    {
      "id": "1",
      "degree": "degree name",
      "institution": "university/school name",
      "year": "graduation year"
    }
  ],
  "certifications": "one certification per line, or empty string",
  "jobDescription": "",
  "projects": [
    {
      "id": "1",
      "name": "project name",
      "description": "what the project does — keep in client's words",
      "techStack": "comma-separated tech used e.g. React, Node.js, MongoDB",
      "link": "GitHub or live URL, or empty string"
    }
  ]
}

Rules:
- Return ONLY the JSON object. No markdown, no code fences, no explanation.
- Use empty strings for missing fields, never null or undefined.
- experiences and education must always be arrays, even if empty: use [{"id":"1","company":"","role":"","duration":"","rawDuties":""}]
- If multiple jobs are mentioned, create multiple experience objects with id "1", "2", etc.
- Infer the target job title from their experience/education if they didn't state it.
- Keep rawDuties in the client's own words — do not rewrite it.

Client message:
"""
${raw}
"""
`

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id

  const rl = await rateLimitUser(userId)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${rl.retryAfterSec ?? 60}s.` },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec ?? 60) } }
    )
  }

  let raw: string
  try {
    const body = await req.json()
    raw = body.raw ?? ''
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (!raw.trim()) {
    return NextResponse.json({ error: 'No text provided.' }, { status: 400 })
  }

  try {
    // User-aware: routes through user's keys first, then project pool (1 credit).
    const content = await callAI(PARSE_PROMPT(raw), { userId, maxRetries: 3, maxTokens: 2000 })
    const cleaned = stripFences(content)

    let parsed: Partial<ClientFormData>
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: 'AI returned invalid JSON. Try again.' }, { status: 500 })
    }

    // Ensure required array fields always exist with at least one empty entry
    const safeExperiences = Array.isArray(parsed.experiences) && parsed.experiences.length > 0
      ? parsed.experiences
      : [{ id: '1', company: '', role: '', duration: '', rawDuties: '' }]

    const safeEducation = Array.isArray(parsed.education) && parsed.education.length > 0
      ? parsed.education
      : [{ id: '1', degree: '', institution: '', year: '' }]

    const safeProjects = Array.isArray(parsed.projects) && parsed.projects.length > 0
      ? parsed.projects
      : [{ id: '1', name: '', description: '', techStack: '', link: '' }]

    const formData: ClientFormData = {
      name: parsed.name ?? '',
      phone: parsed.phone ?? '',
      email: parsed.email ?? '',
      linkedin: parsed.linkedin ?? '',
      portfolio: parsed.portfolio ?? '',
      jobTitle: parsed.jobTitle ?? '',
      jobDescription: '',
      rawSummary: parsed.rawSummary ?? '',
      rawSkills: parsed.rawSkills ?? '',
      certifications: parsed.certifications ?? '',
      experiences: safeExperiences.map((e, i) => ({ ...e, id: String(i + 1) })),
      projects: safeProjects.map((p, i) => ({ ...p, id: String(i + 1), link: p.link ?? '' })),
      education: safeEducation.map((e, i) => ({ ...e, id: String(i + 1) })),
    }

    return NextResponse.json({ formData })
  } catch (err) {
    console.error('parse-raw error:', err)
    const status = typeof err === 'object' && err !== null && 'status' in err
      ? ((err as { status?: number }).status ?? 500)
      : 500
    const msg = err instanceof Error
      ? err.message
      : 'Failed to parse text. Try again.'
    const httpStatus = status === 402 ? 402 : status === 429 ? 429 : 500
    return NextResponse.json({ error: msg }, { status: httpStatus })
  }
}
