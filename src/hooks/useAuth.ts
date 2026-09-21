'use client'

import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/src/lib/supabase'
import { Photographer } from '@/src/types'

export function useAuth() {
  const [photographer, setPhotographer] = useState<Photographer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabaseBrowser.auth.getSession()
      if (session?.user) {
        const { data } = await supabaseBrowser
          .from('photographers')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setPhotographer(data as Photographer)
      }
      setIsLoading(false)
    }
    getSession()

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data } = await supabaseBrowser
            .from('photographers')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setPhotographer(data as Photographer)
        } else {
          setPhotographer(null)
        }
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const tier = photographer?.subscription_tier || 'free'
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
  }
}
