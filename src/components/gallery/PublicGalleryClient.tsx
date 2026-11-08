'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Photo } from '@/src/types'
import { WatermarkOverlay } from './WatermarkOverlay'
import { Heart, Download, Share2, Lock, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { trackEvent } from '@/src/components/Analytics'

type PublicPhoto = Photo & { public_url: string }
type DownloadTier = 'off' | 'web' | 'full'

export interface PublicGallery {
  id: string
  title: string
  slug: string
  client_name: string | null
  metadata: Record<string, unknown> | null
  is_downloadable: boolean
  is_favorites_enabled: boolean
  unlock_price_cents: number | null
  watermark_enabled: boolean | null
  photographer: {
    business_name: string | null
    branding_colors: { primary: string; accent: string; background: string } | null
  } | null
}

interface Props {
  gallery: PublicGallery
  photos: PublicPhoto[]
  totalCount: number
  isUnlocked: boolean
  isFreeTier: boolean
  canSellUnlocks: boolean
}

async function downloadWebSized(url: string, filename: string) {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Download failed')
  const blob = await response.blob()
  const image = await createImageBitmap(blob)
  const scale = Math.min(1, 1600 / image.width)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(image.width * scale)
  canvas.height = Math.round(image.height * scale)
  canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height)
  const output = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85))
  if (!output) throw new Error('Download failed')
  const link = document.createElement('a')
  link.href = URL.createObjectURL(output)
  link.download = filename.replace(/\.[^.]+$/, '') + '-web.jpg'
  link.click()
  URL.revokeObjectURL(link.href)
}

