export const ANALYTICS_EVENTS = [
  'page_view',
  'signup_completed',
  'gallery_created',
  'gallery_published',
  'gallery_shared',
  'upgrade_started',
  'gallery_unlock_started',
] as const

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number]

const STATIC_PATHS = new Set(['/', '/login', '/register', '/contact', '/privacy', '/terms'])

export function safeAnalyticsPath(pathname: string): string | null {
  if (STATIC_PATHS.has(pathname)) return pathname
  if (pathname === '/dashboard' || pathname === '/dashboard/galleries' || pathname === '/dashboard/galleries/new' || pathname === '/dashboard/uploads' || pathname === '/dashboard/store' || pathname === '/dashboard/settings') return pathname
  if (/^\/dashboard\/galleries\/[^/]+$/.test(pathname)) return '/dashboard/galleries/:id'
  if (/^\/g\/[^/]+$/.test(pathname)) return '/g/:slug'
  return null
}

export function safeAcquisitionSource(search: string): { source: string | null; medium: string | null } | null {
  const params = new URLSearchParams(search)
  const clean = (value: string | null) => value?.toLowerCase().replace(/[^a-z0-9_.-]/g, '').slice(0, 60) || ''
  const source = clean(params.get('utm_source'))
  const medium = clean(params.get('utm_medium'))
  return source || medium ? { source: source || null, medium: medium || null } : null
}
