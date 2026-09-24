'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabaseBrowser } from '@/src/lib/supabase'
import { Gallery } from '@/src/types'
import { useAuth } from './useAuth'

export function useGallery() {
  const { photographer } = useAuth()
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchGalleries = useCallback(async () => {
    if (!photographer) return
    setIsLoading(true)
    const { data, error } = await supabaseBrowser
      .from('galleries')
      .select('*, photos(count)')
      .eq('photographer_id', photographer.id)
      .order('created_at', { ascending: false })
    if (!error && data) {
      setGalleries(data as Gallery[])
    }
    setIsLoading(false)
  }, [photographer])

  useEffect(() => {
    fetchGalleries()
  }, [fetchGalleries])

  const createGallery = async (gallery: Partial<Gallery>) => {
    if (!photographer) return null
    const { data, error } = await supabaseBrowser
      .from('galleries')
      .insert({ ...gallery, photographer_id: photographer.id })
      .select()
      .single()
    if (error) throw error
    await fetchGalleries()
    return data as Gallery
  }

  const updateGallery = async (id: string, updates: Partial<Gallery>) => {
    const { error } = await supabaseBrowser
      .from('galleries')
      .update(updates)
      .eq('id', id)
    if (error) throw error
    await fetchGalleries()
  }

  const deleteGallery = async (id: string) => {
    // Purge photo files from storage first (DB cascade removes rows only)
    const { data: photoRows } = await supabaseBrowser
      .from('photos')
      .select('original_url, display_url')
      .eq('gallery_id', id)
    const marker = '/object/public/photos/'
    const paths = (photoRows || [])
      .map((p: any) => {
        const url: string | null = p.original_url || p.display_url
        const idx = url ? url.indexOf(marker) : -1
        return idx >= 0 ? url!.slice(idx + marker.length) : null
      })
      .filter(Boolean) as string[]
    if (paths.length) {
      await supabaseBrowser.storage.from('photos').remove(paths)
    }
    const { error } = await supabaseBrowser
      .from('galleries')
      .delete()
      .eq('id', id)
    if (error) throw error
    await fetchGalleries()
  }

  return { galleries, isLoading, createGallery, updateGallery, deleteGallery, refresh: fetchGalleries }
}
