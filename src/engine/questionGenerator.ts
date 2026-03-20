import type {
  Celebrity,
  GameRound,
  Difficulty,
  VariantId,
  CategoryId,
  ImageType,
} from '@/types/game'
import { shuffle, nanoid } from '@/lib/utils'

// ─── Config ───────────────────────────────────────────────────────────────────

const CHOICES_COUNT: Record<Difficulty, number> = {
  easy: 2,
  medium: 4,
  expert: 0, // free text — no choices
}

const TIME_LIMITS: Record<Difficulty, number> = {
  easy: 30,
  medium: 25,
  expert: 45,
}

const REQUIRED_IMAGE_TYPE: Record<VariantId, ImageType[]> = {
  'photo-to-name': ['face', 'full-body'],
  'name-to-photo': ['face', 'full-body'],
  'body-part': ['body-part'],
}

// ─── Single round ─────────────────────────────────────────────────────────────

export function generateRound(
  pool: Celebrity[],
  target: Celebrity,
  difficulty: Difficulty,
  variant: VariantId
): GameRound {
  const acceptedTypes = REQUIRED_IMAGE_TYPE[variant]

  // Pick best image for this variant
  const candidateImages = target.images.filter((img) =>
    acceptedTypes.includes(img.type)
  )
  const fallback = target.images[0]
  const targetImage = candidateImages[0] ?? fallback

  const choicesCount = CHOICES_COUNT[difficulty]
  let choices: Celebrity[] = []
  let correctIndex = -1

  if (choicesCount > 0) {
    // Prefer distractors from same category, then expand
    const sameCat = pool.filter(
      (c) => c.slug !== target.slug && c.category === target.category
    )
    const diffCat = pool.filter(
      (c) => c.slug !== target.slug && c.category !== target.category
    )

    const distPool = sameCat.length >= choicesCount - 1 ? sameCat : [...sameCat, ...diffCat]
    const distractors = shuffle(distPool).slice(0, choicesCount - 1)

    choices = shuffle([target, ...distractors])
    correctIndex = choices.findIndex((c) => c.slug === target.slug)
  }

  return {
    id: nanoid(),
    target,
    targetImage,
    choices,
    correctIndex,
    timeLimit: TIME_LIMITS[difficulty],
  }
}

// ─── Full session ─────────────────────────────────────────────────────────────

export function generateSession(
  allCelebrities: Celebrity[],
  variant: VariantId,
  difficulty: Difficulty,
  category: CategoryId,
  roundCount = 10
): GameRound[] {
  const acceptedTypes = REQUIRED_IMAGE_TYPE[variant]

  // Filter celebrities eligible for this game configuration
  const eligible = allCelebrities.filter((c) => {
    if (!c.active) return false
    if (category !== 'all' && c.category !== category) return false
    // Must have at least one suitable image
    return c.images.some((img) => acceptedTypes.includes(img.type))
  })

  if (eligible.length === 0) return []

  const actualCount = Math.min(roundCount, eligible.length)
  const targets = shuffle([...eligible]).slice(0, actualCount)

  return targets.map((target) => generateRound(eligible, target, difficulty, variant))
}
