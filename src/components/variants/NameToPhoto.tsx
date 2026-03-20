'use client'

import Image from 'next/image'
import type { GameRound, Difficulty } from '@/types/game'
import { cn } from '@/lib/utils'

interface NameToPhotoProps {
  round: GameRound
  difficulty: Difficulty
  onAnswer: (chosen: string) => void
  disabled: boolean
  correctSlug?: string
  chosenSlug?: string
}

export function NameToPhoto({
  round,
  onAnswer,
  disabled,
  correctSlug,
  chosenSlug,
}: NameToPhotoProps) {
  const getChoiceState = (slug: string) => {
    if (!disabled) return 'default'
    if (slug === correctSlug) return 'correct'
    if (slug === chosenSlug && slug !== correctSlug) return 'wrong'
    return 'default'
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full animate-slide-up">
      {/* Celebrity name to find */}
      <div className="text-center">
        <p className="text-game-muted text-sm mb-2">Trouvez la photo de</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-game-text">
          {round.target.name}
        </h2>
        {round.target.description && (
          <p className="text-game-muted text-sm mt-1">{round.target.description}</p>
        )}
      </div>

      {/* Photo grid */}
      <div
        className={cn(
          'grid gap-3 w-full',
          round.choices.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'
        )}
      >
        {round.choices.map((celebrity) => {
          const faceImage =
            celebrity.images.find((img) => img.type === 'face') ?? celebrity.images[0]
          const state = getChoiceState(celebrity.slug)

          return (
            <button
              key={celebrity.slug}
              onClick={() => !disabled && onAnswer(celebrity.slug)}
              disabled={disabled}
              aria-label={`Choisir cette photo`}
              aria-pressed={chosenSlug === celebrity.slug}
              className={cn(
                'relative aspect-square rounded-2xl overflow-hidden border-4 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-game-accent',
                state === 'correct' && 'border-green-500 scale-105 shadow-lg shadow-green-500/30',
                state === 'wrong' && 'border-red-500 animate-shake',
                state === 'default' &&
                  'border-game-border hover:border-game-accent active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed'
              )}
            >
              <Image
                src={faceImage.url}
                alt={faceImage.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 45vw, 200px"
              />
              {state === 'correct' && (
                <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                  <span className="text-3xl">✓</span>
                </div>
              )}
              {state === 'wrong' && (
                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                  <span className="text-3xl">✗</span>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
