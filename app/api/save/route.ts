import { NextRequest, NextResponse } from 'next/server'
import { saveResume, getAllResumes, deleteResume } from '@/lib/storage'
import { SavedResume } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const resume: SavedResume = await req.json()
    saveResume(resume)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Save error:', error)
    return NextResponse.json({ error: 'Save failed' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const resumes = getAllResumes()
    return NextResponse.json({ resumes })
  } catch (error) {
    console.error('Load error:', error)
    return NextResponse.json({ error: 'Load failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    deleteResume(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
