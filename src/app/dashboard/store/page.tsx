'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/src/components/layout/Header'
import { Card } from '@/src/components/ui/Card'
import { useAuth } from '@/src/hooks/useAuth'
import { supabaseBrowser } from '@/src/lib/supabase'
import { DollarSign, TrendingUp, ShoppingBag, Loader2 } from 'lucide-react'

type SalesStats = { lifetimeCents: number; monthCents: number; unlocks: number }

export default function StorePage() {
  const { photographer, isLoading: authLoading, isStudio } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<SalesStats>({ lifetimeCents: 0, monthCents: 0, unlocks: 0 })
  const [error, setError] = useState('')

  useEffect(() => {
    if (!photographer) return
    let active = true
    void (async () => {
      const { data: myGalleries, error: galleryError } = await supabaseBrowser
        .from('galleries').select('id').eq('photographer_id', photographer.id)
      if (galleryError) {
        if (active) { setError('Unable to load gallery sales.'); setLoading(false) }
        return
      }
      const galleryIds = (myGalleries || []).map(gallery => gallery.id)
      const { data: purchases, error: purchaseError } = galleryIds.length
        ? await supabaseBrowser.from('gallery_purchases').select('amount_cents, created_at').in('gallery_id', galleryIds)
        : { data: [], error: null }
      if (!active) return
      if (purchaseError) { setError('Unable to load gallery sales.'); setLoading(false); return }

      const rows = purchases || []
      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)
      setStats({
        lifetimeCents: rows.reduce((sum, row) => sum + (row.amount_cents || 0), 0),
        monthCents: rows.filter(row => row.created_at && new Date(row.created_at) >= monthStart).reduce((sum, row) => sum + (row.amount_cents || 0), 0),
        unlocks: rows.length,
      })
      setLoading(false)
    })()
    return () => { active = false }
  }, [photographer])

  if (authLoading || loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>
  }

  const formatAud = (cents: number) => `A$${(cents / 100).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div>
      <Header title="Sales" subtitle="Gross gallery unlock sales in AUD, before Stripe fees" />
      {error && <p role="alert" className="text-sm text-red-600 mb-6">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card padding="lg"><div className="flex items-center gap-3 mb-2"><DollarSign className="w-5 h-5 text-gold" /><span className="text-sm text-fog">Lifetime gross sales</span></div><p className="text-3xl font-bold text-obsidian">{formatAud(stats.lifetimeCents)}</p></Card>
        <Card padding="lg"><div className="flex items-center gap-3 mb-2"><TrendingUp className="w-5 h-5 text-gold" /><span className="text-sm text-fog">This month</span></div><p className="text-3xl font-bold text-obsidian">{formatAud(stats.monthCents)}</p></Card>
        <Card padding="lg"><div className="flex items-center gap-3 mb-2"><ShoppingBag className="w-5 h-5 text-gold" /><span className="text-sm text-fog">Gallery unlocks</span></div><p className="text-3xl font-bold text-obsidian">{stats.unlocks}</p></Card>
      </div>
      <Card padding="lg" className="max-w-2xl">
        <h2 className="font-bold text-obsidian mb-2">Gallery unlocks</h2>
        <p className="text-sm text-fog leading-relaxed mb-4">Studio accounts can offer a limited preview and charge clients in AUD for full gallery access.</p>
        <Link href={isStudio ? '/dashboard/galleries' : '/dashboard/settings?tab=billing'} className="text-sm text-gold font-semibold hover:underline">
          {isStudio ? 'Open a gallery to set its access and price →' : 'View Studio plan →'}
        </Link>
      </Card>
    </div>
  )
}
