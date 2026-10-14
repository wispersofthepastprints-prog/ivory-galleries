'use client'

import { useEffect, useState } from 'react'
import type { BillingCurrency } from '@/src/lib/stripe'

// Client display currency. Defaults to the browser locale, then confirms with
// the server's IP-country detection so the price label matches the charge.
export function useCurrency(): BillingCurrency {
  const [currency, setCurrency] = useState<BillingCurrency>(() =>
    typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('en-au')
      ? 'aud'
      : 'usd',
  )

  useEffect(() => {
    fetch('/api/stripe/currency')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data?.currency === 'aud' || data?.currency === 'usd') setCurrency(data.currency)
      })
      .catch(() => {})
  }, [])

  return currency
}
