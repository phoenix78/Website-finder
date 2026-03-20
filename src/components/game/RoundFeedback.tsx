'use client'

import type { UserAnswer, GameRound } from '@/types/game'
import { Button } from '@/components/ui/Button'
import { cn, formatScore } from '@/lib/utils'

interface RoundFeedbackProps {
  answer: UserAnswer
  round: GameRound
  isLastRound: boolean
  onNext: () => void
}

export function RoundFeedback({ answer, round, isLastRound, onNext }: RoundFeedbackProps) {
  return (
    <div className="flex flex-col items-center gap-5 animate-bounce-in w-full">
      {/* Result icon + message */}
      <div
        className={cn(
          'w-20 h-20 rounded-full flex items-center justify-center text-4xl',
          answer.correct
            ? 'bg-green-500/20 text-green-400'
            : 'bg-red-500/20 text-red-400'
        )}
        role="status"
        aria-label={answer.correct ? 'Bonne réponse' : 'Mauvaise réponse'}
      >
        {answer.correct ? '✓' : '✗'}
      </div>

      <div className="text-center">
        <p
          className={cn(
            'text-xl font-bold',
            answer.correct ? 'text-green-400' : 'text-red-400'
          )}
        >
          {answer.correct ? 'Bonne réponse !' : 'Raté !'}
        </p>
        <p className="text-game-muted text-sm mt-1">
          C&apos;était{' '}
          <span className="text-game-text font-semibold">{round.target.name}</span>
        </p>
        {round.target.description && (
          <p className="text-game-muted text-xs mt-0.5">{round.target.description}</p>
        )}
      </div>

      {/* Points earned */}
      {answer.correct && answer.pointsEarned > 0 && (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-2">
          <span className="text-green-400 font-bold text-lg">
            +{formatScore(answer.pointsEarned)} pts
          </span>
        </div>
      )}

      <Button onClick={onNext} size="lg" className="w-full max-w-xs">
        {isLastRound ? 'Voir les résultats' : 'Question suivante →'}
      </Button>
    </div>
  )
}
