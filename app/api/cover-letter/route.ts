import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { callAI, aiConfig } from '@/lib/ai'
import { coverLetterPrompt } from '@/lib/prompts'
import { ResumeData } from '@/lib/types'

interface Body {
  resumeData: ResumeData
  company?: string
  jobDescription?: string
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Body
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Bad JSON' }, { status: 400 }) }
  if (!body?.resumeData?.name) return NextResponse.json({ error: 'Missing resume data' }, { status: 400 })

  const { resumeData, company = '', jobDescription = '' } = body

  const topSkills = Object.values(resumeData.skills).flat().slice(0, 10)
  const topAchievements = resumeData.experience.flatMap(e => e.bullets).slice(0, 5)

  try {
    const letter = await callAI(
      coverLetterPrompt({
        name: resumeData.name,
        jobTitle: resumeData.jobTitle,
        company,
        summary: resumeData.summary,
        topSkills,
        topAchievements,
        jobDescription,
      }),
      3,
      900
    )
    return NextResponse.json({ letter: letter.trim() })
  } catch (err) {
    const status = (err as { status?: number })?.status ?? 500
    const message = err instanceof Error ? err.message : `${aiConfig.providerName} request failed.`
    return NextResponse.json({ error: message }, { status: status === 429 ? 429 : 500 })
  }
}
