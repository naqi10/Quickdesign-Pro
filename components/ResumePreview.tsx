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
    <TemplateComponent
      data={dataWithTemplate}
      editable={true}
      onFieldChange={updateResumeField}
    />
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
    body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @page { size: A4; margin: 0; }
    @media print {
      body { margin: 0; }
      h2, h3 { break-after: avoid; page-break-after: avoid; }
      li, .exp-block { break-inside: avoid; page-break-inside: avoid; }
      /* Prevent orphan headings at bottom of page */
      h2 + *, h3 + * { break-before: avoid; page-break-before: avoid; }
    }
    /* Ensure links are styled consistently in PDF */
    a { text-decoration: none; }
  </style>
</head>
<body>${bodyHTML}</body>
</html>`
}
