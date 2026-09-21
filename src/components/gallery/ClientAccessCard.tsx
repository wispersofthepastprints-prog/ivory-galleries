'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Gallery } from '@/src/types'
import { Lock, Unlock, DollarSign, CheckCircle2, Loader2 } from 'lucide-react'

interface Props {
  gallery: Gallery
  onSave: (updates: Partial<Gallery>) => Promise<void>
}

export function ClientAccessCard({ gallery, onSave }: Props) {
  const [mode, setMode] = useState<'preview' | 'full'>(gallery.access_mode ?? 'preview')
  const [previewLimit, setPreviewLimit] = useState(gallery.preview_limit ?? 20)
  const [priceDollars, setPriceDollars] = useState(((gallery.unlock_price_cents ?? 0) / 100).toString())
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [earnings, setEarnings] = useState<{ count: number; cents: number }>({ count: 0, cents: 0 })

  useEffect(() => {
    // Best-effort earnings for this gallery
    fetch(`/api/galleries/${gallery.id}/purchases`, { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .then(d => d && setEarnings({ count: d.count ?? 0, cents: d.cents ?? 0 }))
      .catch(() => {})
  }, [gallery.id, saved])

  const save = async () => {
    setSaving(true)
    setSaved(false)
    await onSave({
      access_mode: mode,
      preview_limit: Math.max(1, Math.min(200, Number(previewLimit) || 20)),
      unlock_price_cents: mode === 'preview' ? Math.round((parseFloat(priceDollars) || 0) * 100) : 0,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <Card padding="lg">
      <h3 className="font-bold text-obsidian mb-1">Client Access</h3>
      <p className="text-xs text-fog mb-4">What your client sees at the public link.</p>

      <div className="space-y-3">
        <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${mode === 'full' ? 'border-gold bg-gold/5' : 'border-stone/20'}`}>
          <input type="radio" name="access" checked={mode === 'full'} onChange={() => setMode('full')} className="mt-1" />
          <span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-obsidian"><Unlock className="w-3.5 h-3.5" /> Full gallery open</span>
            <span className="text-xs text-fog">Client sees every photo. Good for delivery after final payment.</span>
          </span>
        </label>

        <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${mode === 'preview' ? 'border-gold bg-gold/5' : 'border-stone/20'}`}>
          <input type="radio" name="access" checked={mode === 'preview'} onChange={() => setMode('preview')} className="mt-1" />
          <span className="flex-1">
            <span className="flex items-center gap-1.5 text-sm font-medium text-obsidian"><Lock className="w-3.5 h-3.5" /> Preview + paid unlock</span>
            <span className="text-xs text-fog">Show a few photos free, charge to unlock the rest. Instant revenue, no invoice chasing.</span>
          </span>
        </label>

        {mode === 'preview' && (
          <div className="pl-6 space-y-3">
            <div>
              <label className="block text-xs font-medium text-fog mb-1">Free preview count</label>
              <input type="number" min={1} max={200} value={previewLimit}
                onChange={e => setPreviewLimit(Number(e.target.value))}
                className="w-28 px-3 py-2 rounded-lg border border-stone/30 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-fog mb-1">Unlock price (USD)</label>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-stone" />
                <input type="number" min={0} step="0.50" value={priceDollars}
                  onChange={e => setPriceDollars(e.target.value)}
                  className="w-28 px-3 py-2 rounded-lg border border-stone/30 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50" />
              </div>
              <p className="text-xs text-fog mt-1">Typical range: $29–$99 per gallery. Stripe deposits to your account; fees apply.</p>
            </div>
          </div>
        )}
      </div>

      <Button size="sm" className="w-full mt-4" onClick={save} disabled={saving}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : null}
        {saving ? 'Saving…' : saved ? 'Saved' : 'Save access settings'}
      </Button>

      {earnings.count > 0 && (
        <p className="text-xs text-green-600 mt-3 text-center">
          {earnings.count} unlock{earnings.count === 1 ? '' : 's'} · ${(earnings.cents / 100).toFixed(2)} earned from this gallery
        </p>
      )}
    </Card>
  )
}
