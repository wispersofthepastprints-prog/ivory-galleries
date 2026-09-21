'use client'

import { useState, useCallback } from 'react'
import { supabaseBrowser } from '@/src/lib/supabase'
import { Photo } from '@/src/types'

export function usePhotos() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const fetchPhotos = useCallback(async (galleryId: string) => {
    setIsLoading(true)
    const { data, error } = await supabaseBrowser
      .from('photos')
      .select('*')
      .eq('gallery_id', galleryId)
      .order('sort_order', { ascending: true })
    if (!error && data) {
      setPhotos(data as Photo[])
    }
    setIsLoading(false)
  }, [])

  const uploadPhoto = async (
    file: File,
    galleryId: string,
    photographerId: string
): Promise<Photo | null> => {
  // --- Validation before anything touches the network ---
  if (!file.type.startsWith('image/')) {
    throw new Error(`"${file.name}" is not an image file`)
  }
  const MAX_BYTES = 25 * 1024 * 1024 // 25MB
  if (file.size > MAX_BYTES) {
    throw new Error(`"${file.name}" is too large (max 25MB)`)
  }

  // --- Sanitise the filename ---
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${photographerId}/${galleryId}/${Date.now()}-${safeName}`

  setUploading(true)
  try {
    const { error: uploadError } = await supabaseBrowser.storage
      .from('photos')
      .upload(path, file, {
        cacheControl: '31536000',
        upsert: false,
      })
    if (uploadError) throw uploadError

    const { data: urlData } = supabaseBrowser.storage
      .from('photos')
      .getPublicUrl(path)

    const { data: photo, error: dbError } = await supabaseBrowser
      .from('photos')
      .insert({
        gallery_id: galleryId,
        photographer_id: photographerId,
        filename: file.name,
        original_url: urlData.publicUrl,
        display_url: urlData.publicUrl,
        thumbnail_url: urlData.publicUrl,
        file_size_bytes: file.size,
      })
      .select()
      .single()

    if (dbError) {
      await supabaseBrowser.storage.from('photos').remove([path])
      throw dbError
    }

    setPhotos(prev => [...prev, photo as Photo])
    return photo as Photo
  } finally {
    setUploading(false)
  }
}

  const deletePhoto = async (id: string) => {
    const photo = photos.find(p => p.id === id)
    const url = photo && (photo.original_url || photo.display_url)
    if (url) {
      const marker = '/object/public/photos/'
      const idx = url.indexOf(marker)
      if (idx >= 0) await supabaseBrowser.storage.from('photos').remove([url.slice(idx + marker.length)])
    }
    const { error } = await supabaseBrowser.from('photos').delete().eq('id', id)
    if (error) throw error
    setPhotos(prev => prev.filter(p => p.id !== id))
  }

  return { photos, isLoading, uploading, fetchPhotos, uploadPhoto, deletePhoto }
}