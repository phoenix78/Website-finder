'use client'

import { useState, useCallback } from 'react'
import type { VariantId, CategoryId } from '@/types/game'
import { useSurvival } from '@/hooks/useSurvival'
import { useT } from '@/i18n'
import { Timer } from '@/components/ui/Timer'
import { ShareScore } from '@/components/ui/ShareScore'
import { PhotoToName } from '@/components/variants/PhotoToName'
import { NameToPhoto } from '@/components/variants/NameToPhoto'
import { BodyPart } from '@/components/variants/BodyPart'
import { cn, formatScore } from '@/lib/utils'

const VARIANTS: { id: VariantId; icon: string; labelKey: string }[] = [
  { id: 'photo-to-name', icon: '📸', labelKey: 'variant.photo-to-name.label' },
  { id: 'name-to-photo', icon: '👤', labelKey: 'variant.name-to-photo.label' },
  { id: 'body-part',     icon: '🔍', labelKey: 'variant.body-part.label'     },
]

const CATEGORIES: { id: CategoryId; icon: string }[] = [
  { id: 'all',         icon: '🌍' },
  { id: 'actors',      icon: '🎬' },
  { id: 'musicians',   icon: '🎵' },
  { id: 'athletes',    icon: '🏆' },
  { id: 'politicians', icon: '🏛️' },
]

