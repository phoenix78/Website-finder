import type { Difficulty } from '@/types/game'

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_POINTS: Record<Difficulty, number> = {
  easy: 10,
  medium: 20,
  expert: 50,
}

// streak index → multiplier (capped at index 4)
const STREAK_MULTIPLIERS = [1.0, 1.0, 1.0, 1.5, 2.0]

// ─── Score calculation ────────────────────────────────────────────────────────

export interface ScoreResult {
  points: number
  newStreak: number
  timeBonus: number
  streakMultiplier: number
}

export function calculateScore(
  correct: boolean,
  difficulty: Difficulty,
  timeUsed: number,
  timeLimit: number,
  currentStreak: number
): ScoreResult {
  if (!correct) {
    return { points: 0, newStreak: 0, timeBonus: 0, streakMultiplier: 1.0 }
  }

  const base = BASE_POINTS[difficulty]

  // Time bonus: up to 50% extra for answering quickly
  const timeRatio = Math.max(0, 1 - timeUsed / timeLimit)
  const timeBonus = Math.floor(base * timeRatio * 0.5)

  // Streak multiplier
  const streakIdx = Math.min(currentStreak, STREAK_MULTIPLIERS.length - 1)
  const streakMultiplier = STREAK_MULTIPLIERS[streakIdx]

  const points = Math.floor((base + timeBonus) * streakMultiplier)

  return {
    points,
    newStreak: currentStreak + 1,
    timeBonus,
    streakMultiplier,
  }
}

// ─── Grade / rating ────────────────────────────────────────────────────────────

export interface GameGrade {
  letter: 'S' | 'A' | 'B' | 'C' | 'D'
  label: string
  color: string
}

export function getGameGrade(
  correct: number,
  total: number
): GameGrade {
  const pct = total === 0 ? 0 : correct / total

  if (pct >= 0.95) return { letter: 'S', label: 'Légendaire !', color: 'text-yellow-400' }
  if (pct >= 0.80) return { letter: 'A', label: 'Excellent !', color: 'text-green-400' }
  if (pct >= 0.60) return { letter: 'B', label: 'Bien joué !', color: 'text-blue-400' }
  if (pct >= 0.40) return { letter: 'C', label: 'Pas mal...', color: 'text-orange-400' }
  return { letter: 'D', label: 'À améliorer', color: 'text-red-400' }
}
