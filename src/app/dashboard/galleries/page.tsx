'use client'

import { Header } from '@/src/components/layout/Header'
import { Card } from '@/src/components/ui/Card'
import { Badge } from '@/src/components/ui/Badge'
import { Button } from '@/src/components/ui/Button'
import { useGallery } from '@/src/hooks/useGallery'
import { useAuth } from '@/src/hooks/useAuth'
import { useSubscription } from '@/src/hooks/useSubscription'
import { formatDate } from '@/src/lib/utils'
import { Image, Plus, ExternalLink, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'

export default function GalleriesPage() {
  const { galleries, isLoading, deleteGallery } = useGallery()
  const { tier } = useAuth()
  const { getGalleryLimit } = useSubscription()

  const limit = getGalleryLimit()
  const atLimit = limit !== Infinity && galleries.length >= limit

  return (
    <div>
      <Header
        title="Galleries"
        subtitle="Manage and share your client galleries"
        action={
          <Link href={atLimit ? '/dashboard/settings?tab=billing' : '/dashboard/galleries/new'}>
            <Button disabled={atLimit}><Plus className="w-4 h-4" /> New Gallery</Button>
          </Link>
        }
      />

      {atLimit && (
        <Card padding="md" className="mb-6 bg-amber-50 border-amber-200">
          <p className="text-sm text-amber-800">
            You have reached your {limit} gallery limit. <Link href="/dashboard/settings?tab=billing" className="font-semibold underline">Upgrade to Pro</Link> for unlimited galleries.
          </p>
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} padding="none" className="h-64 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : galleries.length === 0 ? (
        <Card className="p-16 text-center">
          <Image className="w-16 h-16 text-stone mx-auto mb-4" />
          <h3 className="text-xl font-bold text-obsidian mb-2">No galleries yet</h3>
          <p className="text-fog mb-6">Create your first client gallery to get started.</p>
          <Link href="/dashboard/galleries/new">
            <Button>Create Gallery</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map(gallery => (
            <Card key={gallery.id} padding="none" className="group overflow-hidden">
              <div className="aspect-[4/3] bg-gray-100 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-bold text-white text-lg truncate">{gallery.title}</h3>
                  <p className="text-white/70 text-sm">{gallery.client_name || 'No client'}</p>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge text={gallery.status} variant={gallery.status === 'published' ? 'success' : 'warning'} size="sm" />
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="text-xs text-fog">
                  <p>{formatDate(gallery.event_date)}</p>
                  <p>{gallery.view_count} views</p>
                </div>
                <div className="flex items-center gap-2">
                  {gallery.status === 'published' && (
                    <button
                      onClick={() => window.open(`/g/${gallery.slug}`, '_blank')}
                      className="p-2 rounded-lg hover:bg-cream transition-colors"
                      title="Open public gallery"
                    >
                      <ExternalLink className="w-4 h-4 text-fog" />
                    </button>
                  )}
                  <Link href={`/dashboard/galleries/${gallery.id}`}>
                    <button className="p-2 rounded-lg hover:bg-cream transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-fog" />
                    </button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
