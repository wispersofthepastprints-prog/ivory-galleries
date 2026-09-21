'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { useAuth } from '@/src/hooks/useAuth'
import { Loader2 } from 'lucide-react'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { photographer, isLoading: loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !photographer) router.replace('/login')
  }, [loading, photographer, router])

  if (loading || !photographer) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="max-w-6xl mx-auto p-8">{children}</div>
      </main>
    </div>
  )
}
