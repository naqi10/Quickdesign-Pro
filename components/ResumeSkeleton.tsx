// Content-shaped placeholder shown while the AI rewrite runs. Mimics a resume
// being assembled (header + sections of bullet lines) with a shimmer pulse —
// feels faster and more premium than a bare spinner.

function SkeletonSection({ widths }: { widths: string[] }) {
  return (
    <div style={{ marginBottom: '26px' }}>
      <div className="h-4 w-40 bg-slate-300 rounded" />
      <div className="h-px w-full bg-slate-200 my-2.5" />
      <div className="space-y-2">
        {widths.map((w, i) => (
          <div key={i} className={`h-3 ${w} bg-slate-200 rounded`} />
        ))}
      </div>
    </div>
  )
}

export default function ResumeSkeleton({ status }: { status?: string }) {
  return (
    <div
      style={{
        width: '210mm',
        minHeight: '297mm',
        background: '#ffffff',
        padding: '15mm 18mm',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {/* Live status pill — keeps the rewrite step visible */}
      {status && (
        <div
          style={{ position: 'absolute', top: '10mm', right: '12mm' }}
          className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1"
        >
          <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-blue-700 font-medium whitespace-nowrap">{status}</span>
        </div>
      )}

      <div className="animate-pulse">
        {/* Header — name + title + rule */}
        <div className="h-9 w-2/3 bg-slate-300 rounded mb-3" />
        <div className="h-4 w-1/3 bg-slate-200 rounded mb-3" />
        <div className="h-px w-full bg-slate-300 mb-7" />

        {/* Summary */}
        <SkeletonSection widths={['w-full', 'w-full', 'w-11/12', 'w-4/5']} />
        {/* Experience */}
        <SkeletonSection widths={['w-full', 'w-10/12', 'w-full', 'w-3/4', 'w-5/6']} />
        {/* Projects */}
        <SkeletonSection widths={['w-full', 'w-11/12', 'w-2/3']} />
        {/* Skills */}
        <SkeletonSection widths={['w-1/2', 'w-2/3']} />
      </div>
    </div>
  )
}
