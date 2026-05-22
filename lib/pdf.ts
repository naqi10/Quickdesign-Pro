/**
 * lib/pdf.ts — HTML → PDF via headless Chromium.
 *
 * Environment-aware:
 *  - Production / Vercel serverless → puppeteer-core + @sparticuz/chromium
 *    (slim Chromium that fits under the serverless function size limit).
 *  - Local dev → full `puppeteer` (bundled Chromium, zero setup).
 *
 * The HTML must be fully self-contained (inline styles, no external assets).
 */

// Detect serverless/production. Vercel sets process.env.VERCEL=1.
const isServerless = !!process.env.VERCEL || process.env.NODE_ENV === 'production'

interface LaunchedBrowser {
  newPage: () => Promise<{
    setContent: (html: string, opts?: object) => Promise<void>
    pdf: (opts?: object) => Promise<Uint8Array>
  }>
  close: () => Promise<void>
}

async function launchBrowser(): Promise<LaunchedBrowser> {
  if (isServerless) {
    // Serverless: slim Chromium binary from @sparticuz/chromium.
    const chromium = (await import('@sparticuz/chromium')).default
    const puppeteer = await import('puppeteer-core')
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    }) as unknown as LaunchedBrowser
  }

  // Local dev: full puppeteer ships its own Chromium.
  const puppeteer = await import('puppeteer')
  return puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  }) as unknown as LaunchedBrowser
}

/**
 * Converts an HTML string into a PDF buffer.
 * The HTML must be fully self-contained (inline styles, no external assets).
 */
export async function htmlToPdf(html: string): Promise<Buffer> {
  const browser = await launchBrowser()

  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      // Margins are handled inside each template via CSS padding.
      // The HTML also sets @page { margin: 0 } — keep both consistent.
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
      preferCSSPageSize: true,
      // Tagged PDF enables clickable links and proper text selection
      tagged: true,
    })

    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}
