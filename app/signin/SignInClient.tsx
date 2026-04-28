'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function SignInClient() {
  const params = useSearchParams()
  const callbackUrl = params.get('callbackUrl') ?? '/'
  const errorParam = params.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(
    errorParam === 'CredentialsSignin' ? 'Invalid email or password.' : null
  )

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const res = await signIn('credentials', {
      email, password, redirect: false, callbackUrl,
    })
    setSubmitting(false)
    if (res?.error) setError('Invalid email or password.')
    else if (res?.ok) window.location.href = callbackUrl
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to manage your resumes</p>
        </div>

        <button
          onClick={() => signIn('google', { callbackUrl })}
          className="w-full flex items-center justify-center gap-2 border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-sm font-medium py-2.5 rounded-lg transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M16.51 8.18c0-.57-.05-1.12-.15-1.65H9v3.13h4.21c-.18.97-.74 1.79-1.58 2.34v1.95h2.55c1.49-1.37 2.33-3.39 2.33-5.77z"/>
            <path fill="#34A853" d="M9 17c2.13 0 3.92-.71 5.22-1.92l-2.55-1.95c-.71.48-1.62.76-2.67.76-2.05 0-3.79-1.39-4.41-3.25H1.96v2.04A8 8 0 0 0 9 17z"/>
            <path fill="#FBBC04" d="M4.59 10.64A4.8 4.8 0 0 1 4.34 9c0-.57.1-1.12.25-1.64V5.32H1.96A8 8 0 0 0 1 9c0 1.29.31 2.51.96 3.68l2.63-2.04z"/>
            <path fill="#EA4335" d="M9 4.75c1.16 0 2.2.4 3.02 1.18l2.26-2.26C13.92 2.49 12.13 1.75 9 1.75A8 8 0 0 0 1.96 5.32l2.63 2.04C5.21 5.4 6.95 4.75 9 4.75z"/>
          </svg>
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
          <div className="flex-1 h-px bg-slate-200" />
          <span>OR</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <form onSubmit={handleCredentials} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
            <input
              type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit" disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-xs text-slate-500 text-center mt-5">
          Don&rsquo;t have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
