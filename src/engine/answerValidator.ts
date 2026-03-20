import type { GameRound, Difficulty } from '@/types/game'
import { levenshtein, normalizeForComparison } from '@/lib/utils'

/**
 * Validates a user's answer for a given round.
 * - MCQ (easy/medium): `chosen` is the celebrity slug
 * - Expert (free text): `chosen` is the raw text typed by the user
 */
export function validateAnswer(
  round: GameRound,
  chosen: string,
  difficulty: Difficulty
): boolean {
  if (difficulty === 'expert') {
    return validateFreeText(
      round.target.name,
      round.target.aliases,
      chosen
    )
  }
  // Multiple-choice: compare slugs
  return chosen === round.target.slug
}

// ─── Free-text validation ─────────────────────────────────────────────────────

function validateFreeText(
  name: string,
  aliases: string[],
  input: string
): boolean {
  const normalizedInput = normalizeForComparison(input)
  if (!normalizedInput) return false

  const targets = [name, ...aliases].map(normalizeForComparison)

  return targets.some((target) => {
    if (target === normalizedInput) return true

    // Allow partial match: typed "DiCaprio" → matches "Leonardo DiCaprio"
    if (target.includes(normalizedInput) && normalizedInput.length >= 4) return true
    if (normalizedInput.includes(target) && target.length >= 4) return true

    // Levenshtein tolerance scales with string length
    const maxDistance = target.length <= 5 ? 1 : target.length <= 8 ? 2 : 3
    return levenshtein(target, normalizedInput) <= maxDistance
  })
}
