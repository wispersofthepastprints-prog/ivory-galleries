'use client'
import Link from 'next/link';

import { Button } from '@/src/components/ui/Button'
import { ArrowRight, Star, Users, Zap } from 'lucide-react'

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-8">
          <Star className="w-4 h-4 text-gold fill-gold" />
          <span className="text-sm font-semibold text-gold">Built by a working wedding photographer</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-obsidian leading-[1.1] mb-6 tracking-tight">
          Deliver photos your clients{' '}
          <span className="text-gold">actually love</span>
        </h1>

        <p className="text-xl text-fog max-w-2xl mx-auto mb-10 leading-relaxed">
          The beautiful, fast client gallery platform built for wedding and portrait photographers.
          Upload once. Deliver everywhere. Sell gallery unlocks while you sleep.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" onClick={() => window.location.href = '/register'}>
            Start Free Trial <ArrowRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="mt-16 flex items-center justify-center gap-8 text-sm text-fog">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-gold" />
            <span>No credit card</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gold" />
            <span>3 galleries free</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-gold" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  )
}
