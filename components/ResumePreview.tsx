'use client'
import { useResumeStore } from '@/store/resumeStore'
import { TEMPLATE_COMPONENTS } from '@/templates'
import { renderToStaticMarkup } from 'react-dom/server'

export default function ResumePreview() {
  const { resumeData, selectedTemplate, isRewriting, rewriteStatus, updateResumeField } = useResumeStore()

  if (isRewriting) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-300 font-medium">{rewriteStatus || 'Running AI rewrite...'}</p>
        <p className="text-gray-500 text-sm mt-1">This takes about 10–15 seconds</p>
      </div>
    )
  }

  if (!resumeData) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
        <div className="text-5xl mb-4">📄</div>
        <p className="text-gray-400 font-medium">Resume preview will appear here</p>
        <p className="text-gray-600 text-sm mt-1">Fill the form and click &quot;Run AI Rewrite&quot;</p>
      </div>
    )
  }

  const TemplateComponent = TEMPLATE_COMPONENTS[selectedTemplate] ?? TEMPLATE_COMPONENTS['classic']
  const dataWithTemplate = { ...resumeData, templateId: selectedTemplate }

  return (
    <div className="relative">
      {/* Edit hint bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'rgba(59,130,246,0.92)',
          color: '#fff',
          fontSize: '11px',
          padding: '5px 12px',
          textAlign: 'center',
          letterSpacing: '0.3px',
        }}
      >
        ✎ Click any text to edit it directly — changes are saved instantly
      </div>

      {/* zoom: 0.68 shrinks layout space too (unlike transform: scale), so no margin hacks needed */}
      <div style={{ zoom: 0.68 }}>
        <TemplateComponent
          data={dataWithTemplate}
          editable={true}
          onFieldChange={updateResumeField}
        />
      </div>
    </div>
  )
}

/**
 * Returns the full self-contained HTML string of the rendered resume.
 * Called server-side (or in the PDF API route) — editable is NOT passed,
 * so templates render clean static HTML with no contentEditable attributes.
 */
export function getResumeHTML(
  resumeData: import('@/lib/types').ResumeData,
  templateId: string
): string {
  const TemplateComponent = TEMPLATE_COMPONENTS[templateId] ?? TEMPLATE_COMPONENTS['classic']
  // No editable prop → templates render as plain static HTML → clean PDF
  const bodyHTML = renderToStaticMarkup(<TemplateComponent data={{ ...resumeData, templateId }} />)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${resumeData.name} — Resume</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { margin: 0; padding: 0; background: white; }
    @page { size: A4; margin: 0; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>${bodyHTML}</body>
</html>`
}
