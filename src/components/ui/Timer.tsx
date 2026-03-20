'use client'

import { useEffect, useRef, useState } from 'react'
import { ProgressBar } from './ProgressBar'
import { cn } from '@/lib/utils'

interface TimerProps {
  duration: number          // total seconds
  onExpire: () => void
  paused?: boolean
  danger?: boolean          // survival mode — always red
  className?: string
}

export function Timer({ duration, onExpire, paused = false, danger = false, className }: TimerProps) {
  const [remaining, setRemaining] = useState(duration)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const expiredRef = useRef(false)

  useEffect(() => {
    setRemaining(duration)
    expiredRef.current = false
  }, [duration])

  useEffect(() => {
    if (paused) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 0.1
        if (next <= 0 && !expiredRef.current) {
          expiredRef.current = true
          clearInterval(intervalRef.current!)
          onExpire()
          return 0
        }
        return next
      })
    }, 100)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [paused, onExpire])

  const urgent = danger || remaining <= duration * 0.25

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span
        className={cn(
          'text-sm font-mono font-bold w-8 text-right transition-colors',
          urgent ? 'text-red-400' : 'text-game-text'
        )}
        aria-live="polite"
        aria-label={`Temps restant: ${Math.ceil(remaining)} secondes`}
      >
        {Math.ceil(remaining)}s
      </span>
      <ProgressBar
        value={remaining}
        max={duration}
        variant="timer"
        className="flex-1"
      />
    </div>
  )
}
