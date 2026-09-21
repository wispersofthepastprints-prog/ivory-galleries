'use client'

import { useEffect, useState } from 'react'
import { Gallery, Photo } from '@/src/types'
import { WatermarkOverlay } from './WatermarkOverlay'
import { Heart, Download, Share2, Lock, X, ChevronLeft, ChevronRight } from 'lucide-react'

type PublicPhoto = Photo & { public_url: string }

interface Props {
  gallery: Gallery
  photos: PublicPhoto[]
  totalCount: number
  isUnlocked: boolean
  isFreeTier: boolean
}

export function PublicGalleryClient({ gallery, photos, totalCount, isUnlocked, isFreeTier }: Props) {
  const branding = (gallery.photographer as any)?.branding_colors || { primary: '#0A0A0A', accent: '#D4AF37', background: '#F8F6F0' }
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const showWatermark = (gallery.watermark_enabled ?? false) && (!isUnlocked || isFreeTier)
  const unlockPrice = (gallery.unlock_price_cents ?? 0) / 100
  const hasUnlockPrice = unlockPrice > 0

  useEffect(() => {
    try {
      setFavorites(JSON.parse(localStorage.getItem(`fav_${gallery.id}`) || '[]'))
    } catch { /* ignore */ }
  }, [gallery.id])

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      localStorage.setItem(`fav_${gallery.id}`, JSON.stringify(next))
      return next
    })
  }

  const share = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: gallery.title, url }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(url).catch(() => {})
    }
  }

  const unlock = async () => {
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/stripe/gallery-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: gallery.slug }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error || 'Unable to start checkout')
    } catch {
      alert('Unable to start checkout — please try again')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const lockedCount = totalCount - photos.length

  return (
    <div style={{ backgroundColor: branding.background }} className="min-h-screen">
      <header className="px-6 py-10 md:py-14 text-center">
        <p style={{ color: branding.primary }} className="text-sm font-bold uppercase tracking-[0.2em] mb-2">
          {(gallery.photographer as any)?.business_name || 'Ivory Galleries'}
        </p>
        <h1 style={{ color: branding.primary }} className="text-3xl md:text-5xl font-light mb-2">{gallery.title}</h1>
        {gallery.client_name && <p style={{ color: branding.primary }} className="text-lg opacity-60">For {gallery.client_name}</p>}
      </header>

      <div className="px-2 md:px-4 pb-40">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-2">
          {photos.map((photo, i) => (
            <div key={photo.id} className="relative aspect-square bg-gray-200 rounded-sm overflow-hidden group cursor-pointer"
              onClick={() => setLightbox(i)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.public_url} alt={photo.filename} loading="lazy"
                className="absolute inset-0 w-full h-full object-cover" />
              {showWatermark && <WatermarkOverlay text={((gallery.photographer as any)?.business_name || 'PREVIEW').toUpperCase()} />}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
              {gallery.is_favorites_enabled && (
                <button onClick={(e) => { e.stopPropagation(); toggleFavorite(photo.id) }}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Heart className={`w-4 h-4 ${favorites.includes(photo.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </button>
              )}
              {gallery.is_downloadable && isUnlocked && (
                <a href={photo.public_url} download={photo.filename} target="_blank" rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Download className="w-4 h-4 text-gray-600" />
                </a>
              )}
            </div>
          ))}

          {!isUnlocked && lockedCount > 0 && Array.from({ length: Math.min(lockedCount, 8) }).map((_, i) => (
            <div key={`locked-${i}`} className="relative aspect-square bg-gray-300 rounded-sm overflow-hidden">
              <div className="absolute inset-0 backdrop-blur-sm bg-gray-400/40 flex items-center justify-center">
                <Lock className="w-6 h-6 text-white/70" />
              </div>
            </div>
          ))}
        </div>

        {!isUnlocked && lockedCount > 0 && (
          <div className="max-w-md mx-auto mt-10 text-center bg-white rounded-2xl shadow-lg p-8">
            <Lock className="w-8 h-8 mx-auto mb-3" style={{ color: branding.accent }} />
            <h3 style={{ color: branding.primary }} className="text-xl font-bold mb-1">+{lockedCount} more photos</h3>
            <p className="text-gray-500 text-sm mb-5">
              {hasUnlockPrice
                ? `Unlock the full gallery for $${unlockPrice.toFixed(2)} — instant access, high-res downloads included.`
                : 'Contact your photographer to unlock the full gallery.'}
            </p>
            {hasUnlockPrice && (
              <button onClick={unlock} disabled={checkoutLoading}
                className="px-8 py-3 rounded-full font-bold text-sm shadow-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: branding.accent, color: '#0A0A0A' }}>
                {checkoutLoading ? 'Redirecting to checkout…' : `Unlock Full Gallery — $${unlockPrice.toFixed(2)}`}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-40">
        <button onClick={share} className="px-6 py-3 rounded-full bg-white shadow-lg flex items-center gap-2 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors">
          <Share2 className="w-4 h-4" /> Share
        </button>
      </div>

      {isFreeTier && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/90 px-6 py-4 flex items-center justify-between z-30">
          <span className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo.png" alt="Ivory Galleries" className="w-6 h-6 rounded object-cover" />
            <p className="text-sm font-semibold" style={{ color: branding.accent }}>Delivered with Ivory Galleries — a Whispers of the Past product</p>
          </span>
          <a href="/" className="text-white text-sm font-medium hover:underline">Create your own gallery &rarr;</a>
        </div>
      )}

      {lightbox !== null && photos[lightbox] && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white"><X className="w-8 h-8" /></button>
          {lightbox > 0 && (
            <button className="absolute left-4 text-white/70 hover:text-white" onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1) }}>
              <ChevronLeft className="w-10 h-10" />
            </button>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photos[lightbox].public_url} alt={photos[lightbox].filename}
            className="max-h-[90vh] max-w-[92vw] object-contain" onClick={(e) => e.stopPropagation()} />
          {showWatermark && <WatermarkOverlay text={((gallery.photographer as any)?.business_name || 'PREVIEW').toUpperCase()} />}
          {lightbox < photos.length - 1 && (
            <button className="absolute right-4 text-white/70 hover:text-white" onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1) }}>
              <ChevronRight className="w-10 h-10" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}