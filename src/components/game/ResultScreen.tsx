'use client'

import Link from 'next/link'
import type { GameSession } from '@/types/game'
import { getGameGrade } from '@/engine/scoreEngine'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useT } from '@/i18n'
import { formatScore, formatPercent, cn } from '@/lib/utils'

interface ResultScreenProps {
  session: GameSession
  onPlayAgain: () => void
}

export function ResultScreen({ session, onPlayAgain }: ResultScreenProps) {
  const { t } = useT()
  const correct = session.answers.filter((a) => a.correct).length
  const total = session.answers.length
  const grade = getGameGrade(correct, total)
  const avgTime = total > 0 ? session.answers.reduce((s, a) => s + a.timeUsed, 0) / total : 0

  return (
    <div className="flex flex-col items-center gap-8 animate-fade-in w-full max-w-lg mx-auto">

      {/* Grade */}
      <div className="flex flex-col items-center gap-3">
        <div
          className={cn(
            'w-24 h-24 rounded-3xl flex items-center justify-center text-5xl font-black border-4',
            correct / total >= 0.8
              ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
              : 'border-game-accent bg-game-accent/10 text-game-accent'
          )}
        >
          {grade.letter}
        </div>
        <p className={cn('text-xl font-bold', grade.color)}>
          {t(`result.grades.${grade.letter}`)}
        </p>
      </div>

      {/* Score summary */}
      <div className="w-full bg-game-card border border-game-border rounded-2xl p-6 flex flex-col gap-4">
        <div className="text-center">
          <p className="text-game-muted text-sm">{t('result.final_score')}</p>
          <p className="text-4xl font-black text-game-text tabular-nums">{formatScore(session.score)}</p>
        </div>

        <ProgressBar
          value={correct}
          max={total}
          variant="success"
          label={t('result.correct_answers', { correct: String(correct), total: String(total) })}
          showLabel
        />

        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <div>
            <p className="text-game-muted text-xs">{t('result.accuracy')}</p>
            <p className="font-bold text-game-text">{formatPercent(correct, total)}</p>
          </div>
          <div>
            <p className="text-game-muted text-xs">{t('result.best_streak')}</p>
            <p className="font-bold text-game-text">🔥 ×{session.maxStreak}</p>
          </div>
          <div>
            <p className="text-game-muted text-xs">{t('result.avg_time')}</p>
            <p className="font-bold text-game-text">{avgTime.toFixed(1)}s</p>
          </div>
        </div>
      </div>

      {/* Config badges */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Badge variant="info">{t(`variant.${session.variant}.label`)}</Badge>
        <Badge variant={session.difficulty as 'easy' | 'medium' | 'expert'}>
          {t(`difficulty.${session.difficulty}.label`)}
        </Badge>
      </div>

      {/* Per-round recap */}
      <div className="w-full flex flex-col gap-2">
        <p className="text-sm text-game-muted font-medium">{t('result.round_recap')}</p>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
          {session.answers.map((a, i) => (
            <div
              key={a.roundId}
              className={cn(
                'aspect-square rounded-lg flex items-center justify-center text-sm font-bold border',
                a.correct
                  ? 'bg-green-500/20 border-green-500/40 text-green-500'
                  : 'bg-red-500/20 border-red-500/40 text-red-500'
              )}
              title={`${i + 1}: ${a.correct ? '✓' : '✗'} (${a.pointsEarned} pts)`}
            >
              {a.correct ? '✓' : '✗'}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Button onClick={onPlayAgain} size="lg" className="flex-1">
          {t('result.play_again')}
        </Button>
        <Link href="/" className="flex-1">
          <Button variant="secondary" size="lg" className="w-full">
            {t('result.change_mode')}
          </Button>
        </Link>
      </div>
    </div>
  )
}
