import type { VariantId, Difficulty, ImageType } from '@/types/game'

/**
 * Defines a game variant. Register one in src/game-registry/variants/ and
 * call GameRegistry.register() in src/game-registry/index.ts.
 *
 * To add a new variant:
 * 1. Add its VariantId to src/types/game.ts
 * 2. Create src/game-registry/variants/<id>.ts
 * 3. Create src/components/variants/<ComponentName>.tsx
 * 4. Add import to src/game-registry/index.ts
 */
export interface GameVariantDefinition {
  id: VariantId
  /** Short display label */
  label: string
  /** One-liner description shown on home screen */
  description: string
  /** Emoji icon */
  icon: string
  /** Which difficulty levels are available */
  supportedDifficulties: Difficulty[]
  /** What image types are needed from celebrity data */
  requiredImageTypes: ImageType[]
  /** Number of MCQ choices per difficulty (0 = free text) */
  choicesCount: Record<Difficulty, number>
  /** Timer in seconds per difficulty */
  timeLimitSeconds: Record<Difficulty, number>
}
