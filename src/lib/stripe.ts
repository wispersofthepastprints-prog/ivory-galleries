import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

// AUD prices — Australian customers (charged in AUD)
export const TIER_PRICES: Record<string, { monthly: string; yearly: string }> = {
  pro: {
    monthly: 'price_1UK622DiL7jeD61lb3T67aBx',
    yearly: 'price_1UK6gVDiL7jeD61l8hVNDnKb',
  },
  studio: {
    monthly: 'price_1UK6pQDiL7jeD61lWNt410PB',
    yearly: 'price_1UK6q9DiL7jeD61lq0nMRVzQ',
  },
}

// USD prices — everyone outside Australia (charged in USD)
export const TIER_PRICES_USD: Record<string, { monthly: string; yearly: string }> = {
  pro: {
    monthly: 'price_1UQSzjDiL7jeD61lJPuoKBpi',
    yearly: 'price_1UQT0WDiL7jeD61lX1tZWhY2',
  },
  studio: {
    monthly: 'price_1UQT1mDiL7jeD61lmeOAhadd',
    yearly: 'price_1UQT2PDiL7jeD61lrHVblEx4',
  },
}

export type BillingCurrency = 'aud' | 'usd'

// Currency detection. Priority: explicit override (?currency=), then Vercel's
// IP-country header, then Accept-Language. Australia → AUD, rest of world → USD.
export function detectCurrency(headers: Headers, explicit?: string | null): BillingCurrency {
  if (explicit === 'usd' || explicit === 'aud') return explicit
  const country = headers.get('x-vercel-ip-country')
  if (country === 'AU') return 'aud'
  if (country) return 'usd'
  return /en-AU/i.test(headers.get('accept-language') || '') ? 'aud' : 'usd'
}

export function priceTableFor(currency: BillingCurrency) {
  return currency === 'usd' ? TIER_PRICES_USD : TIER_PRICES
}

export function currencySymbol(currency: BillingCurrency): string {
  return currency === 'usd' ? 'US$' : 'A$'
}

export const TIER_CONFIG = {
  free: {
    name: 'Free',
    galleries: 3,
    storageBytes: 5 * 1024 * 1024 * 1024, // 5GB
    features: ['Basic galleries', 'Watermark branding', 'Email delivery'],
  },
  pro: {
    name: 'Pro',
    galleries: Infinity,
    storageBytes: 50 * 1024 * 1024 * 1024, // 50GB
    features: ['Unlimited galleries', 'Custom branding', 'Password protection', 'Client favorites'],
  },
  studio: {
    name: 'Studio',
    galleries: Infinity,
    storageBytes: 200 * 1024 * 1024 * 1024, // 200GB
    features: ['Everything in Pro', 'Print store & sales', 'Album builder', 'IvoryOS calendar sync'],
  },
}
