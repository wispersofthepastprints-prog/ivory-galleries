'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/src/components/layout/Header'
import { Card } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { PhotoGrid } from '@/src/components/gallery/PhotoGrid'
import { ClientAccessCard } from '@/src/components/gallery/ClientAccessCard'
import { GallerySecuritySettings } from '@/src/components/gallery/GallerySecuritySettings'
import { UploadZone } from '@/src/components/gallery/UploadZone'
import { usePhotos } from '@/src/hooks/usePhotos'
import { useGallery } from '@/src/hooks/useGallery'
import { useAuth } from '@/src/hooks/useAuth'
import { formatDate } from '@/src/lib/utils'
import { Gallery } from '@/src/types'
import { trackEvent } from '@/src/components/Analytics'
import { Globe, Loader2 } from 'lucide-react'

type DownloadTier = 'off' | 'web' | 'full'

function futureDate(days: number) {
  const date = new Date(Date.now() + days * 86400000)
  return date.toISOString().slice(0, 10)
}

export default function GalleryDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { photographer, isPro, isStudio } = useAuth()
  const { galleries, isLoading: galleriesLoading, updateGallery } = useGallery()
  const { photos, fetchPhotos, uploadPhoto, deletePhoto, isLoading: photosLoading, uploading } = usePhotos()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const gallery = galleries.find(item => item.id === id)
  const configuredTier = gallery?.metadata?.download_tier
  const downloadTier: DownloadTier = configuredTier === 'off' || configuredTier === 'web' || configuredTier === 'full'
    ? configuredTier
    : gallery?.is_downloadable ? 'full' : 'off'

  useEffect(() => {
    if (id) fetchPhotos(id).catch(() => setError('Unable to load secure photo previews.'))
  }, [id, fetchPhotos])

  const saveGallery = async (updates: Partial<Gallery>) => {
    if (!gallery) return
    setError('')
    setMessage('')
    try {
      await updateGallery(gallery.id, updates)
      setMessage('Settings saved.')
    } catch (saveError) {
      const text = saveError instanceof Error ? saveError.message : 'Unable to save settings.'
      setError(text)
      throw saveError
    }
  }

  const handleUpload = async (files: File[]) => {
    if (!photographer || !gallery) return
    setError('')
    setMessage('')
    let completed = 0
    for (const file of files) {
      try {
        await uploadPhoto(file, gallery.id, photographer.id)
        completed += 1
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : 'Upload failed.')
        break
      }
    }
    if (completed > 0) setMessage(`${completed} photo${completed === 1 ? '' : 's'} uploaded.`)
  }

  const togglePublish = async () => {
    if (!gallery) return
    const newStatus = gallery.status === 'published' ? 'draft' : 'published'
    await saveGallery({ status: newStatus })
    if (newStatus === 'published') trackEvent('gallery_published')
  }

  const copyShareLink = async () => {
    if (!gallery) return
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/g/${gallery.slug}`)
      setMessage('Public link copied.')
      trackEvent('gallery_shared')
    } catch {
      setError('Could not copy the link. Select it and copy manually.')
    }
  }

  if (galleriesLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>
  }
  if (!gallery) {
    return <Card className="p-8 text-center"><p className="text-fog mb-4">This gallery could not be found.</p><Link href="/dashboard/galleries" className="text-gold font-semibold underline">Back to galleries</Link></Card>
  }

  return (
    <div>
      <Header
        title={gallery.title}
        subtitle={`Created ${formatDate(gallery.created_at)}`}
        action={
          <div className="flex items-center gap-3">
            {gallery.status === 'published' && <Link href={`/g/${gallery.slug}`} target="_blank"><Button variant="outline" size="sm"><Globe className="w-4 h-4" /> View</Button></Link>}
            <Button size="sm" onClick={togglePublish}>{gallery.status === 'published' ? 'Unpublish' : 'Publish'}</Button>
          </div>
        }
      />

      {message && <p className="text-sm text-green-700 mb-4">{message}</p>}
      {error && <p role="alert" className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card padding="lg" className="lg:col-span-2">
          <h2 className="font-bold text-obsidian mb-4">Upload Photos</h2>
          <UploadZone onUpload={handleUpload} />
          {uploading && <div className="mt-4 flex items-center gap-2 text-sm text-fog"><Loader2 className="w-4 h-4 animate-spin" /> Uploading securely…</div>}
        </Card>

        <div className="space-y-4">
          <ClientAccessCard key={`${gallery.id}-${gallery.updated_at}`} gallery={gallery} canSellUnlocks={isStudio} onSave={saveGallery} />
          <Card padding="lg">
            <h2 className="font-bold text-obsidian mb-4">Settings</h2>
            <div className="space-y-5">
              <div className="py-2 border-b border-stone/10">
                <h3 className="text-sm text-fog mb-3">Password Protection</h3>
                <GallerySecuritySettings key={`${gallery.id}-${gallery.is_password_protected}`} gallery={gallery} canUsePasswords={isPro} onChanged={enabled => saveGallery({ is_password_protected: enabled })} />
              </div>

              <div className="py-2 border-b border-stone/10">
                <div className="flex items-center justify-between gap-4">
                  <div><h3 className="text-sm text-fog">Client favourites</h3><p className="text-xs text-stone mt-1">Saved only on the client’s device.</p></div>
                  {isPro ? (
                    <button type="button" role="switch" aria-checked={gallery.is_favorites_enabled} onClick={() => saveGallery({ is_favorites_enabled: !gallery.is_favorites_enabled })}
                      className={`min-h-11 px-4 rounded-full text-sm font-medium ${gallery.is_favorites_enabled ? 'bg-gold text-obsidian' : 'bg-stone/10 text-fog'}`}>
                      {gallery.is_favorites_enabled ? 'On' : 'Off'}
                    </button>
                  ) : <Link href="/dashboard/settings?tab=billing" className="text-xs text-gold underline">Pro feature</Link>}
                </div>
              </div>

              <div className="py-2 border-b border-stone/10">
                <div className="flex items-center justify-between gap-4">
                  <div><h3 className="text-sm text-fog">Preview watermark</h3><p className="text-xs text-stone mt-1">Overlays your studio name on visible photos.</p></div>
                  <button type="button" role="switch" aria-checked={gallery.watermark_enabled ?? false} onClick={() => saveGallery({ watermark_enabled: !(gallery.watermark_enabled ?? false) })}
                    className={`min-h-11 px-4 rounded-full text-sm font-medium ${gallery.watermark_enabled ? 'bg-gold text-obsidian' : 'bg-stone/10 text-fog'}`}>
                    {gallery.watermark_enabled ? 'On' : 'Off'}
                  </button>
                </div>
              </div>

              <div className="py-2 border-b border-stone/10">
                <div className="flex items-center justify-between"><h3 className="text-sm text-fog">Gallery Expiry</h3><span className="text-xs text-fog">{gallery.expiry_date ? formatDate(gallery.expiry_date) : 'Never'}</span></div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[30, 90, 180].map(days => <button type="button" key={days} onClick={() => saveGallery({ expiry_date: futureDate(days) })} className="min-h-11 text-xs px-3 py-1.5 rounded-full border border-stone/30 text-fog hover:border-gold hover:text-gold transition-colors">{days} days</button>)}
                  <button type="button" onClick={() => saveGallery({ expiry_date: null })} className="min-h-11 text-xs px-3 py-1.5 rounded-full border border-stone/30 text-fog hover:border-gold hover:text-gold transition-colors">Never</button>
                </div>
                <label htmlFor="gallery-expiry" className="sr-only">Expiry date</label>
                <input id="gallery-expiry" type="date" value={gallery.expiry_date?.slice(0, 10) || ''} onChange={event => saveGallery({ expiry_date: event.target.value || null })}
                  className="mt-2 w-full min-h-11 text-sm px-3 py-2 rounded-lg border border-stone/30 bg-white focus:outline-none focus:ring-2 focus:ring-gold/50" />
              </div>

              <div className="py-2">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="download-tier" className="text-sm text-fog">Downloads</label>
                  <select id="download-tier" value={downloadTier} onChange={event => {
                    const tier = event.target.value as DownloadTier
                    void saveGallery({ is_downloadable: tier !== 'off', metadata: { ...gallery.metadata, download_tier: tier } })
                  }} className="min-h-11 text-sm px-3 py-1.5 rounded-lg border border-stone/30 bg-white focus:outline-none focus:ring-2 focus:ring-gold/50">
                    <option value="off">Off</option><option value="web">Web size</option><option value="full">Full resolution</option>
                  </select>
                </div>
                <p className="text-xs text-stone leading-relaxed">Full-resolution downloads require full gallery access. Expired galleries are not publicly viewable.</p>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <h2 className="font-bold text-obsidian mb-2">Share</h2>
            <p className="text-xs text-fog mb-3">Public URL</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-cream px-3 py-2 rounded-lg truncate">{`/g/${gallery.slug}`}</code>
              <Button variant="outline" size="sm" onClick={copyShareLink}>Copy</Button>
            </div>
          </Card>
        </div>
      </div>

      <h2 className="font-bold text-obsidian mb-4">Photos ({photos.length})</h2>
      {photosLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">{[1, 2, 3, 4].map(item => <div key={item} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <PhotoGrid photos={photos} onDelete={async photoId => {
          if (!window.confirm('Delete this photo? This cannot be undone.')) return
          try { await deletePhoto(photoId); setMessage('Photo deleted.') } catch { setError('Could not delete photo.') }
        }} />
      )}
    </div>
  )
}
