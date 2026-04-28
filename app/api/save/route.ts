import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { SavedResume } from '@/lib/types'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: SavedResume
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Bad JSON' }, { status: 400 }) }

  if (!body?.resumeData?.name) return NextResponse.json({ error: 'Missing resume data' }, { status: 400 })

  await prisma.resume.create({
    data: {
      userId: session.user.id,
      clientName: body.clientName ?? body.resumeData.name,
      jobTitle: body.jobTitle ?? body.resumeData.jobTitle ?? '',
      templateId: body.resumeData.templateId ?? 'classic',
      data: body.resumeData as object,
    },
  })

  return NextResponse.json({ ok: true })
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ resumes: [] })

  const rows = await prisma.resume.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const resumes: SavedResume[] = rows.map(r => ({
    id: r.id,
    clientName: r.clientName,
    jobTitle: r.jobTitle,
    createdAt: r.createdAt.toISOString(),
    resumeData: r.data as unknown as SavedResume['resumeData'],
  }))

  return NextResponse.json({ resumes })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { id?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Bad JSON' }, { status: 400 }) }
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  // deleteMany scoped by userId — prevents cross-user deletion
  await prisma.resume.deleteMany({
    where: { id: body.id, userId: session.user.id },
  })

  return NextResponse.json({ ok: true })
}
