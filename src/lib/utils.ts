// ─── Class name merger ────────────────────────────────────────────────────────

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ─── Array shuffle (Fisher–Yates) ─────────────────────────────────────────────

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// ─── Nano ID (no external dependency) ────────────────────────────────────────

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export function nanoid(size = 12): string {
  let id = ''
  for (let i = 0; i < size; i++) {
    id += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return id
}

// ─── Levenshtein distance ─────────────────────────────────────────────────────

export function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[] = Array.from({ length: n + 1 }, (_, i) => i)

  for (let i = 1; i <= m; i++) {
    let prev = i
    for (let j = 1; j <= n; j++) {
      const val =
        a[i - 1] === b[j - 1]
          ? dp[j - 1]
          : 1 + Math.min(dp[j - 1], dp[j], prev)
      dp[j - 1] = prev
      prev = val
    }
    dp[n] = prev
  }

  return dp[n]
}

// ─── Format helpers ───────────────────────────────────────────────────────────

export function formatScore(score: number): string {
  return score.toLocaleString()
}

export function formatTime(seconds: number): string {
  if (seconds <= 0) return '0s'
  return `${Math.ceil(seconds)}s`
}

export function formatPercent(value: number, total: number): string {
  if (total === 0) return '0%'
  return `${Math.round((value / total) * 100)}%`
}

// ─── String normalization for fuzzy matching ──────────────────────────────────

export function normalizeForComparison(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^\w\s]/g, '')         // remove punctuation
    .replace(/\s+/g, ' ')            // collapse whitespace
}
