import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authConfig } from '@/auth.config'

// Edge-safe instance — uses authConfig only (no Prisma/bcrypt).
const { auth } = NextAuth(authConfig)

const PUBLIC = new Set(['/signin', '/signup'])

export default auth((req) => {
  const { pathname } = req.nextUrl

  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    PUBLIC.has(pathname)
  ) return

  if (!req.auth) {
    const url = new URL('/signin', req.url)
    if (pathname !== '/') url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)'],
}
