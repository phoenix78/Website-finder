'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import type { GameSession } from '@/types/game'
import { getGameGrade } from '@/engine/scoreEngine'
import { saveScore } from '@/lib/leaderboard'
import type { LeaderboardEntry } from '@/lib/leaderboard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ShareScore } from '@/components/ui/ShareScore'
import { Leaderboard } from '@/components/ui/Leaderboard'
import { useT } from '@/i18n'
import { formatScore, formatPercent, cn } from '@/lib/utils'

interface ResultScreenProps {
  session: GameSession
  onPlayAgain: () => void
}

export function ResultScreen({ session, onPlayAgain }: ResultScreenProps) {
  const { t } = useT()
  const { data: authSession } = useSession()
  const correct = session.answers.filter((a) => a.correct).length
  const total   = session.answers.length
  const grade   = getGameGrade(correct, total)
  const avgTime = total > 0 ? session.answers.reduce((s, a) => s + a.timeUsed, 0) / total : 0

  // Save to leaderboard exactly once per result screen mount
  const savedRef = useRef<LeaderboardEntry | null>(null)
  useEffect(() => {
    if (!savedRef.current) {
      // Always save to localStorage (guests + logged-in users)
      savedRef.current = saveScore({
        score: session.score,
        grade: grade.letter,
        variant: session.variant,
        difficulty: session.difficulty,
        correct,
        total,
        maxStreak: session.maxStreak,
        mode: 'classic',
      })

      // Also save to database if authenticated
      if (authSession?.user?.id) {
        fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: session.score,
            grade: grade.letter,
            variant: session.variant,
            difficulty: session.difficulty,
            category: session.category,
            correct,
            total,
            maxStreak: session.maxStreak,
            avgTime,
            mode: 'classic',
          }),
        }).catch(() => {/* non-blocking */})
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [showLeaderboard, setShowLeaderboard] = useState(false)

  return (
    <div className="flex flex-col items-center gap-8 animate-fade-in w-full max-w-lg mx-auto">

      {/* Grade */}
      <div className="flex flex-col items-center gap-3 animate-pop-in">
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
                'aspect-square rounded-lg flex items-center justify-center text-sm font-bold border animate-pop-in',
                a.correct
                  ? 'bg-green-500/20 border-green-500/40 text-green-500'
                  : 'bg-red-500/20 border-red-500/40 text-red-500'
              )}
              style={{ animationDelay: `${i * 40}ms` }}
              title={`${i + 1}: ${a.correct ? '✓' : '✗'} (${a.pointsEarned} pts)`}
            >
              {a.correct ? '✓' : '✗'}
            </div>
          ))}
        </div>
      </div>

      {/* Share + leaderboard */}
      <div className="flex flex-wrap gap-3 justify-center w-full">
        {savedRef.current && <ShareScore entry={savedRef.current} />}
        <button
          onClick={() => setShowLeaderboard(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-game-border bg-game-card hover:border-game-accent/60 text-game-text font-semibold text-sm transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-game-accent"
        >
          🏆 {t('leaderboard.title')}
        </button>
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

      {showLeaderboard && (
        <Leaderboard
          onClose={() => setShowLeaderboard(false)}
          highlightId={savedRef.current?.id}
        />
      )}
    </div>
  )
}
