import type { GameVariantDefinition } from '../types'

export const photoToNameVariant: GameVariantDefinition = {
  id: 'photo-to-name',
  label: 'Photo → Nom',
  description: 'Une photo s\'affiche. Devinez qui est cette célébrité.',
  icon: '📸',
  supportedDifficulties: ['easy', 'medium', 'expert'],
  requiredImageTypes: ['face', 'full-body'],
  choicesCount: {
    easy: 2,
    medium: 4,
    expert: 0,
  },
  timeLimitSeconds: {
    easy: 30,
    medium: 25,
    expert: 45,
  },
}
