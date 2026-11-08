'use client'

import { useState, useCallback } from 'react'
import { supabaseBrowser } from '@/src/lib/supabase'
import { Photo } from '@/src/types'
import { photoPathFromUrl, validatePhotoFile } from '@/src/lib/photo-upload'

async function signOwnedPhotos(photos: Photo[]) {
  if (photos.length === 0) return photos
  const response = await fetch('/api/photos/signed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ photoIds: photos.map(photo => photo.id) }),
  })
  if (!response.ok) throw new Error('Unable to prepare secure photo previews.')
  const data = await response.json() as { urls: Record<string, string> }
  return photos.map(photo => ({ ...photo, signed_url: data.urls[photo.id] }))
}

export function usePhotos() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const fetchPhotos = useCallback(async (galleryId: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabaseBrowser
        .from('photos')
        .select('*')
        .eq('gallery_id', galleryId)
        .order('sort_order', { ascending: true })
      if (error) throw error
      setPhotos(await signOwnedPhotos((data || []) as Photo[]))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const uploadPhoto = async (file: File, galleryId: string, photographerId: string): Promise<Photo> => {
    validatePhotoFile(file)
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${photographerId}/${galleryId}/${crypto.randomUUID()}-${safeName}`

    setUploading(true)
    try {
      const { error: uploadError } = await supabaseBrowser.storage
        .from('photos')
        .upload(path, file, { cacheControl: '31536000', upsert: false, contentType: file.type })
      if (uploadError) throw uploadError

      const { data: urlData } = supabaseBrowser.storage.from('photos').getPublicUrl(path)
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

      const [signedPhoto] = await signOwnedPhotos([photo as Photo])
      setPhotos(prev => [...prev, signedPhoto])
      return signedPhoto
    } finally {
      setUploading(false)
    }
  }

  const deletePhoto = async (id: string) => {
    const photo = photos.find(item => item.id === id)
    const path = photo ? photoPathFromUrl(photo.original_url || photo.display_url) : null
    if (path) {
      const { error: storageError } = await supabaseBrowser.storage.from('photos').remove([path])
      if (storageError) throw storageError
    }
    const { error } = await supabaseBrowser.from('photos').delete().eq('id', id)
    if (error) throw error
    setPhotos(prev => prev.filter(item => item.id !== id))
  }

  return { photos, isLoading, uploading, fetchPhotos, uploadPhoto, deletePhoto }
}
