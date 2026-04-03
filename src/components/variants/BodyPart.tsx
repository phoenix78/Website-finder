'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { GameRound, Difficulty } from '@/types/game'
import { Button } from '@/components/ui/Button'
import { useT } from '@/i18n'
import { cn } from '@/lib/utils'

interface BodyPartProps {
  round: GameRound
  difficulty: Difficulty
  onAnswer: (chosen: string) => void
  disabled: boolean
  correctSlug?: string
  chosenSlug?: string
}

export function BodyPart({
  round,
  difficulty,
  onAnswer,
  disabled,
  correctSlug,
  chosenSlug,
}: BodyPartProps) {
  const { t } = useT()
  const [inputValue, setInputValue] = useState('')

  const bodyPartKey = `game.body_parts.${round.targetImage.bodyPart ?? 'eyes'}`
  const bodyPartLabel = t(bodyPartKey)
  const questionLabel = t('game.whose_part', { part: bodyPartLabel })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !disabled) {
      onAnswer(inputValue.trim())
    }
  }

  const getChoiceState = (slug: string) => {
    if (!disabled) return 'default'
    if (slug === correctSlug) return 'correct'
    if (slug === chosenSlug && slug !== correctSlug) return 'wrong'
    return 'default'
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full animate-slide-up">
      <div className="relative w-80 h-60 sm:w-96 sm:h-72 rounded-2xl overflow-hidden border-2 border-game-border shadow-2xl">
        <Image
          src={round.targetImage.url}
          alt={round.targetImage.alt}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 640px) 320px, 384px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-game-bg/30 via-transparent to-transparent pointer-events-none" />
      </div>

      <p className="text-game-muted text-sm font-medium text-center">
        {questionLabel}
      </p>

      {difficulty === 'expert' ? (
        <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={disabled}
            placeholder={t('game.type_name')}
            autoFocus
            className="w-full bg-game-card border border-game-border rounded-xl px-4 py-3 text-game-text placeholder:text-game-muted text-base focus:outline-none focus:ring-2 focus:ring-game-accent focus:border-transparent transition disabled:opacity-60"
            aria-label={t('game.type_name')}
          />
          <Button type="submit" disabled={!inputValue.trim() || disabled} size="lg" className="w-full">
            {t('common.validate')}
          </Button>
        </form>
      ) : (
        <div className="grid grid-cols-2 gap-3 w-full">
          {round.choices.map((celebrity) => {
            const state = getChoiceState(celebrity.slug)
            return (
              <button
                key={celebrity.slug}
                onClick={() => !disabled && onAnswer(celebrity.slug)}
                disabled={disabled}
                aria-pressed={chosenSlug === celebrity.slug}
                className={cn(
                  'px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-game-accent',
                  state === 'correct' && 'bg-green-500/20 border-green-500 text-green-500 scale-105',
                  state === 'wrong'   && 'bg-red-500/20 border-red-500 text-red-500 animate-shake',
                  state === 'default' && 'bg-game-card border-game-border text-game-text hover:border-game-accent hover:bg-game-accent/10 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed'
                )}
              >
                {celebrity.name}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
