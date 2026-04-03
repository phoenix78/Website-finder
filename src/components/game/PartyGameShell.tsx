'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { Celebrity, GameSession, VariantId, Difficulty } from '@/types/game'
import { usePartyGame } from '@/hooks/usePartyGame'
import { getGameGrade } from '@/engine/scoreEngine'
import { useT } from '@/i18n'
import { Timer } from '@/components/ui/Timer'
import { ScoreDisplay } from '@/components/ui/ScoreDisplay'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { RoundFeedback } from './RoundFeedback'
import { PhotoToName } from '@/components/variants/PhotoToName'
import { NameToPhoto } from '@/components/variants/NameToPhoto'
import { cn, formatScore, formatPercent } from '@/lib/utils'
import { VARIANT_MAP, DIFF_MAP } from '@/lib/party'
import type { PartyConfig } from '@/types/party'

// ── Animated question wrapper ────────────────────────────────────────────────
function AnimatedQuestion({
  roundId,
  isWrong,
  children,
}: {
  roundId: string
  isWrong: boolean
  children: React.ReactNode
}) {
  const [animClass, setAnimClass] = useState('animate-slide-in')
  const prevId = useRef(roundId)

  useEffect(() => {
    if (roundId !== prevId.current) {
      prevId.current = roundId
      setAnimClass('animate-slide-in')
    }
  }, [roundId])

  useEffect(() => {
    if (isWrong) {
      setAnimClass('animate-shake')
      const t = setTimeout(() => setAnimClass(''), 420)
      return () => clearTimeout(t)
    }
  }, [isWrong])

  return <div key={roundId} className={`w-full ${animClass}`}>{children}</div>
}

// ── Party result screen (no leaderboard save) ────────────────────────────────
function PartyResultScreen({
  session,
  title,
  onPlayAgain,
}: {
  session: GameSession
  title?: string
  onPlayAgain: () => void
}) {
  const { t } = useT()
  const correct = session.answers.filter((a) => a.correct).length
  const total   = session.answers.length
  const grade   = getGameGrade(correct, total)
  const avgTime = total > 0 ? session.answers.reduce((s, a) => s + a.timeUsed, 0) / total : 0

  return (
    <div className="flex flex-col items-center gap-8 animate-fade-in w-full max-w-lg mx-auto">

      {title && (
        <p className="text-game-muted text-sm font-medium">
          🔒 {title}
        </p>
      )}

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

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Button onClick={onPlayAgain} size="lg" className="flex-1">
          {t('result.play_again')}
        </Button>
        <Link href="/create" className="flex-1">
          <Button variant="secondary" size="lg" className="w-full">
            {t('party.create_your_own')}
          </Button>
        </Link>
      </div>
    </div>
  )
}

// ── Main PartyGameShell ───────────────────────────────────────────────────────

interface PartyGameShellProps {
  config: PartyConfig
  pool: Celebrity[]
}

export function PartyGameShell({ config, pool }: PartyGameShellProps) {
  const { state, startGame, submitAnswer, nextRound, timeExpired, resetGame } = usePartyGame(pool)
  const { t } = useT()

  const variant: VariantId   = VARIANT_MAP[config.v]
  const difficulty: Difficulty = DIFF_MAP[config.d]

  const handleStart = useCallback(() => {
    startGame(variant, difficulty)
  }, [variant, difficulty, startGame])

  // ── Idle ────────────────────────────────────────────────────────────────────
  if (state.status === 'idle') {
    return (
      <div className="flex flex-col items-center gap-6 py-12 animate-fade-in">
        {config.t && (
          <p className="text-game-muted text-sm font-medium">🔒 {config.t}</p>
        )}
        <div className="text-6xl">🎭</div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-game-text">
            {t('party.party_title')}
          </h2>
          <p className="text-game-muted mt-2">
            {pool.length} {t('party.people')} · {t(`difficulty.${difficulty}.label`)} · {t(`variant.${variant}.label`)}
          </p>
        </div>

        {/* Preview of participants */}
        <div className="flex flex-wrap gap-2 justify-center max-w-sm">
          {pool.slice(0, 8).map((p) => (
            <span
              key={p.slug}
              className="px-3 py-1 rounded-full bg-game-card border border-game-border text-game-text text-sm"
            >
              {p.name}
            </span>
          ))}
          {pool.length > 8 && (
            <span className="px-3 py-1 rounded-full bg-game-card border border-game-border text-game-muted text-sm">
              +{pool.length - 8}
            </span>
          )}
        </div>

        <button
          onClick={handleStart}
          className="px-8 py-4 bg-game-accent hover:bg-game-accent-hover text-white font-bold text-lg rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-indigo-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-game-accent"
        >
          {t('game.start')}
        </button>
      </div>
    )
  }

  // ── Complete ─────────────────────────────────────────────────────────────────
  if (state.status === 'complete' && state.session) {
    return (
      <PartyResultScreen
        session={state.session}
        title={config.t}
        onPlayAgain={() => {
          resetGame()
          setTimeout(() => startGame(variant, difficulty), 50)
        }}
      />
    )
  }

  if (!state.session) return null

  const { session } = state
  const round       = session.rounds[session.currentRoundIndex]
  const isFeedback  = state.status === 'feedback'
  const isLastRound = session.currentRoundIndex === session.rounds.length - 1
  const isWrong     = isFeedback && state.lastAnswer?.correct === false

  const variantProps = {
    round,
    difficulty: session.difficulty,
    onAnswer: submitAnswer,
    disabled: isFeedback,
    correctSlug: isFeedback ? round.target.slug : undefined,
    chosenSlug: isFeedback ? state.lastAnswer?.chosenSlug : undefined,
  }

  return (
    <div className="flex flex-col gap-5 w-full max-w-3xl mx-auto">
      {config.t && (
        <p className="text-center text-game-muted text-xs font-medium">🔒 {config.t}</p>
      )}

      <ScoreDisplay
        score={session.score}
        streak={session.streak}
        roundIndex={session.currentRoundIndex}
        totalRounds={session.rounds.length}
      />

      <ProgressBar
        value={session.currentRoundIndex + (isFeedback ? 1 : 0)}
        max={session.rounds.length}
        label={t('game.progress')}
      />

      {!isFeedback && (
        <Timer
          key={round.id}
          duration={round.timeLimit}
          onExpire={timeExpired}
          paused={isFeedback}
        />
      )}

      <div className="min-h-[480px] flex items-start justify-center w-full">
        <AnimatedQuestion roundId={round.id} isWrong={isWrong}>
          {session.variant === 'name-to-photo'
            ? <NameToPhoto {...variantProps} />
            : <PhotoToName {...variantProps} />
          }
        </AnimatedQuestion>
      </div>

      {isFeedback && state.lastAnswer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-game-card border border-game-border rounded-3xl p-6 shadow-2xl">
            <RoundFeedback
              answer={state.lastAnswer}
              round={round}
              isLastRound={isLastRound}
              onNext={nextRound}
            />
          </div>
        </div>
      )}
    </div>
  )
}
