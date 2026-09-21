'use client'

import { Photo } from '@/src/types'
import { useState } from 'react'
import { Heart, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface PhotoGridProps {
  photos: Photo[]
  favoritesEnabled?: boolean
}

export function PhotoGrid({ photos, favoritesEnabled = false }: PhotoGridProps) {
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])

  const urlFor = (p: Photo) => p.display_url || p.original_url || p.thumbnail_url || ''

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {photos.map((photo, i) => (
          <div key={photo.id} className="relative aspect-square bg-stone/10 rounded-lg overflow-hidden group cursor-pointer"
            onClick={() => setLightbox(i)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={urlFor(photo)} alt={photo.filename} loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            {favoritesEnabled && (
              <button onClick={(e) => { e.stopPropagation(); toggleFavorite(photo.id) }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Heart className={`w-4 h-4 ${favorites.includes(photo.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </button>
            )}
          </div>
        ))}
      </div>

      {lightbox !== null && photos[lightbox] && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white"><X className="w-8 h-8" /></button>
          {lightbox > 0 && (
            <button className="absolute left-4 text-white/70 hover:text-white" onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1) }}>
              <ChevronLeft className="w-10 h-10" />
            </button>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={urlFor(photos[lightbox])} alt={photos[lightbox].filename}
            className="max-h-[90vh] max-w-[92vw] object-contain" onClick={(e) => e.stopPropagation()} />
          {lightbox < photos.length - 1 && (
            <button className="absolute right-4 text-white/70 hover:text-white" onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1) }}>
              <ChevronRight className="w-10 h-10" />
            </button>
          )}
        </div>
      )}
    </>
  )
}
