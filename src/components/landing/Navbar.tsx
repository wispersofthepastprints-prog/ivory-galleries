'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/src/components/ui/Button'
import { Menu, X } from 'lucide-react'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-ivory/80 backdrop-blur-xl border-b border-stone/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.png" alt="Ivory Galleries" className="w-9 h-9 rounded-lg object-cover" />
          <span className="font-bold text-obsidian text-lg">Ivory Galleries</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium text-fog hover:text-obsidian transition-colors">Features</Link>
          <Link href="#pricing" className="text-sm font-medium text-fog hover:text-obsidian transition-colors">Pricing</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Log In</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Get Started Free</Button>
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-ivory border-t border-stone/10 px-6 py-4 space-y-3">
          <Link href="#features" className="block text-sm font-medium text-fog">Features</Link>
          <Link href="#pricing" className="block text-sm font-medium text-fog">Pricing</Link>
          <Link href="/login" className="block text-sm font-medium text-fog">Log In</Link>
          <Link href="/register" className="block text-sm font-medium text-gold">Get Started Free</Link>
        </div>
      )}
    </nav>
  )
}
