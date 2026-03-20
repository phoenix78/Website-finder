'use client'

import { useT } from '@/i18n'
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
  const { t } = useT()

  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-game-muted">{t('game.round')}</span>
        <span className="font-bold text-game-text">{roundIndex + 1}</span>
        <span className="text-game-muted">{t('common.of')} {totalRounds}</span>
      </div>

      {streak >= 2 && (
        <div className="flex items-center gap-1 text-sm font-bold text-yellow-500 animate-bounce-in">
          <span>🔥</span>
          <span>×{streak}</span>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-game-muted">{t('game.score')}</span>
        <span className="font-bold text-game-text tabular-nums">{formatScore(score)}</span>
      </div>
    </div>
  )
}
