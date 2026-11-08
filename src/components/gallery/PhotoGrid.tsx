'use client'

import { Photo } from '@/src/types'
import { useEffect, useState } from 'react'
import { Heart, X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'

interface PhotoGridProps {
  photos: Photo[]
  favoritesEnabled?: boolean
  onDelete?: (id: string) => void
}

export function PhotoGrid({ photos, favoritesEnabled = false, onDelete }: PhotoGridProps) {
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])

  const urlFor = (p: Photo) => p.signed_url || p.display_url || p.original_url || p.thumbnail_url || ''

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
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {photos.map((photo, i) => (
          <div key={photo.id} className="relative aspect-square bg-stone/10 rounded-lg overflow-hidden group">
            <button type="button" aria-label={`Open ${photo.filename}`} onClick={() => setLightbox(i)} className="absolute inset-0 w-full h-full cursor-pointer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={urlFor(photo)} alt={photo.filename} loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            </button>
            {onDelete && (
              <button
                type="button"
                aria-label={`Delete ${photo.filename}`}
                onClick={() => onDelete(photo.id)}
                className="absolute top-2 left-2 w-11 h-11 rounded-full bg-white/90 backdrop-blur flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 transition-opacity z-10"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            )}
            {favoritesEnabled && (
              <button type="button" aria-label={favorites.includes(photo.id) ? 'Remove favourite' : 'Add favourite'} onClick={() => toggleFavorite(photo.id)}
                className="absolute top-2 right-2 w-11 h-11 rounded-full bg-white/90 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 transition-opacity">
                <Heart className={`w-4 h-4 ${favorites.includes(photo.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </button>
            )}
          </div>
        ))}
      </div>

      {lightbox !== null && photos[lightbox] && (
        <div role="dialog" aria-modal="true" aria-label="Photo viewer" className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button type="button" aria-label="Close photo viewer" onClick={() => setLightbox(null)} className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center text-white/70 hover:text-white"><X className="w-8 h-8" /></button>
          {lightbox > 0 && (
            <button type="button" aria-label="Previous photo" className="absolute left-4 w-11 h-11 flex items-center justify-center text-white/70 hover:text-white" onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1) }}>
              <ChevronLeft className="w-10 h-10" />
            </button>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={urlFor(photos[lightbox])} alt={photos[lightbox].filename}
            className="max-h-[90vh] max-w-[92vw] object-contain" onClick={(e) => e.stopPropagation()} />
          {lightbox < photos.length - 1 && (
            <button type="button" aria-label="Next photo" className="absolute right-4 w-11 h-11 flex items-center justify-center text-white/70 hover:text-white" onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1) }}>
              <ChevronRight className="w-10 h-10" />
            </button>
          )}
        </div>
      )}
    </>
  )
}
