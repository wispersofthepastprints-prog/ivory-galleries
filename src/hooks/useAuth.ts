'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabaseBrowser } from '@/src/lib/supabase'
import { Photographer } from '@/src/types'

export function useAuth() {
  const [photographer, setPhotographer] = useState<Photographer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data: { user } } = await supabaseBrowser.auth.getUser()
    if (!user) {
      setPhotographer(null)
      setIsLoading(false)
      return
    }
    const { data } = await supabaseBrowser
      .from('photographers')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
    setPhotographer((data as Photographer | null) || null)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    let active = true
    const timers = new Set<number>()
    const scheduleRefresh = () => {
      const timer = window.setTimeout(() => {
        timers.delete(timer)
        if (active) void refresh()
      }, 0)
      timers.add(timer)
    }
    scheduleRefresh()
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(scheduleRefresh)
    return () => {
      active = false
      timers.forEach(timer => window.clearTimeout(timer))
      subscription.unsubscribe()
    }
  }, [refresh])

  const storedTier = photographer?.subscription_tier || 'free'
  const hasActivePlan = storedTier === 'free'
    ? photographer?.subscription_status !== 'unpaid'
    : ['active', 'trialing'].includes(photographer?.subscription_status || '')
  const tier = hasActivePlan ? storedTier : 'free'
  const isPro = tier === 'pro' || tier === 'studio' || tier === 'agency'
  const isStudio = tier === 'studio' || tier === 'agency'
  const isAgency = tier === 'agency'

  return {
    photographer,
    isLoading,
    isAuthenticated: !!photographer,
    tier,
    isPro,
    isStudio,
    isAgency,
    hasActivePlan,
    refresh,
  }
}
