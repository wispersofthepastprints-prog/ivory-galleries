'use client'

import { cn } from '@/src/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-fog">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-4 py-3 rounded-xl border border-stone/30 bg-white text-obsidian placeholder:text-fog/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all',
          error && 'border-red-400 focus:ring-red-400/50 focus:border-red-400',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
