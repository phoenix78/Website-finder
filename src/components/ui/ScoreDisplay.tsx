'use client'

import { cn, formatScore } from '@/lib/utils'

interface ScoreDisplayProps {
  score: number
  streak: number
  roundIndex: number
  totalRounds: number
  className?: string
}

export function ScoreDisplay({
  score,
  streak,
  roundIndex,
  totalRounds,
  className,
}: ScoreDisplayProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      {/* Round counter */}
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-game-muted">Manche</span>
        <span className="font-bold text-game-text">
          {roundIndex + 1}
        </span>
        <span className="text-game-muted">/ {totalRounds}</span>
      </div>

      {/* Streak */}
      {streak >= 2 && (
        <div className="flex items-center gap-1 text-sm font-bold text-yellow-400 animate-bounce-in">
          <span>🔥</span>
          <span>×{streak}</span>
        </div>
      )}

      {/* Score */}
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-game-muted">Score</span>
        <span className="font-bold text-game-text tabular-nums">
          {formatScore(score)}
        </span>
      </div>
    </div>
  )
}
