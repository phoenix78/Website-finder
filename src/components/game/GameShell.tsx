'use client'

import { useCallback } from 'react'
import type { VariantId, Difficulty, CategoryId } from '@/types/game'
import { useGame } from '@/hooks/useGame'
import { useT } from '@/i18n'
import { Timer } from '@/components/ui/Timer'
import { ScoreDisplay } from '@/components/ui/ScoreDisplay'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { RoundFeedback } from './RoundFeedback'
import { ResultScreen } from './ResultScreen'
import { PhotoToName } from '@/components/variants/PhotoToName'
import { NameToPhoto } from '@/components/variants/NameToPhoto'
import { BodyPart } from '@/components/variants/BodyPart'

interface GameShellProps {
  variant: VariantId
  difficulty: Difficulty
  category: CategoryId
}

export function GameShell({ variant, difficulty, category }: GameShellProps) {
  const { state, startGame, submitAnswer, nextRound, timeExpired, resetGame } = useGame()
  const { t } = useT()

  const handleStart = useCallback(() => {
    startGame(variant, difficulty, category)
  }, [variant, difficulty, category, startGame])

  // ── Idle ──────────────────────────────────────────────────────────────────
  if (state.status === 'idle') {
    return (
      <div className="flex flex-col items-center gap-6 py-12 animate-fade-in">
        <div className="text-6xl">🎭</div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-game-text">{t('game.ready_title')}</h2>
          <p className="text-game-muted mt-2">{t('game.ready_subtitle')}</p>
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

  // ── Complete ───────────────────────────────────────────────────────────────
  if (state.status === 'complete' && state.session) {
    return (
      <ResultScreen
        session={state.session}
        onPlayAgain={() => {
          resetGame()
          setTimeout(() => startGame(variant, difficulty, category), 50)
        }}
      />
    )
  }

  if (!state.session) return null

  const { session } = state
  const round = session.rounds[session.currentRoundIndex]
  const isFeedback = state.status === 'feedback'
  const isLastRound = session.currentRoundIndex === session.rounds.length - 1

  const variantProps = {
    round,
    difficulty: session.difficulty,
    onAnswer: submitAnswer,
    disabled: isFeedback,
    correctSlug: isFeedback ? round.target.slug : undefined,
    chosenSlug: isFeedback ? state.lastAnswer?.chosenSlug : undefined,
  }

  const renderVariant = () => {
    switch (session.variant) {
      case 'name-to-photo': return <NameToPhoto {...variantProps} />
      case 'body-part':     return <BodyPart {...variantProps} />
      default:              return <PhotoToName {...variantProps} />
    }
  }

  return (
    <div className="flex flex-col gap-5 w-full max-w-lg mx-auto">
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

      <div className="min-h-[360px] flex items-start justify-center">
        {renderVariant()}
      </div>

      {isFeedback && state.lastAnswer && (
        <div className="mt-2">
          <RoundFeedback
            answer={state.lastAnswer}
            round={round}
            isLastRound={isLastRound}
            onNext={nextRound}
          />
        </div>
      )}
    </div>
  )
}
