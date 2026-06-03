'use client'
import { useState } from 'react'
import { Provider, SUPPORTED_PROVIDERS, PROVIDER_LABEL, SafeApiKeyInfo } from '@/lib/userKeys'

interface ProviderMeta { tagline: string; signup: string }

const META: Record<Provider, ProviderMeta> = {
  google:    { tagline: 'Free tier · fast · good quality',                signup: 'https://aistudio.google.com/apikey' },
  openai:    { tagline: 'Paid · best general quality (GPT-4o, GPT-5)',    signup: 'https://platform.openai.com/api-keys' },
  anthropic: { tagline: 'Paid · best reasoning (Claude Sonnet 4.6, Opus)', signup: 'https://console.anthropic.com/settings/keys' },
  groq:      { tagline: 'Free tier · blazing fast inference',             signup: 'https://console.groq.com/keys' },
  cerebras:  { tagline: 'Free tier · fastest available',                  signup: 'https://cloud.cerebras.ai' },
  deepseek:  { tagline: 'Cheap paid · strong quality',                    signup: 'https://platform.deepseek.com/api_keys' },
}

interface Props {
  initialKeys: SafeApiKeyInfo[]
  initialCredits: number
}

export default function SettingsClient({ initialKeys, initialCredits }: Props) {
  const [keys, setKeys] = useState<SafeApiKeyInfo[]>(initialKeys)
  const credits = initialCredits

  const byProvider = new Map(keys.map(k => [k.provider, k]))

  async function refresh() {
    const res = await fetch('/api/user/api-keys')
    if (res.ok) {
      const { keys: next } = await res.json() as { keys: SafeApiKeyInfo[] }
      setKeys(next)
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Credits card ────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xl">💎</span>
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Free Credits</h2>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-1">{credits} <span className="text-sm font-normal text-slate-400">/ 5 remaining</span></p>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Credits are used when you don&rsquo;t have your own API key for a provider. Each AI call consumes 1 credit.
          Add your own key below to use any provider with no limits — you pay that provider directly.
        </p>
      </div>

      {/* ── API keys section ─────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">API Keys</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Add your own provider keys to bypass the credit limit. Keys are encrypted at rest (AES-256-GCM)
          and never leave the server. Test them anytime to verify.
        </p>

        <div className="space-y-3">
          {SUPPORTED_PROVIDERS.map(p => (
            <ProviderRow
              key={p}
              provider={p}
              saved={byProvider.get(p) ?? null}
              onChanged={refresh}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function ProviderRow({ provider, saved, onChanged }: {
  provider: Provider; saved: SafeApiKeyInfo | null; onChanged: () => void
}) {
  const meta = META[provider]
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState<'save' | 'test' | 'remove' | null>(null)
  const [status, setStatus] = useState<{ kind: 'ok' | 'err' | 'info'; msg: string } | null>(null)

  function clearLater() { setTimeout(() => setStatus(null), 4000) }

  async function save() {
    if (!draft.trim()) return
    setBusy('save')
    setStatus(null)
    try {
      const res = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, key: draft.trim() }),
      })
      if (res.ok) {
        setDraft('')
        setStatus({ kind: 'ok', msg: 'Saved.' })
        onChanged()
      } else {
        const j = await res.json().catch(() => ({}))
        setStatus({ kind: 'err', msg: j.error ?? 'Save failed.' })
      }
    } finally { setBusy(null); clearLater() }
  }

  async function test(useStored: boolean) {
    setBusy('test')
    setStatus({ kind: 'info', msg: 'Testing…' })
    try {
      const res = await fetch('/api/user/api-keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(useStored ? { provider } : { provider, key: draft.trim() }),
      })
      const j = await res.json() as { ok: boolean; error?: string }
      setStatus(j.ok ? { kind: 'ok', msg: 'Connected ✓' } : { kind: 'err', msg: j.error ?? 'Failed.' })
    } finally { setBusy(null); clearLater() }
  }

  async function remove() {
    if (!confirm(`Remove your ${PROVIDER_LABEL[provider]} key?`)) return
    setBusy('remove')
    try {
      await fetch('/api/user/api-keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      })
      setStatus({ kind: 'info', msg: 'Removed.' })
      onChanged()
    } finally { setBusy(null); clearLater() }
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{PROVIDER_LABEL[provider]}</h3>
            <a href={meta.signup} target="_blank" rel="noopener noreferrer"
               className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline">
              Get key →
            </a>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{meta.tagline}</p>
        </div>
        {saved && (
          <span className="flex-shrink-0 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-full px-2 py-0.5">
            Connected
          </span>
        )}
      </div>

      {saved ? (
        <div className="flex items-center justify-between gap-2 mt-2">
          <code className="text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{saved.preview}</code>
          <div className="flex items-center gap-1.5">
            <button onClick={() => test(true)} disabled={busy !== null}
                    className="text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-2.5 py-1 rounded-md disabled:opacity-50">
              {busy === 'test' ? '…' : 'Test'}
            </button>
            <button onClick={remove} disabled={busy !== null}
                    className="text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950 px-2.5 py-1 rounded-md disabled:opacity-50">
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 mt-2">
          <input
            type="password" value={draft} onChange={e => setDraft(e.target.value)}
            placeholder="Paste API key…"
            className="flex-1 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button onClick={() => test(false)} disabled={busy !== null || !draft.trim()}
                  className="text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-2.5 py-1.5 rounded-md disabled:opacity-30">
            {busy === 'test' ? '…' : 'Test'}
          </button>
          <button onClick={save} disabled={busy !== null || !draft.trim()}
                  className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 px-3 py-1.5 rounded-md">
            {busy === 'save' ? '…' : 'Save'}
          </button>
        </div>
      )}

      {status && (
        <p className={`text-xs mt-2 ${
          status.kind === 'ok'  ? 'text-emerald-600 dark:text-emerald-400'
          : status.kind === 'err' ? 'text-red-600 dark:text-red-400'
          : 'text-slate-500 dark:text-slate-400'
        }`}>
          {status.msg}
        </p>
      )}
    </div>
  )
}
