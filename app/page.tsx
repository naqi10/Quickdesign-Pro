import Link from 'next/link'
import { getAllResumes } from '@/lib/storage'
import { SavedResume } from '@/lib/types'

export const dynamic = 'force-dynamic'

async function getResumes(): Promise<SavedResume[]> {
  try {
    return getAllResumes()
  } catch {
    return []
  }
}

export default async function DashboardPage() {
  const resumes = await getResumes()

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-800 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Resume Generator</h1>
          <p className="text-xs text-gray-500">Internal tool · AI-powered</p>
        </div>
        <Link
          href="/new"
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
        >
          + New Resume
        </Link>
      </div>

      <div className="px-8 py-8 max-w-5xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Resumes Generated" value={resumes.length.toString()} />
          <StatCard label="This Month" value={resumes.filter(r =>
            new Date(r.createdAt).getMonth() === new Date().getMonth()
          ).length.toString()} />
          <StatCard label="Avg. per day" value={
            resumes.length > 0
              ? (resumes.length / Math.max(1, Math.ceil((Date.now() - new Date(resumes[resumes.length - 1]?.createdAt ?? Date.now()).getTime()) / 86400000))).toFixed(1)
              : '0'
          } />
        </div>

        {/* Recent resumes */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Recent Resumes
          </h2>

          {resumes.length === 0 ? (
            <div className="border border-gray-800 rounded-xl p-12 text-center">
              <div className="text-4xl mb-3">📄</div>
              <p className="text-gray-400 mb-1">No resumes yet</p>
              <p className="text-gray-600 text-sm">Click "New Resume" to generate your first one</p>
            </div>
          ) : (
            <div className="space-y-2">
              {resumes.map(r => (
                <ResumeCard key={r.id} resume={r} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

function ResumeCard({ resume }: { resume: SavedResume }) {
  const date = new Date(resume.createdAt).toLocaleDateString('en-PK', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg px-5 py-4 flex items-center justify-between hover:border-gray-700 transition-colors">
      <div>
        <p className="font-medium text-gray-100">{resume.clientName}</p>
        <p className="text-sm text-gray-500">{resume.jobTitle} · {date}</p>
      </div>
      <div className="flex gap-2">
        <Link
          href={`/new?load=${resume.id}`}
          className="text-xs text-blue-400 hover:text-blue-300 border border-blue-800 hover:border-blue-600 px-3 py-1.5 rounded-md transition-colors"
        >
          Open & Edit
        </Link>
      </div>
    </div>
  )
}
