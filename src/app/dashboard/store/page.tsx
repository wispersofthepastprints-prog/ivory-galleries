'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/src/components/layout/Header'
import { Card } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Badge } from '@/src/components/ui/Badge'
import { FeatureGate } from '@/src/components/paywall/FeatureGate'
import { TIER_PRICES } from '@/src/lib/stripe'
import { useAuth } from '@/src/hooks/useAuth'
import { supabaseBrowser } from '@/src/lib/supabase'
import { ShoppingBag, DollarSign, TrendingUp, Lock, Loader2 } from 'lucide-react'

export default function StorePage() {
  const { photographer, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ lifetimeCents: 0, orders: 0, monthCents: 0, unlocks: 0 })

  useEffect(() => {
    if (!photographer) return
    ;(async () => {
      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)

      // Print orders (owned directly)
      const { data: printOrders } = await supabaseBrowser
        .from('print_orders')
        .select('total_cents, photographer_markup_cents, created_at')
        .eq('photographer_id', photographer.id)

      // Gallery unlock purchases (via owned galleries)
      const { data: myGalleries } = await supabaseBrowser
        .from('galleries')
        .select('id')
        .eq('photographer_id', photographer.id)
      const galleryIds = (myGalleries || []).map((g: any) => g.id)
      const { data: purchases } = galleryIds.length
        ? await supabaseBrowser
            .from('gallery_purchases')
            .select('amount_cents, created_at')
            .in('gallery_id', galleryIds)
        : { data: [] }

      const po = printOrders || []
      const gp = purchases || []
      const sum = (rows: any[], field: string) => rows.reduce((s: number, r: any) => s + (r[field] || 0), 0)

      setStats({
        lifetimeCents: sum(po, 'photographer_markup_cents') + sum(gp, 'amount_cents'),
        orders: po.length + gp.length,
        monthCents:
          sum(po.filter((r: any) => new Date(r.created_at) >= monthStart), 'photographer_markup_cents') +
          sum(gp.filter((r: any) => new Date(r.created_at) >= monthStart), 'amount_cents'),
        unlocks: gp.length,
      })
      setLoading(false)
    })()
  }, [photographer])

  if (authLoading || loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>
  }

  const fmt = (cents: number) => `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div>
      <Header title="Store" subtitle="Sell prints and digital downloads" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-2"><DollarSign className="w-5 h-5 text-gold" /><span className="text-sm text-fog">Lifetime earnings</span></div>
          <p className="text-3xl font-bold text-obsidian">{fmt(stats.lifetimeCents)}</p>
        </Card>
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-2"><TrendingUp className="w-5 h-5 text-gold" /><span className="text-sm text-fog">This month</span></div>
          <p className="text-3xl font-bold text-obsidian">{fmt(stats.monthCents)}</p>
        </Card>
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-2"><ShoppingBag className="w-5 h-5 text-gold" /><span className="text-sm text-fog">Orders · gallery unlocks</span></div>
          <p className="text-3xl font-bold text-obsidian">{stats.orders} · {stats.unlocks}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-obsidian">Print Store</h3>
            <FeatureGate feature="print_store" fallback={<Lock className="w-4 h-4 text-stone" />}>
              <Badge variant="success" text="Included in Pro" />
            </FeatureGate>
          </div>
          <p className="text-sm text-fog mb-4">
            Sell prints directly from your client galleries. Set your own prices, fulfil through your own lab, keep the margin.
          </p>
          <div className="p-4 bg-cream rounded-xl text-sm text-obsidian space-y-2">
            <p className="font-semibold">How it works</p>
            <ol className="list-decimal list-inside text-fog space-y-1">
              <li>Open a gallery → Settings → Print Store</li>
              <li>Set sizes and prices for that shoot</li>
              <li>Clients order from their gallery page</li>
              <li>You receive an order sheet for your lab</li>
            </ol>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-obsidian">Gallery Unlocks</h3>
            <Badge variant="success" text="Live" />
          </div>
          <p className="text-sm text-fog mb-4">
            Every gallery can show a free preview and charge clients to unlock the full shoot — no invoice, no chasing, instant delivery.
          </p>
          <div className="p-4 bg-cream rounded-xl text-sm text-obsidian">
            <p className="font-semibold">Current status</p>
            <p className="text-fog mt-1">{stats.unlocks} unlock{stats.unlocks === 1 ? '' : 's'} sold{stats.unlocks > 0 ? ' — earnings included in lifetime total above.' : '.'}</p>
            <p className="text-fog mt-1">Set pricing per gallery from the gallery page → Client Access.</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
