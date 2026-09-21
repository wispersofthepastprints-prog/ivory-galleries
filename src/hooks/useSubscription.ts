'use client'

import { useAuth } from './useAuth'
import { TIER_CONFIG } from '@/src/lib/stripe'

const FEATURE_MATRIX: Record<string, string[]> = {
  custom_branding: ['pro', 'studio', 'agency'],
  password_protection: ['pro', 'studio', 'agency'],
  client_favorites: ['pro', 'studio', 'agency'],
  unlimited_galleries: ['pro', 'studio', 'agency'],
  print_store: ['studio', 'agency'],
  album_builder: ['studio', 'agency'],
  ivoryos_sync: ['studio', 'agency'],
  white_label: ['agency'],
  multi_photographer: ['agency'],
}

export function useSubscription() {
  const { tier } = useAuth()

  const checkFeature = (feature: string): boolean => {
    const allowed = FEATURE_MATRIX[feature]
    if (!allowed) return true
    return allowed.includes(tier)
  }

  const getStorageLimit = (): number => {
    return TIER_CONFIG[tier as keyof typeof TIER_CONFIG]?.storageBytes || 5 * 1024 * 1024 * 1024
  }

  const getGalleryLimit = (): number => {
    return TIER_CONFIG[tier as keyof typeof TIER_CONFIG]?.galleries || 3
  }

  return { checkFeature, getStorageLimit, getGalleryLimit, tier }
}
