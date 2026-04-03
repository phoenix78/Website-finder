'use client'

import { useState, useEffect, useCallback } from 'react'
import type { GameMode, LeaderboardEntry } from '@/lib/leaderboard'
import { getTopScores, clearLeaderboard } from '@/lib/leaderboard'
import { useT } from '@/i18n'
import { cn } from '@/lib/utils'

const MEDALS = ['🥇', '🥈', '🥉']

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

interface GlobalScore {
  id: string
  score: number
  grade: string
  variant: string
  difficulty: string
  mode: string
  correct: number
  total: number
  maxStreak: number
  survivalRounds?: number
  createdAt: string
  user: { pseudo?: string; name?: string; image?: string }
}

interface LeaderboardProps {
  onClose: () => void
  highlightId?: string
}

type TabId = GameMode | 'all' | 'global'

export function Leaderboard({ onClose, highlightId }: LeaderboardProps) {
  const { t } = useT()
  const [tab, setTab] = useState<TabId>('all')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [globalEntries, setGlobalEntries] = useState<GlobalScore[]>([])
  const [globalLoading, setGlobalLoading] = useState(false)

  const reload = useCallback(() => {
    if (tab !== 'global') {
      setEntries(getTopScores(tab === 'all' ? undefined : (tab as GameMode), 20))
    }
  }, [tab])

  useEffect(() => { reload() }, [reload])

  useEffect(() => {
    if (tab === 'global') {
      setGlobalLoading(true)
      fetch('/api/scores?mode=classic&limit=50')
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setGlobalEntries(data)
        })
        .catch(() => {})
        .finally(() => setGlobalLoading(false))
    }
  }, [tab])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleClear = () => {
    if (confirm(t('leaderboard.confirm_clear'))) {
      clearLeaderboard()
      reload()
    }
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'all',      label: t('leaderboard.tab_all') },
    { id: 'classic',  label: t('leaderboard.tab_classic') },
    { id: 'survival', label: t('leaderboard.tab_survival') },
    { id: 'global',   label: '🌐 Global' },
  ]

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="leaderboard-title"
    >
      <div className="w-full max-w-md bg-game-card border border-game-border rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-game-border shrink-0">
          <h2 id="leaderboard-title" className="text-xl font-black text-game-text flex items-center gap-2">
            🏆 {t('leaderboard.title')}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-game-bg text-game-muted hover:text-game-text transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-game-accent"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 shrink-0">
          {tabs.map((tab_) => (
            <button
              key={tab_.id}
              onClick={() => setTab(tab_.id)}
              className={cn(
                'flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-game-accent',
                tab === tab_.id
                  ? 'bg-game-accent text-white'
                  : 'text-game-muted hover:text-game-text hover:bg-game-bg'
              )}
            >
              {tab_.label}
            </button>
          ))}
        </div>

        {/* Entries */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
          {tab === 'global' ? (
            globalLoading ? (
              <p className="text-center text-game-muted py-12 text-sm">Chargement…</p>
            ) : globalEntries.length === 0 ? (
              <p className="text-center text-game-muted py-12 text-sm">{t('leaderboard.empty')}</p>
            ) : (
              globalEntries.map((entry, i) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 p-3 rounded-xl border transition-all border-game-border bg-game-bg"
                >
                  <span className="text-lg w-7 text-center shrink-0">
                    {i < 3 ? MEDALS[i] : <span className="text-game-muted text-sm font-bold">#{i + 1}</span>}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-game-text text-sm">
                        {entry.score.toLocaleString()} pts
                      </span>
                      <span className={cn(
                        'text-xs font-black px-1.5 py-0.5 rounded-md',
                        entry.grade === 'S' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-game-accent/20 text-game-accent'
                      )}>
                        {entry.grade}
                      </span>
                      <span className="text-xs text-game-muted font-semibold">
                        {entry.user?.pseudo ?? entry.user?.name ?? 'Anonyme'}
                      </span>
                    </div>
                    <p className="text-xs text-game-muted truncate mt-0.5">
                      {entry.correct}/{entry.total} · 🔥×{entry.maxStreak} · {entry.difficulty}
                    </p>
                  </div>
                  <span className="text-xs text-game-muted shrink-0">{formatDate(entry.createdAt)}</span>
                </div>
              ))
            )
          ) : entries.length === 0 ? (
            <p className="text-center text-game-muted py-12 text-sm">{t('leaderboard.empty')}</p>
          ) : (
            entries.map((entry, i) => (
              <div
                key={entry.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border transition-all',
                  highlightId === entry.id
                    ? 'border-game-accent bg-game-accent/10 shadow-md shadow-indigo-500/10'
                    : 'border-game-border bg-game-bg'
                )}
              >
                {/* Rank */}
                <span className="text-lg w-7 text-center shrink-0">
                  {i < 3 ? MEDALS[i] : <span className="text-game-muted text-sm font-bold">#{i + 1}</span>}
                </span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-game-text text-sm">
                      {entry.score.toLocaleString()} pts
                    </span>
                    <span className={cn(
                      'text-xs font-black px-1.5 py-0.5 rounded-md',
                      entry.grade === 'S' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-game-accent/20 text-game-accent'
                    )}>
                      {entry.grade}
                    </span>
                    {entry.mode === 'survival' && (
                      <span className="text-xs bg-orange-500/20 text-orange-500 px-1.5 py-0.5 rounded-md font-bold">
                        ⚡ {entry.survivalRounds}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-game-muted truncate mt-0.5">
                    {entry.mode === 'classic'
                      ? `${entry.correct}/${entry.total} · 🔥×${entry.maxStreak} · ${entry.difficulty}`
                      : `${entry.survivalRounds} rounds · 🔥×${entry.maxStreak}`
                    }
                  </p>
                </div>

                {/* Date */}
                <span className="text-xs text-game-muted shrink-0">{formatDate(entry.date)}</span>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        {tab !== 'global' && entries.length > 0 && (
          <div className="px-4 py-3 border-t border-game-border shrink-0">
            <button
              onClick={handleClear}
              className="text-xs text-red-400 hover:text-red-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded"
            >
              {t('leaderboard.clear')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
