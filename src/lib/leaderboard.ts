// ─── Leaderboard — localStorage persistence ───────────────────────────────────

export type GameMode = 'classic' | 'survival'

export interface LeaderboardEntry {
  id: string
  score: number
  grade: string
  variant: string
  difficulty: string
  correct: number
  total: number            // 0 for survival (rounds survive until death)
  maxStreak: number
  date: string             // ISO string
  mode: GameMode
  survivalRounds?: number  // rounds survived in survival mode
}

const STORAGE_KEY = 'celebrity-quiz-leaderboard'
const MAX_ENTRIES = 100

// ─── Read ─────────────────────────────────────────────────────────────────────

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as LeaderboardEntry[]) : []
  } catch {
    return []
  }
}

// ─── Write ────────────────────────────────────────────────────────────────────

export function saveScore(
  entry: Omit<LeaderboardEntry, 'id' | 'date'>
): LeaderboardEntry {
  const full: LeaderboardEntry = {
    ...entry,
    id: Math.random().toString(36).slice(2, 9),
    date: new Date().toISOString(),
  }
  const all = getLeaderboard()
  all.push(full)
  all.sort((a, b) => b.score - a.score)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all.slice(0, MAX_ENTRIES)))
  } catch {
    // storage full — silently ignore
  }
  return full
}

// ─── Query ────────────────────────────────────────────────────────────────────

export function getTopScores(mode?: GameMode, limit = 10): LeaderboardEntry[] {
  const all = getLeaderboard()
  const filtered = mode ? all.filter((e) => e.mode === mode) : all
  return filtered.sort((a, b) => b.score - a.score).slice(0, limit)
}

export function clearLeaderboard(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
