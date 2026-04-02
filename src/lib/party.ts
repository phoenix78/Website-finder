// ─── Party lib — encode / decode / validate / convert ────────────────────────

import type { Celebrity, VariantId, Difficulty } from '@/types/game'
import type { PartyConfig, PartyVariant, PartyDifficulty, PartyPerson } from '@/types/party'
import { nanoid } from '@/lib/utils'

// ─── Minimum people required to start a party game ───────────────────────────
export const PARTY_MIN_PEOPLE = 4

// ─── Abbreviation maps ────────────────────────────────────────────────────────

export const VARIANT_MAP: Record<PartyVariant, VariantId> = {
  ptn: 'photo-to-name',
  ntp: 'name-to-photo',
}

export const VARIANT_ABBR: Record<string, PartyVariant> = {
  'photo-to-name': 'ptn',
  'name-to-photo': 'ntp',
}

export const DIFF_MAP: Record<PartyDifficulty, Difficulty> = {
  e: 'easy',
  m: 'medium',
  x: 'expert',
}

export const DIFF_ABBR: Record<string, PartyDifficulty> = {
  easy:   'e',
  medium: 'm',
  expert: 'x',
}

// ─── Encode ───────────────────────────────────────────────────────────────────

/** Serialise a PartyConfig into a URL-safe base64 string. */
export function encodePartyConfig(config: PartyConfig): string {
  const json = JSON.stringify(config)
  // btoa is browser/Node 16+ — works in Next.js server + client
  return btoa(json)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

// ─── Decode ───────────────────────────────────────────────────────────────────

/** Deserialise a URL-safe base64 string back into a PartyConfig.
 *  Returns null if the string is invalid or fails validation. */
export function decodePartyConfig(encoded: string): PartyConfig | null {
  try {
    const padded = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const padLen = (4 - (padded.length % 4)) % 4
    const json = atob(padded + '='.repeat(padLen))
    const parsed: unknown = JSON.parse(json)
    return validatePartyConfig(parsed) ? parsed : null
  } catch {
    return null
  }
}

// ─── Validate ─────────────────────────────────────────────────────────────────

/** Type-guard: checks that the parsed object is a well-formed PartyConfig. */
export function validatePartyConfig(config: unknown): config is PartyConfig {
  if (!config || typeof config !== 'object') return false
  const c = config as Record<string, unknown>

  if (!(['ptn', 'ntp'] as string[]).includes(c.v as string)) return false
  if (!(['e', 'm', 'x'] as string[]).includes(c.d as string)) return false
  if (c.t !== undefined && typeof c.t !== 'string') return false
  if (!Array.isArray(c.p) || c.p.length < PARTY_MIN_PEOPLE) return false

  for (const person of c.p) {
    if (!person || typeof person !== 'object') return false
    const p = person as Record<string, unknown>
    if (typeof p.n !== 'string' || !p.n.trim()) return false
    if (typeof p.i !== 'string' || !p.i.match(/^https?:\/\/.+/)) return false
    if (p.a !== undefined && !Array.isArray(p.a)) return false
  }
  return true
}

// ─── Convert ──────────────────────────────────────────────────────────────────

/** Convert a PartyConfig into a Celebrity[] compatible with the game engine. */
export function partyConfigToCelebrities(config: PartyConfig): Celebrity[] {
  const difficulty = DIFF_MAP[config.d]
  return config.p.map((person: PartyPerson): Celebrity => ({
    slug: `party-${slugify(person.n)}-${nanoid(4)}`,
    name: person.n.trim(),
    aliases: person.a ?? [],
    category: 'custom',
    difficulty,
    active: true,
    images: [
      {
        url: person.i,
        type: 'face',
        alt: `${person.n.trim()} — photo`,
        width: 500,
        height: 500,
      },
    ],
  }))
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'person'
  )
}
