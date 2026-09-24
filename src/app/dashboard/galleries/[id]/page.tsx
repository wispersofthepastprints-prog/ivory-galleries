'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/src/components/layout/Header'
import { Card } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Badge } from '@/src/components/ui/Badge'
import { PhotoGrid } from '@/src/components/gallery/PhotoGrid'
import { ClientAccessCard } from '@/src/components/gallery/ClientAccessCard'
import { UploadZone } from '@/src/components/gallery/UploadZone'
import { usePhotos } from '@/src/hooks/usePhotos'
import { useGallery } from '@/src/hooks/useGallery'
import { useAuth } from '@/src/hooks/useAuth'
import { FeatureGate } from '@/src/components/paywall/FeatureGate'
import { formatDate } from '@/src/lib/utils'
import { Globe, Loader2, Lock } from 'lucide-react'
import Link from 'next/link'

export default function GalleryDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { photographer } = useAuth()
  const { galleries, updateGallery } = useGallery()
  const { photos, fetchPhotos, uploadPhoto, deletePhoto, isLoading: photosLoading } = usePhotos()
  const [uploading, setUploading] = useState(false)

  const gallery = galleries.find(g => g.id === id)

  useEffect(() => {
    if (id) fetchPhotos(id)
  }, [id, fetchPhotos])

  const handleUpload = async (files: File[]) => {
    if (!photographer || !gallery) return
    setUploading(true)
    for (const file of files) {
      try {
        await uploadPhoto(file, gallery.id, photographer.id)
      } catch (err) {
        console.error('Upload failed:', err)
      }
    }
    setUploading(false)
    await fetchPhotos(gallery.id)
  }

  const togglePublish = async () => {
    if (!gallery) return
    const newStatus = gallery.status === 'published' ? 'draft' : 'published'
    await updateGallery(gallery.id, { status: newStatus })
  }

  if (!gallery) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    )
  }

  return (
    <div>
      <Header
        title={gallery.title}
        subtitle={`Created ${formatDate(gallery.created_at)}`}
        action={
          <div className="flex items-center gap-3">
            <Link href={`/g/${gallery.slug}`} target="_blank">
              <Button variant="outline" size="sm"><Globe className="w-4 h-4" /> View</Button>
            </Link>
            <Button size="sm" onClick={togglePublish}>
              {gallery.status === 'published' ? 'Unpublish' : 'Publish'}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card padding="lg" className="lg:col-span-2">
          <h3 className="font-bold text-obsidian mb-4">Upload Photos</h3>
          <UploadZone onUpload={handleUpload} />
          {uploading && (
            <div className="mt-4 flex items-center gap-2 text-sm text-fog">
              <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <ClientAccessCard gallery={gallery} onSave={(updates) => updateGallery(gallery.id, updates)} />
          <Card padding="lg">
            <h3 className="font-bold text-obsidian mb-4">Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-stone/10">
                <span className="text-sm text-fog">Password Protection</span>
                <FeatureGate feature="password_protection" fallback={<Lock className="w-4 h-4 text-stone" />}>
                  <button className="text-sm text-gold font-medium">Configure</button>
                </FeatureGate>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-stone/10">
                <span className="text-sm text-fog">Client Favorites</span>
                <FeatureGate feature="client_favorites" fallback={<Lock className="w-4 h-4 text-stone" />}>
                  <button className="text-sm text-gold font-medium">Enable</button>
                </FeatureGate>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-stone/10">
                <span className="text-sm text-fog">Print Store</span>
                <FeatureGate feature="print_store" fallback={<Lock className="w-4 h-4 text-stone" />}>
                  <button className="text-sm text-gold font-medium">Configure</button>
                </FeatureGate>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-fog">Downloads</span>
                <button className="text-sm text-gold font-medium">Allowed</button>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="font-bold text-obsidian mb-2">Share</h3>
            <p className="text-xs text-fog mb-3">Public URL</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-cream px-3 py-2 rounded-lg truncate">
                {typeof window !== 'undefined' ? `${window.location.origin}/g/${gallery.slug}` : `/g/${gallery.slug}`}
              </code>
              <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : ''}/g/${gallery.slug}`)}>
                Copy
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <h3 className="font-bold text-obsidian mb-4">Photos ({photos.length})</h3>
      {photosLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <PhotoGrid photos={photos} onDelete={async (id) => { if (window.confirm('Delete this photo? This cannot be undone.')) { try { await deletePhoto(id) } catch { window.alert('Could not delete photo.') } } }} />
      )}
    </div>
  )
}
