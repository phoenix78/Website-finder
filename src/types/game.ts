// ─── Core Enums ───────────────────────────────────────────────────────────────

export type Difficulty = 'easy' | 'medium' | 'expert'
export type VariantId = 'photo-to-name' | 'name-to-photo' | 'body-part'
export type CategoryId = 'actors' | 'musicians' | 'athletes' | 'politicians' | 'all'
export type ImageType = 'face' | 'full-body' | 'body-part'
export type BodyPartType = 'eyes' | 'mouth' | 'hands' | 'silhouette' | 'back'

// ─── Celebrity Data Model ──────────────────────────────────────────────────────

export interface CelebrityImage {
  url: string
  type: ImageType
  bodyPart?: BodyPartType
  alt: string
  width: number
  height: number
  blurDataURL?: string
}

export interface Celebrity {
  slug: string
  name: string
  aliases: string[]
  category: Exclude<CategoryId, 'all'>
  difficulty: Difficulty
  active: boolean
  nationality?: string
  birthYear?: number
  description?: string
  images: CelebrityImage[]
}

// ─── Game Session ──────────────────────────────────────────────────────────────

export interface GameRound {
  id: string
  target: Celebrity
  targetImage: CelebrityImage
  choices: Celebrity[]   // shuffled; empty array for expert (free text)
  correctIndex: number   // index in choices; -1 for expert
  timeLimit: number      // seconds
}

export interface UserAnswer {
  roundId: string
  correct: boolean
  chosenSlug?: string   // MCQ
  chosenText?: string   // expert free text
  timeUsed: number      // seconds
  pointsEarned: number
}

export interface GameSession {
  id: string
  variant: VariantId
  difficulty: Difficulty
  category: CategoryId
  rounds: GameRound[]
  currentRoundIndex: number
  score: number
  streak: number
  maxStreak: number
  answers: UserAnswer[]
  startedAt: number
  completedAt?: number
}

export type GameStatus = 'idle' | 'playing' | 'feedback' | 'complete'

export interface GameState {
  status: GameStatus
  session: GameSession | null
  lastAnswer: UserAnswer | null
}

// ─── Config / Registry ────────────────────────────────────────────────────────

export interface VariantConfig {
  id: VariantId
  label: string
  description: string
  icon: string
  supportedDifficulties: Difficulty[]
  imageType: ImageType[]
  choicesCount: Record<Difficulty, number>  // 0 = free text
  timeLimitSeconds: Record<Difficulty, number>
}

export interface DifficultyConfig {
  id: Difficulty
  label: string
  description: string
  badgeColor: string
  pointsBase: number
}

export interface CategoryConfig {
  id: CategoryId
  label: string
  icon: string
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export interface GameSetupState {
  variant: VariantId
  difficulty: Difficulty
  category: CategoryId
}
