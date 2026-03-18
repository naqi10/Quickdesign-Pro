import fs from 'fs'
import path from 'path'
import { SavedResume } from './types'

const DATA_DIR = path.join(process.cwd(), 'data')
const RESUMES_FILE = path.join(DATA_DIR, 'resumes.json')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(RESUMES_FILE)) {
    fs.writeFileSync(RESUMES_FILE, '[]', 'utf-8')
  }
}

export function getAllResumes(): SavedResume[] {
  ensureDataDir()
  const raw = fs.readFileSync(RESUMES_FILE, 'utf-8').trim()
  if (!raw) {
    fs.writeFileSync(RESUMES_FILE, '[]', 'utf-8')
    return []
  }

  try {
    return JSON.parse(raw) as SavedResume[]
  } catch (error) {
    console.error('Failed to parse resumes.json, resetting file:', error)
    fs.writeFileSync(RESUMES_FILE, '[]', 'utf-8')
    return []
  }
}

export function saveResume(resume: SavedResume): void {
  ensureDataDir()
  const all = getAllResumes()
  const existingIndex = all.findIndex(r => r.id === resume.id)
  if (existingIndex >= 0) {
    all[existingIndex] = resume
  } else {
    all.unshift(resume) // newest first
  }
  fs.writeFileSync(RESUMES_FILE, JSON.stringify(all, null, 2), 'utf-8')
}

export function getResume(id: string): SavedResume | null {
  const all = getAllResumes()
  return all.find(r => r.id === id) ?? null
}

export function deleteResume(id: string): void {
  const all = getAllResumes()
  const filtered = all.filter(r => r.id !== id)
  fs.writeFileSync(RESUMES_FILE, JSON.stringify(filtered, null, 2), 'utf-8')
}
