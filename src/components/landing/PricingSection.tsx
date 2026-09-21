import { PricingTable } from '@/src/components/paywall/PricingTable'

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-cream">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-obsidian mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-fog text-lg max-w-xl mx-auto">
            Start free. Upgrade when you are ready. No hidden fees, ever.
          </p>
        </div>
        <PricingTable />
      </div>
    </section>
  )
}
