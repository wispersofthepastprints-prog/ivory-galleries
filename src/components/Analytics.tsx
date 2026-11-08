'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { AnalyticsEvent, safeAcquisitionSource, safeAnalyticsPath } from '@/src/lib/analytics'

export function trackEvent(eventName: AnalyticsEvent, pathname = window.location.pathname) {
  const pagePath = safeAnalyticsPath(pathname)
  if (!pagePath) return

  const acquisition = safeAcquisitionSource(window.location.search)
  void fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventName,
      pagePath,
      source: acquisition?.source,
      medium: acquisition?.medium,
    }),
    keepalive: true,
  }).catch(() => {})
}

export function Analytics() {
  const pathname = usePathname()

  useEffect(() => {
    trackEvent('page_view', pathname)
  }, [pathname])

  return null
}
