'use client'

import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number   // 0–100
  max?: number
  label?: string
  variant?: 'default' | 'timer' | 'success'
  className?: string
  showLabel?: boolean
}

export function ProgressBar({
  value,
  max = 100,
  label,
  variant = 'default',
  className,
  showLabel = false,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))

  const trackColor = 'bg-game-card'
  const fillColor =
    variant === 'timer'
      ? pct > 50
        ? 'bg-green-500'
        : pct > 25
        ? 'bg-yellow-500'
        : 'bg-red-500'
      : variant === 'success'
      ? 'bg-game-success'
      : 'bg-game-accent'

  return (
    <div className={cn('w-full', className)}>
      {(label || showLabel) && (
        <div className="flex justify-between text-xs text-game-muted mb-1">
          {label && <span>{label}</span>}
          {showLabel && <span>{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        className={cn('w-full h-2 rounded-full overflow-hidden', trackColor)}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-300', fillColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
