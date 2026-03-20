import type { VariantId } from '@/types/game'
import type { GameVariantDefinition } from './types'

class GameRegistryClass {
  private readonly variants = new Map<VariantId, GameVariantDefinition>()

  register(def: GameVariantDefinition): void {
    if (this.variants.has(def.id)) {
      console.warn(`[GameRegistry] Variant "${def.id}" is already registered.`)
    }
    this.variants.set(def.id, def)
  }

  get(id: VariantId): GameVariantDefinition {
    const def = this.variants.get(id)
    if (!def) throw new Error(`[GameRegistry] Unknown variant: "${id}"`)
    return def
  }

  all(): GameVariantDefinition[] {
    return Array.from(this.variants.values())
  }

  has(id: VariantId): boolean {
    return this.variants.has(id)
  }
}

export const GameRegistry = new GameRegistryClass()
