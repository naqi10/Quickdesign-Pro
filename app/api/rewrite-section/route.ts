import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { ClientFormData } from '@/lib/types'
import { getKeywordsForRole } from '@/lib/keywords'
import { summaryPrompt, experiencePrompt, skillsPrompt, projectPrompt } from '@/lib/prompts'
import { callAI, stripFences, aiConfig } from '@/lib/ai'

type Section =
  | { kind: 'summary' }
  | { kind: 'experience'; index: number }
  | { kind: 'project'; index: number }
  | { kind: 'skills' }

interface RerollBody {
  formData: ClientFormData
  section: Section
}

async function safeParseJSONWithHeal<T>(raw: string, fallback: T): Promise<T> {
  const cleaned = stripFences(raw)
  try { return JSON.parse(cleaned) as T } catch {
    try {
      const fixed = await callAI(
        `The following is broken JSON. Fix it and return ONLY valid JSON, nothing else:\n${cleaned}`,
        1
      )
      return JSON.parse(stripFences(fixed)) as T
    } catch {
      return fallback
    }
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: RerollBody
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Bad JSON' }, { status: 400 }) }
  if (!body?.formData || !body?.section) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { formData, section } = body
  const { jobTitle } = formData
  const keywords = getKeywordsForRole(jobTitle)

  try {
    switch (section.kind) {
      case 'summary': {
        const out = await callAI(summaryPrompt(formData.rawSummary, jobTitle, keywords), 3, 800)
        return NextResponse.json({ summary: out })
      }

      case 'skills': {
        const raw = await callAI(skillsPrompt(formData.rawSkills, jobTitle, keywords), 3, 800)
        const skills = await safeParseJSONWithHeal<Record<string, string[]>>(
          raw,
          { 'Core Skills': formData.rawSkills.split(',').map(s => s.trim()).filter(Boolean) }
        )
        return NextResponse.json({ skills })
      }

      case 'experience': {
        const exp = formData.experiences[section.index]
        if (!exp) return NextResponse.json({ error: 'Experience index out of range' }, { status: 400 })
        const raw = await callAI(experiencePrompt(exp, jobTitle, keywords), 3, 1000)
        const bullets = await safeParseJSONWithHeal<string[]>(raw, [exp.rawDuties])
        return NextResponse.json({ bullets, index: section.index })
      }

      case 'project': {
        const active = (formData.projects ?? []).filter(p => p.name.trim() || p.description.trim())
        const proj = active[section.index]
        if (!proj) return NextResponse.json({ error: 'Project index out of range' }, { status: 400 })
        const raw = await callAI(projectPrompt(proj, jobTitle), 3, 600)
        const bullets = await safeParseJSONWithHeal<string[]>(raw, [proj.description])
        return NextResponse.json({ bullets, index: section.index })
      }

      default:
        return NextResponse.json({ error: 'Unknown section kind' }, { status: 400 })
    }
  } catch (err) {
    const status = (err as { status?: number })?.status ?? 500
    if (status === 429) {
      return NextResponse.json({ error: `${aiConfig.providerName} quota exceeded.` }, { status: 429 })
    }
    return NextResponse.json({ error: 'Re-roll failed.' }, { status: 500 })
  }
}
