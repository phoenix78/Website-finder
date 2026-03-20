import type { GameVariantDefinition } from '../types'

export const bodyPartVariant: GameVariantDefinition = {
  id: 'body-part',
  label: 'Partie du corps',
  description: 'Une partie du corps est montrée. Reconnaissez la célébrité !',
  icon: '👁️',
  supportedDifficulties: ['easy', 'medium', 'expert'],
  requiredImageTypes: ['body-part'],
  choicesCount: {
    easy: 2,
    medium: 4,
    expert: 0,
  },
  timeLimitSeconds: {
    easy: 35,
    medium: 30,
    expert: 50,
  },
}
