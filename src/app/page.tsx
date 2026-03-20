'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { VariantId, Difficulty, CategoryId } from '@/types/game'
import { GameRegistry } from '@/game-registry'
import { getCategoryCounts } from '@/data'
import { Badge } from '@/components/ui/Badge'
import { Leaderboard } from '@/components/ui/Leaderboard'
import { useT } from '@/i18n'
import { cn } from '@/lib/utils'

const DIFFICULTIES: { id: Difficulty; color: string }[] = [
  { id: 'easy',   color: 'border-green-500 text-green-500' },
  { id: 'medium', color: 'border-yellow-500 text-yellow-500' },
  { id: 'expert', color: 'border-red-500 text-red-500' },
]

const CATEGORIES: { id: CategoryId; icon: string }[] = [
  { id: 'all',         icon: '🌍' },
  { id: 'actors',      icon: '🎬' },
  { id: 'musicians',   icon: '🎵' },
  { id: 'athletes',    icon: '🏆' },
  { id: 'politicians', icon: '🏛️' },
]

export default function HomePage() {
  const router = useRouter()
  const { t } = useT()
  const variants = GameRegistry.all()
  const counts = getCategoryCounts()

  const [selectedVariant,    setSelectedVariant]    = useState<VariantId>('photo-to-name')
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy')
  const [selectedCategory,   setSelectedCategory]   = useState<CategoryId>('all')
  const [showLeaderboard,    setShowLeaderboard]    = useState(false)

  const activeVariant = GameRegistry.get(selectedVariant)

  const handlePlay = () => {
    const diff = activeVariant.supportedDifficulties.includes(selectedDifficulty)
      ? selectedDifficulty
      : activeVariant.supportedDifficulties[0]
    router.push(`/play/${selectedVariant}/${diff}?category=${selectedCategory}`)
  }

  return (
    <div className="flex flex-col gap-10 animate-fade-in">

      {/* Hero */}
      <section className="text-center py-4">
        <div className="text-6xl mb-4" aria-hidden="true">🎭</div>
        <h1 className="text-3xl sm:text-4xl font-black text-gradient mb-3">
          Celebrity Quiz
        </h1>
        <p className="text-game-muted max-w-md mx-auto text-base">
          {t('home.hero_subtitle')}
        </p>
      </section>

      {/* Step 1 — Variant */}
      <section aria-labelledby="variant-heading">
        <h2 id="variant-heading" className="text-sm font-semibold text-game-muted uppercase tracking-widest mb-3">
          {t('home.step1')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {variants.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVariant(v.id)}
              aria-pressed={selectedVariant === v.id}
              className={cn(
                'flex flex-col gap-2 p-4 rounded-2xl border-2 text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-game-accent',
                selectedVariant === v.id
                  ? 'border-game-accent bg-game-accent/10 shadow-lg shadow-indigo-500/10'
                  : 'border-game-border bg-game-card hover:border-game-accent/50'
              )}
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{v.icon}</span>
                {selectedVariant === v.id && <span className="text-game-accent text-lg">✓</span>}
              </div>
              <div>
                <p className="font-bold text-game-text text-base">{t(`variant.${v.id}.label`)}</p>
                <p className="text-game-muted text-sm mt-0.5">{t(`variant.${v.id}.description`)}</p>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {v.supportedDifficulties.map((d) => (
                  <Badge key={d} variant={d}>{t(`difficulty.${d}.label`)}</Badge>
                ))}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Step 2 — Difficulty */}
      <section aria-labelledby="difficulty-heading">
        <h2 id="difficulty-heading" className="text-sm font-semibold text-game-muted uppercase tracking-widest mb-3">
          {t('home.step2')}
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {DIFFICULTIES.map((d) => {
            const available = activeVariant.supportedDifficulties.includes(d.id)
            return (
              <button
                key={d.id}
                onClick={() => available && setSelectedDifficulty(d.id)}
                aria-pressed={selectedDifficulty === d.id}
                disabled={!available}
                className={cn(
                  'flex flex-col items-center gap-1 p-3 sm:p-4 rounded-2xl border-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-game-accent disabled:opacity-40 disabled:cursor-not-allowed',
                  selectedDifficulty === d.id && available
                    ? `${d.color} bg-game-card shadow-lg`
                    : 'border-game-border bg-game-card hover:border-game-accent/50 text-game-text'
                )}
              >
                <span className="font-bold text-sm sm:text-base">{t(`difficulty.${d.id}.label`)}</span>
                <span className="text-xs text-game-muted">{t(`difficulty.${d.id}.desc`)}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Step 3 — Category */}
      <section aria-labelledby="category-heading">
        <h2 id="category-heading" className="text-sm font-semibold text-game-muted uppercase tracking-widest mb-3">
          {t('home.step3')}
        </h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              aria-pressed={selectedCategory === cat.id}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-game-accent',
                selectedCategory === cat.id
                  ? 'border-game-accent bg-game-accent/10 text-game-accent'
                  : 'border-game-border bg-game-card text-game-text hover:border-game-accent/50'
              )}
            >
              <span aria-hidden="true">{cat.icon}</span>
              <span>{t(`category.${cat.id}`)}</span>
              <span className="text-game-muted text-xs">({counts[cat.id] ?? 0})</span>
            </button>
          ))}
        </div>
      </section>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pb-2">
        <button
          onClick={handlePlay}
          className="w-full sm:w-auto px-10 py-4 bg-game-accent hover:bg-game-accent-hover text-white font-black text-xl rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl hover:shadow-indigo-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-game-accent animate-pulse-glow"
          aria-label={t('home.play_aria', {
            variant: t(`variant.${selectedVariant}.label`),
            difficulty: t(`difficulty.${selectedDifficulty}.label`),
            category: t(`category.${selectedCategory}`),
          })}
        >
          {t('common.play_now')}
        </button>

        {/* Survival mode CTA */}
        <a
          href="/survival"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 bg-orange-500 hover:bg-orange-600 text-white font-black text-lg rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-orange-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          ⚡ {t('survival.title')}
        </a>
      </div>

      {/* Leaderboard button */}
      <div className="flex justify-center -mt-4 pb-4">
        <button
          onClick={() => setShowLeaderboard(true)}
          className="flex items-center gap-2 text-sm text-game-muted hover:text-game-text transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-game-accent rounded-xl px-4 py-2 hover:bg-game-card border border-transparent hover:border-game-border"
        >
          🏆 {t('leaderboard.title')}
        </button>
      </div>

      {/* Feature icons */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-game-border pt-8">
        {[
          { icon: '🎮', titleKey: 'home.features.modes_title',    descKey: 'home.features.modes_desc'    },
          { icon: '⚡', titleKey: 'home.features.survival_title', descKey: 'home.features.survival_desc' },
          { icon: '🏆', titleKey: 'home.features.diff_title',     descKey: 'home.features.diff_desc'     },
          { icon: '🌍', titleKey: 'home.features.cats_title',     descKey: 'home.features.cats_desc'     },
        ].map((f) => (
          <div key={f.titleKey} className="flex flex-col items-center text-center gap-2 p-4">
            <span className="text-3xl">{f.icon}</span>
            <h3 className="font-bold text-game-text text-sm">{t(f.titleKey)}</h3>
            <p className="text-game-muted text-xs">{t(f.descKey)}</p>
          </div>
        ))}
      </section>

      {showLeaderboard && (
        <Leaderboard onClose={() => setShowLeaderboard(false)} />
      )}
    </div>
  )
}
