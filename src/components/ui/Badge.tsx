import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'easy' | 'medium' | 'expert' | 'success' | 'error' | 'info'
  className?: string
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-game-card text-game-muted border border-game-border',
  easy: 'bg-green-500/20 text-green-400 border border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  expert: 'bg-red-500/20 text-red-400 border border-red-500/30',
  success: 'bg-green-500/20 text-green-400 border border-green-500/30',
  error: 'bg-red-500/20 text-red-400 border border-red-500/30',
  info: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