export function PublicGalleryClient({ gallery, photos, totalCount, isUnlocked, isFreeTier, canSellUnlocks }: Props) {
  const branding = gallery.photographer?.branding_colors || { primary: '#0A0A0A', accent: '#D4AF37', background: '#F8F6F0' }
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [unlocking, setUnlocking] = useState(false)
  const [actionError, setActionError] = useState('')
  const showWatermark = (gallery.watermark_enabled ?? false) && (!isUnlocked || isFreeTier)
  const configuredTier = gallery.metadata?.download_tier
  const downloadTier: DownloadTier = configuredTier === 'off' || configuredTier === 'web' || configuredTier === 'full'
    ? configuredTier
    : gallery.is_downloadable ? 'full' : 'off'
  const canDownload = downloadTier === 'full' ? gallery.is_downloadable && isUnlocked : downloadTier === 'web'
  const lockedCount = totalCount - photos.length

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(`fav_${gallery.id}`) || '[]') as unknown
      if (Array.isArray(stored)) {
        const ids = stored.filter((id): id is string => typeof id === 'string')
        const timer = window.setTimeout(() => setFavorites(ids), 0)
        return () => window.clearTimeout(timer)
      }
    } catch { /* A malformed local preference should not block the gallery. */ }
  }, [gallery.id])

  useEffect(() => {
    if (lightbox === null) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightbox(null)
      if (event.key === 'ArrowLeft') setLightbox(current => current !== null && current > 0 ? current - 1 : current)
      if (event.key === 'ArrowRight') setLightbox(current => current !== null && current < photos.length - 1 ? current + 1 : current)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [lightbox, photos.length])

  const toggleFavorite = (id: string) => {
    setFavorites(current => {
      const next = current.includes(id) ? current.filter(item => item !== id) : [...current, id]
      localStorage.setItem(`fav_${gallery.id}`, JSON.stringify(next))
      return next
    })
  }

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: gallery.title, url: window.location.href })
      else await navigator.clipboard.writeText(window.location.href)
    } catch { /* The visitor cancelled sharing. */ }
  }

  const unlock = async () => {
    setUnlocking(true)
    setActionError('')
    trackEvent('gallery_unlock_started')
    try {
      const response = await fetch('/api/stripe/gallery-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: gallery.slug }),
      })
      const data = await response.json()
      if (data.url) window.location.assign(data.url)
      else setActionError(data.error || 'Unable to start checkout.')
    } catch {
      setActionError('Unable to start checkout. Please try again.')
    } finally {
      setUnlocking(false)
    }
  }

  return (
    <div style={{ backgroundColor: branding.background }} className="min-h-screen">
      <header className="px-6 py-10 md:py-14 text-center">
        <p style={{ color: branding.primary }} className="text-sm font-bold uppercase tracking-[0.2em] mb-2">
          {gallery.photographer?.business_name || 'Ivory Galleries'}
        </p>
        <h1 style={{ color: branding.primary }} className="text-3xl md:text-5xl font-light mb-2">{gallery.title}</h1>
        {gallery.client_name && <p style={{ color: branding.primary }} className="text-lg opacity-60">For {gallery.client_name}</p>}
      </header>

      <div className="px-2 md:px-4 pb-40">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-2">
          {photos.map((photo, index) => (
            <div key={photo.id} className="relative aspect-square bg-gray-200 rounded-sm overflow-hidden group">
              <button type="button" aria-label={`Open ${photo.filename}`} onClick={() => setLightbox(index)} className="absolute inset-0 w-full h-full cursor-pointer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.public_url} alt={photo.filename} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                {showWatermark && <WatermarkOverlay text={(gallery.photographer?.business_name || 'PREVIEW').toUpperCase()} />}
                <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
              </button>
              {gallery.is_favorites_enabled && (
                <button type="button" aria-label={favorites.includes(photo.id) ? 'Remove favourite' : 'Add favourite'} onClick={() => toggleFavorite(photo.id)}
                  className="absolute top-3 right-3 w-11 h-11 rounded-full bg-white/90 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 transition-opacity">
                  <Heart className={`w-4 h-4 ${favorites.includes(photo.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </button>
              )}
              {canDownload && (
                <button type="button" aria-label={`Download ${photo.filename}`}
                  onClick={() => {
                    setActionError('')
                    if (downloadTier === 'web') downloadWebSized(photo.public_url, photo.filename).catch(() => setActionError('Download failed. Please try again.'))
                    else window.open(photo.public_url, '_blank', 'noopener,noreferrer')
                  }}
                  className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-white/90 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 transition-opacity">
                  <Download className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>
          ))}

          {!isUnlocked && lockedCount > 0 && Array.from({ length: Math.min(lockedCount, 8) }).map((_, index) => (
            <div key={`locked-${index}`} className="relative aspect-square bg-gray-300 rounded-sm overflow-hidden" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-400/40 flex items-center justify-center"><Lock className="w-6 h-6 text-white/70" /></div>
            </div>
          ))}
        </div>

        {!isUnlocked && lockedCount > 0 && (
          <div className="max-w-md mx-auto mt-10 text-center bg-white rounded-2xl shadow-lg p-8">
            <Lock className="w-8 h-8 mx-auto mb-3" style={{ color: branding.accent }} />
            <h2 style={{ color: branding.primary }} className="text-xl font-bold mb-1">+{lockedCount} more photos</h2>
            <p className="text-gray-600 text-sm mb-5">
              {canSellUnlocks && (gallery.unlock_price_cents ?? 0) > 0
                ? `Unlock the full gallery for A$${((gallery.unlock_price_cents ?? 0) / 100).toFixed(2)}. Full-resolution download availability follows the photographer’s settings.`
                : 'Contact your photographer to unlock the full gallery.'}
            </p>
            {canSellUnlocks && (gallery.unlock_price_cents ?? 0) > 0 && (
              <button type="button" onClick={unlock} disabled={unlocking}
                className="min-h-11 px-8 py-3 rounded-full font-bold text-sm shadow-lg hover:opacity-90 transition-opacity disabled:opacity-60"
                style={{ backgroundColor: branding.accent, color: '#0A0A0A' }}>
                {unlocking ? 'Opening secure checkout…' : `Unlock full gallery — A$${((gallery.unlock_price_cents ?? 0) / 100).toFixed(2)}`}
              </button>
            )}
          </div>
        )}
        {actionError && <p role="alert" className="text-center text-sm text-red-700 mt-6">{actionError}</p>}
      </div>

      <div className={`fixed left-1/2 -translate-x-1/2 flex items-center gap-3 z-40 ${isFreeTier ? 'bottom-20' : 'bottom-6'}`}>
        <button type="button" onClick={share} className="min-h-11 px-6 py-3 rounded-full bg-white shadow-lg flex items-center gap-2 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors">
          <Share2 className="w-4 h-4" /> Share
        </button>
      </div>

      {isFreeTier && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/90 px-4 py-3 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 z-30 text-center">
          <span className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo.png" alt="" className="w-6 h-6 rounded object-cover" />
            <p className="text-xs sm:text-sm font-semibold" style={{ color: branding.accent }}>Delivered with Ivory Galleries</p>
          </span>
          <Link href="/" className="min-h-11 inline-flex items-center text-white text-sm font-medium hover:underline">Create your own gallery <span aria-hidden="true">&nbsp;→</span></Link>
        </div>
      )}

      {lightbox !== null && photos[lightbox] && (
        <div role="dialog" aria-modal="true" aria-label="Photo viewer" className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button type="button" aria-label="Close photo viewer" onClick={() => setLightbox(null)} className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center text-white/70 hover:text-white"><X className="w-8 h-8" /></button>
          {lightbox > 0 && (
            <button type="button" aria-label="Previous photo" className="absolute left-4 w-11 h-11 flex items-center justify-center text-white/70 hover:text-white" onClick={(event) => { event.stopPropagation(); setLightbox(lightbox - 1) }}>
              <ChevronLeft className="w-10 h-10" />
            </button>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photos[lightbox].public_url} alt={photos[lightbox].filename} className="max-h-[90vh] max-w-[92vw] object-contain" onClick={(event) => event.stopPropagation()} />
          {showWatermark && <WatermarkOverlay text={(gallery.photographer?.business_name || 'PREVIEW').toUpperCase()} />}
          {lightbox < photos.length - 1 && (
            <button type="button" aria-label="Next photo" className="absolute right-4 w-11 h-11 flex items-center justify-center text-white/70 hover:text-white" onClick={(event) => { event.stopPropagation(); setLightbox(lightbox + 1) }}>
              <ChevronRight className="w-10 h-10" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
