'use client'

import { useId } from 'react'
import { cn } from '@/src/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, id: providedId, ...props }: InputProps) {
  const generatedId = useId()
  const id = providedId || generatedId
  const errorId = `${id}-error`

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-fog">
          {label}
        </label>
      )}
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'w-full px-4 py-3 rounded-xl border border-stone/30 bg-white text-obsidian placeholder:text-fog/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all',
          error && 'border-red-400 focus:ring-red-400/50 focus:border-red-400',
          className
        )}
        {...props}
      />
      {error && <p id={errorId} role="alert" className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
