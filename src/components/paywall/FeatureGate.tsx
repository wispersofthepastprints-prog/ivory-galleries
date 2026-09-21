'use client'

import { useSubscription } from '@/src/hooks/useSubscription'
import { Lock, ArrowUpRight } from 'lucide-react'
import { Button } from '@/src/components/ui/Button'

interface FeatureGateProps {
  feature: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { checkFeature } = useSubscription()
  const hasAccess = checkFeature(feature)

  if (hasAccess) return <>{children}</>
  if (fallback) return <>{fallback}</>

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-2xl border border-stone/10">
      <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mb-4">
        <Lock className="w-8 h-8 text-gold" />
      </div>
      <h3 className="text-xl font-bold text-obsidian mb-2">Upgrade to Unlock</h3>
      <p className="text-fog max-w-sm mb-6">
        This feature is available on a higher plan. Upgrade to access it and grow your studio.
      </p>
      <Button
        onClick={() => (window.location.href = `/dashboard/settings?tab=billing&upgrade=${feature}`)}
      >
        Upgrade Plan <ArrowUpRight className="w-4 h-4" />
      </Button>
    </div>
  )
}
