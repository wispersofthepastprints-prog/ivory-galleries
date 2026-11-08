'use client'

import Link from 'next/link'
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
          Start with three galleries and 5 GB of storage. Upgrade when you need unlimited galleries, password protection, or paid client unlocks.
        </p>
        <Link href="/register" className="inline-flex">
          <Button variant="secondary" size="lg">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
      </div>
    </section>
  )
}
