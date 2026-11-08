'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabaseBrowser } from '@/src/lib/supabase'
import { Gallery } from '@/src/types'
import { useAuth } from './useAuth'
import { trackEvent } from '@/src/components/Analytics'
import { photoPathFromUrl } from '@/src/lib/photo-upload'
import type { Json } from '@/src/lib/database.types'

export function useGallery() {
  const { photographer } = useAuth()
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchGalleries = useCallback(async () => {
    if (!photographer) return
    setIsLoading(true)
    const { data, error } = await supabaseBrowser
      .from('galleries')
      .select('*')
      .eq('photographer_id', photographer.id)
      .order('created_at', { ascending: false })
    if (!error && data) {
      setGalleries(data as unknown as Gallery[])
    }
    setIsLoading(false)
  }, [photographer])

  useEffect(() => {
    const timer = window.setTimeout(() => void fetchGalleries(), 0)
    return () => window.clearTimeout(timer)
  }, [fetchGalleries])

  const createGallery = async (gallery: Partial<Omit<Gallery, 'metadata' | 'photos' | 'photographer' | 'title' | 'slug' | 'password' | 'expires_at' | 'is_published'>> & Pick<Gallery, 'title' | 'slug'> & { metadata?: Json }) => {
    if (!photographer) return null
    const { data, error } = await supabaseBrowser
      .from('galleries')
      .insert({ ...gallery, photographer_id: photographer.id })
      .select()
      .single()
    if (error) throw new Error(error.message)
    trackEvent('gallery_created', '/dashboard/galleries/new')
    await fetchGalleries()
    return data as Gallery
  }

  const updateGallery = async (id: string, updates: Partial<Gallery>) => {
    const { error } = await supabaseBrowser
      .from('galleries')
      .update(updates)
      .eq('id', id)
    if (error) throw new Error(error.message)
    await fetchGalleries()
  }

  const deleteGallery = async (id: string) => {
    // Purge photo files from storage first (DB cascade removes rows only)
    const { data: photoRows } = await supabaseBrowser
      .from('photos')
      .select('original_url, display_url')
      .eq('gallery_id', id)
    const paths = (photoRows || [])
      .map(photo => photoPathFromUrl(photo.original_url || photo.display_url))
      .filter((path): path is string => Boolean(path))
    if (paths.length) {
      const { error: storageError } = await supabaseBrowser.storage.from('photos').remove(paths)
      if (storageError) throw new Error(storageError.message)
    }
    const { error } = await supabaseBrowser
      .from('galleries')
      .delete()
      .eq('id', id)
    if (error) throw new Error(error.message)
    await fetchGalleries()
  }

  return { galleries, isLoading, createGallery, updateGallery, deleteGallery, refresh: fetchGalleries }
}
