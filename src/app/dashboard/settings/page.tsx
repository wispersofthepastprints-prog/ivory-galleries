'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/src/components/layout/Header'
import { Card } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Badge } from '@/src/components/ui/Badge'
import { useAuth } from '@/src/hooks/useAuth'
import { useCurrency } from '@/src/hooks/useCurrency'
import { formatBytes } from '@/src/lib/utils'
import { TIER_CONFIG } from '@/src/lib/stripe'
import { supabaseBrowser } from '@/src/lib/supabase'
import { Photographer } from '@/src/types'
import { trackEvent } from '@/src/components/Analytics'
import { HardDrive, Palette, CreditCard } from 'lucide-react'

const ACCENT_COLORS = ['#D4AF37', '#0A0A0A', '#A8A9AD', '#2A6F5B', '#8A3B4A']
const TABS = [
  { id: 'general', label: 'General', icon: Palette },
  { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
  { id: 'storage', label: 'Storage', icon: HardDrive },
]

function BrandingForm({ photographer, canCustomise, onSaved }: { photographer: Photographer; canCustomise: boolean; onSaved: () => Promise<void> }) {
  const [businessName, setBusinessName] = useState(photographer.business_name || '')
  const [accent, setAccent] = useState(photographer.branding_colors?.accent || '#D4AF37')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const save = async () => {
    setSaving(true)
    setError('')
    setMessage('')
    const branding = {
      primary: photographer.branding_colors?.primary || '#0A0A0A',
      background: photographer.branding_colors?.background || '#F8F6F0',
      accent: canCustomise ? accent : photographer.branding_colors?.accent || '#D4AF37',
    }
    const { error: saveError } = await supabaseBrowser
      .from('photographers')
      .update({ business_name: businessName.trim() || null, branding_colors: branding })
      .eq('id', photographer.id)
    if (saveError) setError(saveError.message)
    else {
      await onSaved()
      setMessage('Branding saved.')
    }
    setSaving(false)
  }

  return (
    <Card className="p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-fog mb-4">Branding</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="settings-business-name" className="text-sm text-obsidian font-medium block mb-2">Business Name</label>
          <input id="settings-business-name" value={businessName} onChange={event => setBusinessName(event.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone/30 bg-white" />
        </div>
        <div>
          <span className="text-sm text-obsidian font-medium block mb-2">Accent Colour</span>
          {canCustomise ? (
            <div className="flex flex-wrap gap-3">
              {ACCENT_COLORS.map(color => (
                <button type="button" key={color} aria-label={`Use accent colour ${color}`} aria-pressed={accent === color} onClick={() => setAccent(color)} className={`w-11 h-11 rounded-lg border-4 transition-colors ${accent === color ? 'border-gold' : 'border-white'}`} style={{ backgroundColor: color }} />
              ))}
            </div>
          ) : <p className="text-sm text-fog">Custom accent colours are available on Pro and Studio.</p>}
        </div>
        <Button size="sm" loading={saving} onClick={save}>Save branding</Button>
        {message && <p className="text-sm text-green-700">{message}</p>}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      </div>
    </Card>
  )
}

function SettingsContent() {
  const { photographer, isPro, isStudio, tier, refresh } = useAuth()
  const [selectedTab, setSelectedTab] = useState<string | null>(null)
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const currency = useCurrency()
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const activeTab = selectedTab || (TABS.some(tab => tab.id === requestedTab) ? requestedTab! : 'general')

  const storageUsed = photographer?.total_storage_bytes || 0
  const storageLimit = TIER_CONFIG[tier].storageBytes
  const storagePercent = storageLimit > 0 ? Math.min(100, (storageUsed / storageLimit) * 100) : 0

  const startCheckout = (plan: 'pro' | 'studio') => {
    trackEvent('upgrade_started', '/dashboard/settings')
    router.push(`/api/stripe/checkout?tier=${plan}&billing=${billing}&currency=${currency}`)
  }

  return (
    <div>
      <Header title="Settings" />
      {searchParams.get('success') === 'true' && <p className="text-sm text-green-700 mb-4">Checkout completed. Your plan will update when Stripe confirms the subscription.</p>}
      {searchParams.get('canceled') === 'true' && <p className="text-sm text-fog mb-4">Checkout was cancelled. Your plan has not changed.</p>}
      {searchParams.get('error') && <p role="alert" className="text-sm text-red-600 mb-4">Checkout could not be started. Please try again.</p>}

      <div className="flex gap-2 mb-8 border-b border-stone/10 pb-1 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon
          return <button type="button" key={tab.id} onClick={() => setSelectedTab(tab.id)} className={`min-h-11 whitespace-nowrap flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${activeTab === tab.id ? 'text-gold border-gold' : 'text-fog border-transparent hover:text-obsidian'}`}><Icon className="w-4 h-4" />{tab.label}</button>
        })}
      </div>

      {activeTab === 'general' && (
        <div className="max-w-2xl space-y-6">
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 shrink-0 rounded-full bg-charcoal border border-stone flex items-center justify-center text-xl font-bold text-ivory">{(photographer?.business_name || 'S').slice(0, 1).toUpperCase()}</div>
              <div className="min-w-0"><h2 className="break-words font-bold text-obsidian">{photographer?.business_name || 'Your Studio'}</h2><p className="break-all text-fog text-sm">{photographer?.email}</p><Badge text={tier.toUpperCase()} variant={isStudio ? 'studio' : isPro ? 'pro' : 'default'} size="sm" className="mt-1" /></div>
            </div>
          </Card>
          {photographer && <BrandingForm key={`${photographer.id}-${photographer.updated_at}`} photographer={photographer} canCustomise={isPro} onSaved={refresh} />}
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="max-w-2xl">
          <Card className="p-6 mb-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold text-obsidian">Current Plan</h2><p className="text-fog text-sm">Manage your subscription</p></div><Badge text={tier.toUpperCase()} variant={isStudio ? 'studio' : isPro ? 'pro' : 'default'} /></div>
            {!isStudio && (
              <div className="mb-4"><span className="text-sm text-fog block mb-2">Billing period</span><div className="flex w-full flex-col overflow-hidden rounded-lg border border-stone/30 sm:inline-flex sm:w-auto sm:flex-row">{(['monthly', 'yearly'] as const).map(period => <button type="button" key={period} onClick={() => setBilling(period)} className={`flex min-h-11 items-center justify-center px-4 py-2 text-center text-sm font-medium transition-colors ${billing === period ? 'bg-gold text-obsidian' : 'text-fog hover:text-obsidian'}`}>{period === 'monthly' ? 'Monthly' : 'Yearly — save 2 months'}</button>)}</div></div>
            )}
            <div className="flex flex-wrap gap-3">
              {!isPro && <Button onClick={() => startCheckout('pro')}>Upgrade to Pro</Button>}
              {!isStudio && <Button variant="secondary" onClick={() => startCheckout('studio')}>Upgrade to Studio</Button>}
              {isPro && <Button variant="ghost" onClick={() => router.push('/api/stripe/portal')}>Manage Billing</Button>}
            </div>
            <div className="mt-5 pt-4 border-t border-stone/10 grid sm:grid-cols-2 gap-4 text-sm">
              {!isPro && <div><p className="font-semibold text-obsidian">Pro</p><p className="text-fog">50 GB storage · Unlimited galleries · Password protection</p></div>}
              {!isStudio && <div><p className="font-semibold text-obsidian">Studio</p><p className="text-fog">200 GB storage · Paid gallery unlocks</p></div>}
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-fog mb-4">Plan Comparison</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-stone/10"><span className="text-fog">Galleries</span><span className="text-obsidian font-medium">{isPro ? 'Unlimited' : '3'}</span></div>
              <div className="flex justify-between py-2 border-b border-stone/10"><span className="text-fog">Storage</span><span className="text-obsidian font-medium">{formatBytes(storageLimit)}</span></div>
              <div className="flex justify-between py-2 border-b border-stone/10"><span className="text-fog">Password protection</span><span className="text-obsidian font-medium">{isPro ? 'Included' : '—'}</span></div>
              <div className="flex justify-between py-2"><span className="text-fog">Paid gallery unlocks</span><span className="text-obsidian font-medium">{isStudio ? 'Included' : '—'}</span></div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'storage' && (
        <div className="max-w-2xl"><Card className="p-6"><h2 className="font-bold text-obsidian mb-2">Storage Usage</h2><div className="flex justify-between text-sm mb-2"><span className="text-fog">{formatBytes(storageUsed)} used</span><span className="text-fog">{formatBytes(storageLimit)} total</span></div><div className="h-3 bg-stone/10 rounded-full overflow-hidden"><div className="h-full bg-gold rounded-full transition-all" style={{ width: `${storagePercent}%` }} /></div><p className="text-fog text-sm mt-3">{storagePercent > 80 ? 'You are approaching your storage limit. Consider upgrading.' : `${(100 - storagePercent).toFixed(1)}% remaining`}</p></Card></div>
      )}
    </div>
  )
}

export default function SettingsPage() {
  return <Suspense fallback={<div className="h-64" />}><SettingsContent /></Suspense>
}
