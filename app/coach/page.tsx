import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import CoachClient from './CoachClient'

export const dynamic = 'force-dynamic'

export default async function CoachPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/signin')
  return <CoachClient />
}
