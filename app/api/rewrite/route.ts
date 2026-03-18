import { NextRequest, NextResponse } from 'next/server'
import { ClientFormData, ResumeData } from '@/lib/types'
import { getKeywordsForRole } from '@/lib/keywords'
import { summaryPrompt, experiencePrompt, skillsPrompt, jdKeywordPrompt } from '@/lib/prompts'
import { buildFallbackResume } from '@/lib/fallback'
import { callAI, stripFences, aiConfig } from '@/lib/ai'

function safeParseJSON<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(stripFences(raw)) as T
  } catch {
    console.error('JSON parse failed, using fallback. Raw output:', raw)
    return fallback
  }
}

async function safeParseJSONWithHeal<T>(raw: string, fallback: T): Promise<T> {
  const cleaned = stripFences(raw)
  try {
    return JSON.parse(cleaned) as T
  } catch {
    try {
      console.warn('Attempting AI self-heal on broken JSON...')
      const fixed = await callAI(
        `The following is broken JSON. Fix it and return ONLY valid JSON, nothing else:\n${cleaned}`,
        1
      )
      return JSON.parse(stripFences(fixed)) as T
    } catch {
      console.error('Self-heal failed, using fallback. Raw:', raw)
      return fallback
    }
  }
}

export async function POST(req: NextRequest) {
  // Parse body once — cannot call req.json() twice
  let formData: ClientFormData
  try {
    formData = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  try {
    const { jobTitle, jobDescription, experiences } = formData

    // Step 1: Get base keywords from dictionary
    let keywords = getKeywordsForRole(jobTitle)

    // Step 2: If JD is provided, extract JD keywords and merge (JD keywords take priority)
    if (jobDescription?.trim()) {
      const jdRaw = await callAI(jdKeywordPrompt(jobDescription))
      const jdKeywords = safeParseJSON<string[]>(jdRaw, [])
      keywords = [...new Set([...jdKeywords, ...keywords])]
    }

    // Step 3: Run all AI rewrites in PARALLEL for speed
    // Higher token budgets (800/1000) prevent truncation on rich 2-page source content
    const [summaryRaw, skillsRaw, ...experiencesRaw] = await Promise.all([
      callAI(summaryPrompt(formData.rawSummary, jobTitle, keywords), 3, 800),
      callAI(skillsPrompt(formData.rawSkills, jobTitle, keywords), 3, 800),
      ...experiences.map(exp => callAI(experiencePrompt(exp, jobTitle, keywords), 3, 1000)),
    ])

    // Step 4: Parse skills (with self-heal on bad JSON)
    const skills = await safeParseJSONWithHeal<Record<string, string[]>>(
      skillsRaw,
      { 'Core Skills': formData.rawSkills.split(',').map(s => s.trim()).filter(Boolean) }
    )

    // Step 5: Parse experience bullets (with self-heal on bad JSON)
    const processedExperiences = await Promise.all(
      experiences.map(async (exp, i) => ({
        company: exp.company,
        role: exp.role,
        duration: exp.duration,
        bullets: await safeParseJSONWithHeal<string[]>(experiencesRaw[i], [exp.rawDuties]),
      }))
    )

    // Step 6: Parse certifications
    const certifications = formData.certifications
      ? formData.certifications.split('\n').map(c => c.trim()).filter(Boolean)
      : []

    // Step 7: Assemble final ResumeData
    const resumeData: ResumeData = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      linkedin: formData.linkedin,
      portfolio: formData.portfolio,
      jobTitle,
      summary: summaryRaw,
      experience: processedExperiences,
      skills,
      education: formData.education,
      certifications,
      templateId: 'classic',
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({ resumeData })
  } catch (error) {
    console.error('Rewrite error:', error)

    const apiStatus =
      typeof error === 'object' && error !== null && 'status' in error &&
      typeof (error as { status?: unknown }).status === 'number'
        ? (error as { status: number }).status
        : 500

    const providerMessage =
      typeof error === 'object' && error !== null && 'error' in error &&
      typeof (error as { error?: unknown }).error === 'string'
        ? (error as { error: string }).error
        : undefined

    if (apiStatus === 429) {
      return NextResponse.json(
        { error: `${aiConfig.providerName} quota exceeded. Please add billing/credits and try again.` },
        { status: 429 }
      )
    }
    if (apiStatus === 400) {
      return NextResponse.json(
        { error: providerMessage ?? `${aiConfig.providerName} request failed. Check API key and model settings.` },
        { status: 400 }
      )
    }
    if (apiStatus === 401 || apiStatus === 403) {
      return NextResponse.json(
        { error: providerMessage ?? `${aiConfig.providerName} API key is invalid or unauthorized.` },
        { status: apiStatus }
      )
    }

    // Last resort: return a fallback resume so the user always gets something
    console.warn('AI completely failed — serving fallback resume')
    const fallbackData = buildFallbackResume(formData)
    return NextResponse.json(
      { resumeData: fallbackData, warning: 'AI unavailable — resume built from your raw input. You can edit it directly.' },
      { status: 200 }
    )
  }
}
