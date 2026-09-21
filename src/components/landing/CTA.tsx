'use client'

import { Button } from '@/src/components/ui/Button'
import { ArrowRight } from 'lucide-react'

export function CTA() {
  return (
    <section className="py-24 bg-gold">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-obsidian mb-4">
          Ready to deliver like a pro?
        </h2>
        <p className="text-obsidian/70 text-lg mb-8 max-w-xl mx-auto">
          Join the founding photographers shaping Ivory Galleries — built by a working wedding photographer in Australia. Founding members lock in pricing for life.
        </p>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => window.location.href = '/register'}
        >
          Get Started Free <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </section>
  )
}
