import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

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
