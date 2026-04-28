import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth, signOut } from '@/auth'
import { prisma } from '@/lib/prisma'
import { SavedResume } from '@/lib/types'

export const dynamic = 'force-dynamic'

async function getUserResumes(userId: string): Promise<SavedResume[]> {
  const rows = await prisma.resume.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return rows.map(r => ({
    id: r.id,
    clientName: r.clientName,
    jobTitle: r.jobTitle,
    createdAt: r.createdAt.toISOString(),
    resumeData: r.data as unknown as SavedResume['resumeData'],
  }))
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/signin')

  const resumes = await getUserResumes(session.user.id)
  const userLabel = session.user.name || session.user.email || 'You'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-8 py-4 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Resume Generator</h1>
          <p className="text-xs text-slate-400">AI-powered · Professional templates</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/new"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            + New Resume
          </Link>
          <UserMenu label={userLabel} image={session.user.image ?? undefined} />
        </div>
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
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Your Resumes
          </h2>

          {resumes.length === 0 ? (
            <div className="border border-slate-200 bg-white rounded-xl p-12 text-center shadow-sm">
              <div className="text-4xl mb-3">📄</div>
              <p className="text-slate-500 mb-1">No resumes yet</p>
              <p className="text-slate-400 text-sm">Click &ldquo;New Resume&rdquo; to generate your first one</p>
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
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <p className="text-2xl font-bold text-slate-800 mb-1">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  )
}

function ResumeCard({ resume }: { resume: SavedResume }) {
  const date = new Date(resume.createdAt).toLocaleDateString('en-PK', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div className="bg-white border border-slate-200 rounded-lg px-5 py-4 flex items-center justify-between hover:border-blue-300 hover:shadow-sm transition-all">
      <div>
        <p className="font-medium text-slate-800">{resume.clientName}</p>
        <p className="text-sm text-slate-500">{resume.jobTitle} · {date}</p>
      </div>
      <div className="flex gap-2">
        <Link
          href={`/new?load=${resume.id}`}
          className="text-xs text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"
        >
          Open & Edit
        </Link>
      </div>
    </div>
  )
}

function UserMenu({ label, image }: { label: string; image?: string }) {
  return (
    <form action={async () => {
      'use server'
      await signOut({ redirectTo: '/signin' })
    }}>
      <div className="flex items-center gap-2">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={label} className="w-8 h-8 rounded-full border border-slate-200" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
            {label.slice(0, 1).toUpperCase()}
          </div>
        )}
        <span className="text-xs text-slate-600 hidden sm:inline max-w-[140px] truncate">{label}</span>
        <button
          type="submit"
          className="text-xs text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 hover:bg-red-50 px-2.5 py-1 rounded-md transition-colors"
        >
          Sign out
        </button>
      </div>
    </form>
  )
}
