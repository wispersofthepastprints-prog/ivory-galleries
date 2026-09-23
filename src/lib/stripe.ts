import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

export const TIER_PRICES: Record<string, { monthly: string; yearly: string }> = {
  pro: {
    monthly: 'price_1UIia2DiL7jeD61lwayHi7jh',      // Replace with actual Stripe Price IDs
    yearly: 'price_1UIiZ6DiL7jeD61lNw8R3teg',
  },
  studio: {
    monthly: 'price_1UIiilDiL7jeD61lTvAG44KM',
    yearly: 'price_1UIijgDiL7jeD61lK6Sk4kyJ',
  },
  agency: {
    monthly: 'price_agency_monthly',
    yearly: 'price_agency_yearly',
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
  agency: {
    name: 'Agency',
    galleries: Infinity,
    storageBytes: 500 * 1024 * 1024 * 1024, // 500GB
    features: ['Everything in Studio', 'White-label galleries', 'Multi-photographer', 'Priority support'],
  },
}