export function SurvivalShell() {
  const { t } = useT()
  const { state, startSurvival, submitAnswer, nextRound, timeExpired, reset, timeLimit } = useSurvival()

  const [selVariant,  setSelVariant]  = useState<VariantId>('photo-to-name')
  const [selCategory, setSelCategory] = useState<CategoryId>('all')

  const handleStart = useCallback(() => {
    startSurvival(selVariant, selCategory)
  }, [selVariant, selCategory, startSurvival])

  // ── Idle ───────────────────────────────────────────────────────────────────
  if (state.status === 'idle') {
    return (
      <div className="flex flex-col items-center gap-8 py-8 animate-fade-in max-w-lg mx-auto w-full">

        <div className="text-center">
          <div className="text-6xl mb-3">⚡</div>
          <h2 className="text-2xl font-black text-game-text">{t('survival.title')}</h2>
          <p className="text-game-muted mt-2 text-sm">{t('survival.subtitle')}</p>
        </div>

        {/* Rules */}
        <div className="w-full bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 flex flex-col gap-1.5">
          {['survival.rule1', 'survival.rule2', 'survival.rule3'].map((k) => (
            <p key={k} className="text-sm text-orange-500 font-medium flex items-center gap-2">
              <span>⚠️</span> {t(k)}
            </p>
          ))}
        </div>

        {/* Variant picker */}
        <div className="w-full">
          <p className="text-xs font-semibold text-game-muted uppercase tracking-widest mb-2">{t('home.step1')}</p>
          <div className="grid grid-cols-3 gap-2">
            {VARIANTS.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelVariant(v.id)}
                className={cn(
                  'flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-game-accent',
                  selVariant === v.id
                    ? 'border-game-accent bg-game-accent/10 text-game-accent'
                    : 'border-game-border bg-game-card text-game-text hover:border-game-accent/50'
                )}
              >
                <span className="text-xl">{v.icon}</span>
                <span className="text-xs text-center leading-tight">{t(v.labelKey)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category picker */}
        <div className="w-full">
          <p className="text-xs font-semibold text-game-muted uppercase tracking-widest mb-2">{t('home.step3')}</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelCategory(cat.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-game-accent',
                  selCategory === cat.id
                    ? 'border-game-accent bg-game-accent/10 text-game-accent'
                    : 'border-game-border bg-game-card text-game-text hover:border-game-accent/50'
                )}
              >
                <span>{cat.icon}</span>
                <span>{t(`category.${cat.id}`)}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleStart}
          className="px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white font-black text-xl rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl hover:shadow-orange-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          {t('survival.start')} ⚡
        </button>
      </div>
    )
  }

  // ── Dead ──────────────────────────────────────────────────────────────────
  if (state.status === 'dead') {
    const rounds = state.roundNumber - 1
    return (
      <div className="flex flex-col items-center gap-6 py-8 animate-fade-in max-w-lg mx-auto w-full">

        {/* Death screen */}
        <div className="text-center">
          <div className="text-7xl mb-3 animate-bounce">💀</div>
          <h2 className="text-3xl font-black text-game-text">{t('survival.game_over')}</h2>
          <p className="text-game-muted mt-1">{t('survival.survived', { n: String(rounds) })}</p>
        </div>

        {/* Stats card */}
        <div className="w-full bg-game-card border border-game-border rounded-2xl p-5 flex flex-col gap-4">
          <div className="text-center">
            <p className="text-game-muted text-sm">{t('result.final_score')}</p>
            <p className="text-5xl font-black text-game-text tabular-nums">{formatScore(state.score)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center text-sm">
            <div>
              <p className="text-game-muted text-xs">{t('survival.rounds_survived')}</p>
              <p className="font-black text-game-text text-2xl">⚡ {rounds}</p>
            </div>
            <div>
              <p className="text-game-muted text-xs">{t('result.best_streak')}</p>
              <p className="font-black text-game-text text-2xl">🔥 ×{state.maxStreak}</p>
            </div>
          </div>
        </div>

        {/* Wrong answer recap */}
        {state.lastAnswer && state.round && (
          <div className="w-full bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm">
            <p className="text-red-500 font-bold mb-1">{t('game.it_was')}:</p>
            <p className="text-game-text font-bold">{state.round.target.name}</p>
          </div>
        )}

        {/* Share */}
        {state.savedEntry && (
          <ShareScore entry={state.savedEntry} />
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={() => startSurvival(selVariant, selCategory)}
            className="flex-1 py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            {t('result.play_again')}
          </button>
          <button
            onClick={reset}
            className="flex-1 py-3 px-6 bg-game-card border-2 border-game-border text-game-text font-bold rounded-xl transition-all hover:border-game-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-game-accent"
          >
            {t('survival.change_config')}
          </button>
        </div>
      </div>
    )
  }

  // ── Playing / Feedback ────────────────────────────────────────────────────
  if (!state.round) return null

  const { round } = state
  const isFeedback = state.status === 'feedback'

  const variantProps = {
    round,
    difficulty: 'medium' as const,
    onAnswer: submitAnswer,
    disabled: isFeedback,
    correctSlug: isFeedback ? round.target.slug : undefined,
    chosenSlug: isFeedback ? state.lastAnswer?.chosenSlug : undefined,
  }

  const renderVariant = () => {
    switch (selVariant) {
      case 'name-to-photo': return <NameToPhoto {...variantProps} />
      case 'body-part':     return <BodyPart {...variantProps} />
      default:              return <PhotoToName {...variantProps} />
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-lg mx-auto">
      {/* Survival HUD */}
      <div className="flex items-center justify-between bg-orange-500/10 border border-orange-500/30 rounded-2xl px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-orange-500 font-black text-lg">⚡</span>
          <span className="font-bold text-game-text">{t('survival.round', { n: String(state.roundNumber) })}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {state.streak >= 2 && (
            <span className="font-bold text-orange-500">🔥 ×{state.streak}</span>
          )}
          <span className="font-black text-game-text tabular-nums">{formatScore(state.score)}</span>
        </div>
      </div>

      {/* Timer — only when playing */}
      {!isFeedback && (
        <Timer
          key={round.id}
          duration={timeLimit}
          onExpire={timeExpired}
          paused={isFeedback}
          danger
        />
      )}

      {/* Question */}
      <div key={round.id} className="min-h-[360px] flex items-start justify-center animate-slide-in">
        {renderVariant()}
      </div>

      {/* Feedback bar */}
      {isFeedback && state.lastAnswer && (
        <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-green-500 text-xl">✓</span>
            <span className="text-green-500 font-bold text-sm">{t('game.correct')}</span>
          </div>
          <button
            onClick={nextRound}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            {t('game.next_question')} →
          </button>
        </div>
      )}
    </div>
  )
}
