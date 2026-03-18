import { NextRequest, NextResponse } from 'next/server'
import { htmlToPdf } from '@/lib/pdf'

export async function POST(req: NextRequest) {
  try {
    const { html, filename } = await req.json()

    if (!html) {
      return NextResponse.json({ error: 'No HTML provided' }, { status: 400 })
    }

    const pdfBuffer = await htmlToPdf(html)

    // NextResponse requires Uint8Array, not Buffer, in Next.js 15
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename ?? 'resume'}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'PDF generation failed.' },
      { status: 500 }
    )
  }
}
