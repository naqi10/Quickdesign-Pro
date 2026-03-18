/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow puppeteer to work in API routes (Next.js 15+)
  serverExternalPackages: ['puppeteer', 'puppeteer-core'],
}

module.exports = nextConfig
