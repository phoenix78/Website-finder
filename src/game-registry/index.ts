/**
 * Game Registry initialization.
 * Import this file once at app startup (in layout.tsx or a provider).
 * Add new variants here by importing and registering them.
 */
import { GameRegistry } from './registry'
import { photoToNameVariant } from './variants/photo-to-name'
import { nameToPhotoVariant } from './variants/name-to-photo'
import { bodyPartVariant } from './variants/body-part'

GameRegistry.register(photoToNameVariant)
GameRegistry.register(nameToPhotoVariant)
GameRegistry.register(bodyPartVariant)

export { GameRegistry }
export type { GameVariantDefinition } from './types'
