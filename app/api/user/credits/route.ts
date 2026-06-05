import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getFreeCreditsRemaining } from '@/lib/credits'
import { listUserApiKeys } from '@/lib/userKeys'

/**
 * GET /api/user/credits
 * Returns the user's free-credit balance + a flag for whether they have ANY
 * personal key (used by the UI to decide whether to show "Add a key" CTAs).
 */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [credits, keys] = await Promise.all([
    getFreeCreditsRemaining(session.user.id),
    listUserApiKeys(session.user.id),
  ])

  return NextResponse.json({
    credits,
    hasOwnKey: keys.length > 0,
  })
}
