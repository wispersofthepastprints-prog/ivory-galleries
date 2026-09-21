'use client'

import { Header } from '@/src/components/layout/Header'
import { Card } from '@/src/components/ui/Card'
import { Badge } from '@/src/components/ui/Badge'
import { Button } from '@/src/components/ui/Button'
import { useAuth } from '@/src/hooks/useAuth'
import { useGallery } from '@/src/hooks/useGallery'
import { formatBytes } from '@/src/lib/utils'
import { Image, Eye, Heart, TrendingUp, Plus } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { photographer, tier, isPro } = useAuth()
  const { galleries } = useGallery()

  const totalViews = galleries.reduce((sum, g) => sum + (g.view_count || 0), 0)
  const storageUsed = photographer?.total_storage_bytes || 0
  const storageLimit = photographer?.storage_limit_bytes || 0
  const storagePct = Math.min(100, (storageUsed / storageLimit) * 100)

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle={`Welcome back, ${photographer?.business_name || 'Photographer'}`}
        action={
          <Link href="/dashboard/galleries/new">
            <Button><Plus className="w-4 h-4" /> New Gallery</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card padding="lg" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
            <Image className="w-6 h-6 text-gold" />
          </div>
          <div>
            <p className="text-2xl font-bold text-obsidian">{galleries.length}</p>
            <p className="text-xs text-fog uppercase tracking-wider">Galleries</p>
          </div>
        </Card>
        <Card padding="lg" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <Eye className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-obsidian">{totalViews}</p>
            <p className="text-xs text-fog uppercase tracking-wider">Total Views</p>
          </div>
        </Card>
        <Card padding="lg" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
            <Heart className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-obsidian">0</p>
            <p className="text-xs text-fog uppercase tracking-wider">Favorites</p>
          </div>
        </Card>
        <Card padding="lg" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-obsidian">$0</p>
            <p className="text-xs text-fog uppercase tracking-wider">Earnings</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card padding="lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-obsidian">Recent Galleries</h3>
              <Link href="/dashboard/galleries" className="text-sm text-gold font-medium hover:underline">View all</Link>
            </div>
            {galleries.length === 0 ? (
              <div className="text-center py-12">
                <Image className="w-12 h-12 text-stone mx-auto mb-4" />
                <p className="text-fog">No galleries yet. Create your first one.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {galleries.slice(0, 5).map(gallery => (
                  <Link key={gallery.id} href={`/dashboard/galleries/${gallery.id}`}>
                    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-cream transition-colors border border-transparent hover:border-stone/10">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-obsidian truncate">{gallery.title}</p>
                        <p className="text-xs text-fog">{gallery.status} &bull; {gallery.view_count} views</p>
                      </div>
                      <Badge text={gallery.status} variant={gallery.status === 'published' ? 'success' : 'default'} size="sm" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card padding="lg" className="mb-6">
            <h3 className="font-bold text-obsidian mb-4">Storage</h3>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-fog">{formatBytes(storageUsed)} used</span>
              <span className="text-fog">{formatBytes(storageLimit)} total</span>
            </div>
            <div className="h-2 bg-stone/10 rounded-full overflow-hidden">
              <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${storagePct}%` }} />
            </div>
            {!isPro && (
              <p className="text-xs text-fog mt-3">Upgrade to Pro for 50GB storage.</p>
            )}
          </Card>

          <Card padding="lg">
            <h3 className="font-bold text-obsidian mb-2">Current Plan</h3>
            <div className="flex items-center gap-2 mb-4">
              <Badge text={tier.toUpperCase()} variant={tier === 'studio' ? 'studio' : tier === 'pro' ? 'pro' : 'default'} size="sm" />
            </div>
            <Link href="/dashboard/settings?tab=billing">
              <Button variant="outline" size="sm" className="w-full">Manage Subscription</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
