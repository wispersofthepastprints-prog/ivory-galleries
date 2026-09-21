'use client'

import { useCallback } from 'react'
import { supabaseBrowser } from '@/src/lib/supabase'

export function useIvoryOS() {
  const syncEvent = useCallback(async (eventId: string) => {
    const { error } = await supabaseBrowser.functions.invoke('sync-ivoryos', {
      body: { eventId },
    })
    if (error) throw error
  }, [])

  const fetchEvents = useCallback(async (photographerId: string) => {
    const { data, error } = await supabaseBrowser
      .from('ivoryos_events')
      .select('*')
      .eq('photographer_id', photographerId)
      .order('start_time', { ascending: true })
    if (error) throw error
    return data || []
  }, [])

  return { syncEvent, fetchEvents }
}
