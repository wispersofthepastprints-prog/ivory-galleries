'use client'

import { cn } from '@/src/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  children?: React.ReactNode
}

export function Card({ padding = 'md', children, className, ...props }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  }

  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-stone/10 shadow-sm',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
