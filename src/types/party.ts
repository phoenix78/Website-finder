// ─── Party / Custom Game Types ────────────────────────────────────────────────
//
// A PartyConfig is serialised as URL-safe base64 and stored in the ?g= query
// parameter of /party. Keeping key names short reduces URL length.

/** Abbreviated variant id stored in the URL */
export type PartyVariant = 'ptn' | 'ntp'   // photo-to-name | name-to-photo

/** Abbreviated difficulty stored in the URL */
export type PartyDifficulty = 'e' | 'm' | 'x'  // easy | medium | expert

/** Full party configuration — serialised into the shareable link */
export interface PartyConfig {
  /** Variant abbreviation */
  v: PartyVariant
  /** Difficulty abbreviation */
  d: PartyDifficulty
  /** Optional title shown on the game screen */
  t?: string
  /** People to guess (minimum 4) */
  p: PartyPerson[]
}

/** One person entry in the custom pool */
export interface PartyPerson {
  /** Display name */
  n: string
  /** Photo URL (any publicly accessible image) */
  i: string
  /** Extra accepted answers for expert free-text mode */
  a?: string[]
}
