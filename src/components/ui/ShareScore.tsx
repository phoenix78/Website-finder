'use client'

import { useState } from 'react'
import type { LeaderboardEntry } from '@/lib/leaderboard'
import { useT } from '@/i18n'

interface ShareScoreProps {
  entry: LeaderboardEntry
}

function buildShareText(entry: LeaderboardEntry, t: (k: string, p?: Record<string, string>) => string): string {
  const modeLabel = entry.mode === 'survival'
    ? `⚡ ${t('survival.title')} — ${entry.survivalRounds ?? 0} ${t('survival.rounds_survived')}`
    : `🎯 ${t(`variant.${entry.variant}.label`)} · ${t(`difficulty.${entry.difficulty}.label`)}`

  const scoreStr = entry.score.toLocaleString()

  const accuracy = entry.total > 0
    ? `${entry.correct}/${entry.total} (${Math.round((entry.correct / entry.total) * 100)}%)`
    : `${entry.survivalRounds ?? 0} ${t('survival.rounds_survived')}`

  return [
    `🎭 Celebrity Quiz`,
    ``,
    `${modeLabel}`,
    `🏆 ${t('result.final_score')}: ${scoreStr} pts | ${t('result.grade')}: ${entry.grade}`,
    `✅ ${t('result.accuracy')}: ${accuracy}`,
    `🔥 ${t('result.best_streak')}: ×${entry.maxStreak}`,
    ``,
    `👉 Play at: ${typeof window !== 'undefined' ? window.location.origin : 'https://celebrity-quiz.app'}`,
  ].join('\n')
}

export function ShareScore({ entry }: ShareScoreProps) {
  const { t } = useT()
  const [copied, setCopied] = useState(false)

  const text = buildShareText(entry, t)

  const handleShare = async () => {
    // Try native Web Share API first (mobile)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Celebrity Quiz', text })
        return
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Older browsers — create a textarea trick
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-game-border bg-game-card hover:border-game-accent/60 text-game-text font-semibold text-sm transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-game-accent"
      aria-label={t('result.share')}
    >
      {copied ? (
        <>
          <span className="text-green-500">✓</span>
          <span className="text-green-500">{t('result.copied')}</span>
        </>
      ) : (
        <>
          <span>📤</span>
          <span>{t('result.share')}</span>
        </>
      )}
    </button>
  )
}
