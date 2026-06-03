import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { listUserApiKeys } from '@/lib/userKeys'
import { getFreeCreditsRemaining } from '@/lib/credits'
import SettingsClient from './SettingsClient'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/signin')

  const [keys, credits] = await Promise.all([
    listUserApiKeys(session.user.id),
    getFreeCreditsRemaining(session.user.id),
  ])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 py-4 flex items-center gap-3 shadow-sm">
        <Link href="/" className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm">← Dashboard</Link>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Settings</h1>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <SettingsClient initialKeys={keys} initialCredits={credits} />
      </div>
    </div>
  )
}
