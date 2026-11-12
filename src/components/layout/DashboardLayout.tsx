'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Menu } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { useAuth } from '@/src/hooks/useAuth'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { photographer, isLoading: loading } = useAuth()
  const [navigationOpen, setNavigationOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !photographer) router.replace('/login')
  }, [loading, photographer, router])

  const closeNavigation = useCallback(() => setNavigationOpen(false), [])

  useEffect(() => {
    if (!navigationOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setNavigationOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [navigationOpen])

  if (loading || !photographer) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="sticky top-0 z-30 flex min-h-16 items-center gap-3 border-b border-stone/10 bg-cream/95 px-4 py-3 backdrop-blur lg:hidden">
        <button
          ref={menuButtonRef}
          type="button"
          aria-label="Open navigation"
          aria-controls="dashboard-navigation"
          aria-expanded={navigationOpen}
          onClick={() => setNavigationOpen(true)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-obsidian transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <Menu className="h-6 w-6" />
        </button>
        <Link href="/dashboard" className="flex min-w-0 items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.png" alt="" className="h-9 w-9 rounded-lg object-cover" />
          <span className="truncate font-bold text-obsidian">Ivory Galleries</span>
        </Link>
      </div>

      <Sidebar isOpen={navigationOpen} onClose={closeNavigation} />
      <main className="min-h-screen min-w-0 lg:pl-64">
        <div className="mx-auto w-full min-w-0 max-w-6xl p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
