const INDEXABLE_PATHS = [
  { path: '/welcome', priority: '1.0' },
  { path: '/bible', priority: '0.8' },
  { path: '/contact', priority: '0.6' },
  { path: '/privacy-policy', priority: '0.4' },
  { path: '/terms', priority: '0.4' }
]

const DISALLOWED_PATHS = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/shared-chat/',
  '/shared-diary/',
  '/advisor',
  '/diary',
  '/admin',
  '/verse-corrections',
  '/training',
  '/training-reflections',
  '/users',
  '/daily-verses',
  '/profile',
  '/delete-account',
  '/change-password'
]

function normalizeUrl(url) {
  return String(url || '').trim().replace(/\/+$/, '')
}

function getConfiguredSiteOrigin(req) {
  const configuredOrigin = normalizeUrl(
    process.env.PUBLIC_APP_URL ||
    process.env.VITE_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    process.env.FRONTEND_URL ||
    process.env.ALLOWED_ORIGINS?.split(',')[0]
  )

  if (configuredOrigin) return configuredOrigin

  const forwardedProto = req.headers['x-forwarded-proto']?.split(',')[0]
  const protocol = forwardedProto || req.protocol
  return `${protocol}://${req.get('host')}`
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function toAbsoluteUrl(origin, path) {
  return new URL(path, `${origin}/`).href
}

function getIsoDate() {
  return new Date().toISOString()
}

function renderUrlEntry(origin, { path, priority }) {
  const url = escapeXml(toAbsoluteUrl(origin, path))
  return [
    '  <url>',
    `    <loc>${url}</loc>`,
    `    <lastmod>${getIsoDate()}</lastmod>`,
    '    <changefreq>weekly</changefreq>',
    `    <priority>${priority}</priority>`,
    '  </url>'
  ].join('\n')
}

function generateRobotsTxt(req) {
  const origin = getConfiguredSiteOrigin(req)
  const sitemapUrl = toAbsoluteUrl(origin, '/sitemap.xml')

  return [
    'User-agent: *',
    'Allow: /',
    ...DISALLOWED_PATHS.map((path) => `Disallow: ${path}`),
    `Sitemap: ${sitemapUrl}`
  ].join('\n')
}

function generateSitemapXml(req) {
  const origin = getConfiguredSiteOrigin(req)
  const urls = INDEXABLE_PATHS.map((entry) => renderUrlEntry(origin, entry)).join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>'
  ].join('\n')
}

module.exports = {
  generateRobotsTxt,
  generateSitemapXml
}
