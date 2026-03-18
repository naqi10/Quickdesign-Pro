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
      margin: {
        top: '12mm',
        bottom: '12mm',
        left: '12mm',
        right: '12mm',
      },
    })

    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}
