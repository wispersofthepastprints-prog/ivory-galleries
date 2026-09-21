'use client'

import { useState } from 'react'
import { Header } from '@/src/components/layout/Header'
import { Card } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Badge } from '@/src/components/ui/Badge'
import { useAuth } from '@/src/hooks/useAuth'
import { formatBytes } from '@/src/lib/utils'
import { HardDrive, Palette, Link as LinkIcon, CreditCard } from 'lucide-react'

export default function SettingsPage() {
  const { photographer, isPro, isStudio, tier } = useAuth()
  const [activeTab, setActiveTab] = useState('general')

  const storageUsed = photographer?.total_storage_bytes || 0
  const storageLimit = photographer?.storage_limit_bytes || 0
  const storagePercent = Math.min(100, (storageUsed / storageLimit) * 100)

  const tabs = [
    { id: 'general', label: 'General', icon: Palette },
    { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
    { id: 'storage', label: 'Storage', icon: HardDrive },
    { id: 'integrations', label: 'Integrations', icon: LinkIcon },
  ]

  return (
    <div>
      <Header title="Settings" />
      <div className="flex gap-2 mb-8 border-b border-stone/10 pb-1">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${activeTab === tab.id ? 'text-gold border-gold' : 'text-fog border-transparent hover:text-obsidian'}`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'general' && (
        <div className="max-w-2xl space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-charcoal border border-stone flex items-center justify-center text-2xl">📷</div>
              <div>
                <h3 className="font-bold text-obsidian">{photographer?.business_name || 'Your Studio'}</h3>
                <p className="text-fog text-sm">{photographer?.email}</p>
                <Badge text={tier.toUpperCase()} variant={isStudio ? 'studio' : isPro ? 'pro' : 'default'} size="sm" className="mt-1" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-fog mb-4">Branding</h4>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-obsidian font-medium block mb-2">Business Name</label>
                <input className="w-full px-4 py-3 rounded-xl border border-stone/30" defaultValue={photographer?.business_name || ''} />
              </div>
              <div>
                <label className="text-sm text-obsidian font-medium block mb-2">Accent Color</label>
                <div className="flex gap-3">
                  {['#D4AF37', '#0A0A0A', '#F8F6F0', '#A8A9AD', '#2A2A2A'].map(color => (
                    <button key={color} className="w-10 h-10 rounded-lg border-2 border-stone hover:border-gold transition-colors" style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="max-w-2xl">
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-obsidian">Current Plan</h3>
                <p className="text-fog text-sm">Manage your subscription</p>
              </div>
              <Badge text={tier.toUpperCase()} variant={isStudio ? 'studio' : isPro ? 'pro' : 'default'} />
            </div>
            <div className="flex gap-3">
              {!isPro && <Button onClick={() => window.location.href = '/api/stripe/checkout?tier=pro'}>Upgrade to Pro</Button>}
              {!isStudio && <Button variant="secondary" onClick={() => window.location.href = '/api/stripe/checkout?tier=studio'}>Upgrade to Studio</Button>}
              {isPro && <Button variant="ghost" onClick={() => window.location.href = '/api/stripe/portal'}>Manage Billing</Button>}
            </div>
          </Card>
          <Card className="p-6">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-fog mb-4">Plan Comparison</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-stone/10"><span className="text-fog">Galleries</span><span className="text-obsidian font-medium">{isPro ? 'Unlimited' : '3'}</span></div>
              <div className="flex justify-between py-2 border-b border-stone/10"><span className="text-fog">Storage</span><span className="text-obsidian font-medium">{formatBytes(storageLimit)}</span></div>
              <div className="flex justify-between py-2 border-b border-stone/10"><span className="text-fog">Print Store</span><span className="text-obsidian font-medium">{isStudio ? '✓' : '—'}</span></div>
              <div className="flex justify-between py-2 border-b border-stone/10"><span className="text-fog">IvoryOS Sync</span><span className="text-obsidian font-medium">{isStudio ? '✓' : '—'}</span></div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'storage' && (
        <div className="max-w-2xl">
          <Card className="p-6">
            <h3 className="font-bold text-obsidian mb-2">Storage Usage</h3>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-fog">{formatBytes(storageUsed)} used</span>
              <span className="text-fog">{formatBytes(storageLimit)} total</span>
            </div>
            <div className="h-3 bg-stone/10 rounded-full overflow-hidden">
              <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${storagePercent}%` }} />
            </div>
            <p className="text-fog text-sm mt-3">{storagePercent > 80 ? 'You are approaching your storage limit. Consider upgrading.' : `${(100 - storagePercent).toFixed(1)}% remaining`}</p>
          </Card>
        </div>
      )}

      {activeTab === 'integrations' && (
        <div className="max-w-2xl">
          <Card className="p-6">
            <h3 className="font-bold text-obsidian mb-4">IvoryOS Calendar Sync</h3>
            <p className="text-fog text-sm mb-4">Connect your IvoryOS account to automatically create draft galleries from calendar events.</p>
            <Button variant="secondary">{photographer?.ivoryos_sync_enabled ? 'IvoryOS Connected' : 'Link IvoryOS Account'}</Button>
          </Card>
        </div>
      )}
    </div>
  )
}
