import puppeteer from 'puppeteer'

/**
 * Converts an HTML string into a PDF buffer.
 * The HTML must be fully self-contained (inline styles, no external assets).
 */
export async function htmlToPdf(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

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
    })

    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}
