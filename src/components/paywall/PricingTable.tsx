'use client'

import { Button } from '@/src/components/ui/Button'
import { Card } from '@/src/components/ui/Card'
import { Badge } from '@/src/components/ui/Badge'
import { useCurrency } from '@/src/hooks/useCurrency'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: { aud: '$0', usd: '$0' },
    period: '/mo',
    yearly: null,
    description: 'Perfect for trying Ivory Galleries',
    features: ['3 galleries', '5GB storage', 'Watermark branding', 'Email delivery'],
    cta: 'Get Started',
    href: '/register',
    popular: false,
  },
  {
    name: 'Pro',
    price: { aud: 'A$15', usd: 'US$15' },
    period: '/mo',
    yearly: { aud: 'or A$150/yr - save 2 months', usd: 'or US$150/yr - save 2 months' },
    description: 'For working photographers',
    features: [
      'Sell gallery unlocks - keep the margin',
      'Unlimited galleries',
      '50GB storage',
      'Custom branding',
      'Password protection',
      'Client favorites',
      'Priority support',
    ],
    cta: 'Start Pro',
    href: '/register?tier=pro',
    popular: true,
  },
  {
    name: 'Studio',
    price: { aud: 'A$39', usd: 'US$39' },
    period: '/mo',
    yearly: { aud: 'or A$390/yr - save 2 months', usd: 'or US$390/yr - save 2 months' },
    description: 'For studios selling prints',
    features: [
      'Everything in Pro',
      '200GB storage',
      'Print store & sales (coming soon)',
      'Album builder',
      'IvoryOS calendar sync',
      'Lab fulfillment (coming soon)',
    ],
    cta: 'Start Studio',
    href: '/register?tier=studio',
    popular: false,
  },
]

export function PricingTable() {
  const currency = useCurrency()

  return (
    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {plans.map(plan => (
        <Card
          key={plan.name}
          padding="lg"
          className={`relative flex flex-col ${plan.popular ? 'ring-2 ring-gold shadow-xl' : ''}`}
        >
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge text="MOST POPULAR" variant="gold" size="sm" />
            </div>
          )}

          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-obsidian">{plan.name}</h3>
            <div className="flex items-baseline justify-center gap-1 mt-2">
              <span className="text-4xl font-extrabold text-obsidian">{plan.price[currency]}</span>
              <span className="text-fog">{plan.period}</span>
            </div>
            <p className="text-sm text-fog mt-2">{plan.description}</p>
            {plan.yearly && (
              <p className="text-xs font-semibold text-gold mt-1">{plan.yearly[currency]}</p>
            )}
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            {plan.features.map(feature => (
              <li key={feature} className="flex items-center gap-3 text-sm text-obsidian/80">
                <Check className="w-4 h-4 text-gold flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          <Button
            variant={plan.popular ? 'primary' : 'outline'}
            className="w-full"
            onClick={() => (window.location.href = `${plan.href}${plan.name === 'Free' ? '' : `&currency=${currency}`}`)}
          >
            {plan.cta}
          </Button>
        </Card>
      ))}
    </div>
  )
}
