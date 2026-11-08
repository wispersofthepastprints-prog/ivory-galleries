import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_build_placeholder')

export const TIER_PRICES = {
  pro: {
    monthly: 'price_1UK622DiL7jeD61lb3T67aBx',
    yearly: 'price_1UK6gVDiL7jeD61l8hVNDnKb',
  },
  studio: {
    monthly: 'price_1UK6pQDiL7jeD61lWNt410PB',
    yearly: 'price_1UK6q9DiL7jeD61lq0nMRVzQ',
  },
} as const

export const TIER_PRICES_USD = {
  pro: {
    monthly: 'price_1UQSzjDiL7jeD61lJPuoKBpi',
    yearly: 'price_1UQT0WDiL7jeD61lX1tZWhY2',
  },
  studio: {
    monthly: 'price_1UQT1mDiL7jeD61lmeOAhadd',
    yearly: 'price_1UQT2PDiL7jeD61lrHVblEx4',
  },
} as const

export type BillingCurrency = 'aud' | 'usd'
export type PaidTier = 'pro' | 'studio'

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

export function tierForPriceId(priceId: string | undefined): PaidTier | null {
  if (!priceId) return null
  for (const table of [TIER_PRICES, TIER_PRICES_USD]) {
    for (const tier of ['pro', 'studio'] as const) {
      if (table[tier].monthly === priceId || table[tier].yearly === priceId) return tier
    }
  }
  return null
}

export const TIER_CONFIG = {
  free: {
    name: 'Free',
    galleries: 3,
    storageBytes: 5 * 1024 * 1024 * 1024,
    features: ['3 galleries', '5GB storage', 'Public gallery sharing'],
  },
  pro: {
    name: 'Pro',
    galleries: Infinity,
    storageBytes: 50 * 1024 * 1024 * 1024,
    features: ['Unlimited galleries', 'Custom branding', 'Password protection', 'Gallery expiry controls'],
  },
  studio: {
    name: 'Studio',
    galleries: Infinity,
    storageBytes: 200 * 1024 * 1024 * 1024,
    features: ['Everything in Pro', '200GB storage', 'Paid gallery unlocks'],
  },
  agency: {
    name: 'Agency',
    galleries: Infinity,
    storageBytes: 200 * 1024 * 1024 * 1024,
    features: ['Everything in Studio', '200GB storage'],
  },
} as const
