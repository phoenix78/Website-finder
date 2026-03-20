import type { GameVariantDefinition } from '../types'

export const nameToPhotoVariant: GameVariantDefinition = {
  id: 'name-to-photo',
  label: 'Nom → Photo',
  description: 'Un nom s\'affiche. Cliquez sur la bonne photo parmi les propositions.',
  icon: '🏷️',
  supportedDifficulties: ['easy', 'medium'],
  requiredImageTypes: ['face', 'full-body'],
  choicesCount: {
    easy: 2,
    medium: 4,
    expert: 4, // not used (no expert for this variant)
  },
  timeLimitSeconds: {
    easy: 30,
    medium: 25,
    expert: 30, // not used
  },
}
