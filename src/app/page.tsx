'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { VariantId, Difficulty, CategoryId } from '@/types/game'
import { GameRegistry } from '@/game-registry'
import { getCategoryCounts } from '@/data'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

const DIFFICULTIES: { id: Difficulty; label: string; desc: string; color: string }[] = [
  { id: 'easy', label: 'Facile', desc: '2 choix • 30 sec', color: 'border-green-500 text-green-400' },
  { id: 'medium', label: 'Intermédiaire', desc: '4 choix • 25 sec', color: 'border-yellow-500 text-yellow-400' },
  { id: 'expert', label: 'Expert', desc: 'Texte libre • 45 sec', color: 'border-red-500 text-red-400' },
]

const CATEGORIES: { id: CategoryId; label: string; icon: string }[] = [
  { id: 'all', label: 'Tout', icon: '🌍' },
  { id: 'actors', label: 'Acteurs', icon: '🎬' },
  { id: 'musicians', label: 'Musiciens', icon: '🎵' },
  { id: 'athletes', label: 'Sportifs', icon: '🏆' },
  { id: 'politicians', label: 'Politiciens', icon: '🏛️' },
]

export default function HomePage() {
  const router = useRouter()
  const variants = GameRegistry.all()
  const counts = getCategoryCounts()

  const [selectedVariant, setSelectedVariant] = useState<VariantId>('photo-to-name')
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy')
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all')

  const activeVariant = GameRegistry.get(selectedVariant)
  const difficultySupported = activeVariant.supportedDifficulties.includes(selectedDifficulty)

  const handlePlay = () => {
    const diff = difficultySupported ? selectedDifficulty : activeVariant.supportedDifficulties[0]
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
          Testez vos connaissances sur les célébrités du monde entier. Plusieurs modes
          de jeu, plusieurs niveaux — à vous de jouer !
        </p>
      </section>

      {/* Step 1 — Variant */}
      <section aria-labelledby="variant-heading">
        <h2 id="variant-heading" className="text-sm font-semibold text-game-muted uppercase tracking-widest mb-3">
          1 · Mode de jeu
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
                  ? 'border-game-accent bg-game-accent/10 shadow-lg shadow-indigo-500/20'
                  : 'border-game-border bg-game-card hover:border-game-accent/50'
              )}
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{v.icon}</span>
                {selectedVariant === v.id && (
                  <span className="text-game-accent text-lg">✓</span>
                )}
              </div>
              <div>
                <p className="font-bold text-game-text text-base">{v.label}</p>
                <p className="text-game-muted text-sm mt-0.5">{v.description}</p>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {v.supportedDifficulties.map((d) => (
                  <Badge key={d} variant={d}>{d}</Badge>
                ))}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Step 2 — Difficulty */}
      <section aria-labelledby="difficulty-heading">
        <h2 id="difficulty-heading" className="text-sm font-semibold text-game-muted uppercase tracking-widest mb-3">
          2 · Difficulté
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
                <span className="font-bold text-sm sm:text-base">{d.label}</span>
                <span className="text-xs text-game-muted">{d.desc}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Step 3 — Category */}
      <section aria-labelledby="category-heading">
        <h2 id="category-heading" className="text-sm font-semibold text-game-muted uppercase tracking-widest mb-3">
          3 · Catégorie
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
              <span>{cat.label}</span>
              <span className="text-game-muted text-xs">
                ({counts[cat.id] ?? 0})
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="flex justify-center pb-4">
        <button
          onClick={handlePlay}
          className="group px-10 py-4 bg-game-accent hover:bg-game-accent-hover text-white font-black text-xl rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl hover:shadow-indigo-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-game-accent animate-pulse-glow"
          aria-label={`Jouer en mode ${activeVariant.label}, difficulté ${selectedDifficulty}, catégorie ${selectedCategory}`}
        >
          Jouer maintenant →
        </button>
      </div>

      {/* Features */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-game-border pt-8">
        {[
          { icon: '🎮', title: '3 modes de jeu', desc: 'Photo, Nom ou Partie du corps' },
          { icon: '🏆', title: '3 difficultés', desc: 'Facile, Intermédiaire, Expert' },
          { icon: '🌍', title: '4 catégories', desc: 'Acteurs, Musiciens, Sportifs, Politiciens' },
        ].map((f) => (
          <div key={f.title} className="flex flex-col items-center text-center gap-2 p-4">
            <span className="text-3xl">{f.icon}</span>
            <h3 className="font-bold text-game-text">{f.title}</h3>
            <p className="text-game-muted text-sm">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
