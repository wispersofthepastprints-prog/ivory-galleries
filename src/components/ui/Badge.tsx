'use client'

import { cn } from '@/src/lib/utils'

interface BadgeProps {
  text: string
  variant?: 'default' | 'success' | 'warning' | 'gold' | 'pro' | 'studio' | 'agency'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ text, variant = 'default', size = 'md', className }: BadgeProps) {
  const variants = {
    default: 'bg-stone/10 text-fog',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
    gold: 'bg-gold/10 text-gold border-gold/20',
    pro: 'bg-blue-50 text-blue-700',
    studio: 'bg-purple-50 text-purple-700',
    agency: 'bg-obsidian text-ivory',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg font-bold uppercase tracking-wider border',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {text}
    </span>
  )
}
