import type { Celebrity, CategoryId, Difficulty } from '@/types/game'

// ─── Import all celebrity JSON files ──────────────────────────────────────────
// To add a new celebrity: create a JSON file in the appropriate category folder
// and add a single import line here.

// Actors
import bradPitt from './celebrities/actors/brad-pitt.json'
import leonardoDiCaprio from './celebrities/actors/leonardo-dicaprio.json'
import merylStreep from './celebrities/actors/meryl-streep.json'
import tomHanks from './celebrities/actors/tom-hanks.json'
import scarlettJohansson from './celebrities/actors/scarlett-johansson.json'
import angelinaJolie from './celebrities/actors/angelina-jolie.json'
import johnnyDepp from './celebrities/actors/johnny-depp.json'

// Musicians
import beyonce from './celebrities/musicians/beyonce.json'
import michaelJackson from './celebrities/musicians/michael-jackson.json'
import taylorSwift from './celebrities/musicians/taylor-swift.json'
import eminem from './celebrities/musicians/eminem.json'
import rihanna from './celebrities/musicians/rihanna.json'
import madonna from './celebrities/musicians/madonna.json'

// Athletes
import cristianoRonaldo from './celebrities/athletes/cristiano-ronaldo.json'
import lebronJames from './celebrities/athletes/lebron-james.json'
import serenaWilliams from './celebrities/athletes/serena-williams.json'
import usainBolt from './celebrities/athletes/usain-bolt.json'
import rogerFederer from './celebrities/athletes/roger-federer.json'

// Politicians
import barackObama from './celebrities/politicians/barack-obama.json'
import angelaMerkel from './celebrities/politicians/angela-merkel.json'
import emmanuelMacron from './celebrities/politicians/emmanuel-macron.json'
import nelsonMandela from './celebrities/politicians/nelson-mandela.json'

// ─── Master list ───────────────────────────────────────────────────────────────

export const ALL_CELEBRITIES: Celebrity[] = [
  bradPitt,
  leonardoDiCaprio,
  merylStreep,
  tomHanks,
  scarlettJohansson,
  angelinaJolie,
  johnnyDepp,
  beyonce,
  michaelJackson,
  taylorSwift,
  eminem,
  rihanna,
  madonna,
  cristianoRonaldo,
  lebronJames,
  serenaWilliams,
  usainBolt,
  rogerFederer,
  barackObama,
  angelaMerkel,
  emmanuelMacron,
  nelsonMandela,
] as Celebrity[]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getCelebrities(
  category?: CategoryId,
  difficulty?: Difficulty
): Celebrity[] {
  return ALL_CELEBRITIES.filter((c) => {
    if (!c.active) return false
    if (category && category !== 'all' && c.category !== category) return false
    if (difficulty && c.difficulty !== difficulty) return false
    return true
  })
}

export function getCelebrityBySlug(slug: string): Celebrity | undefined {
  return ALL_CELEBRITIES.find((c) => c.slug === slug)
}

export function getCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = { all: 0 }
  for (const c of ALL_CELEBRITIES) {
    if (!c.active) continue
    counts[c.category] = (counts[c.category] ?? 0) + 1
    counts.all++
  }
  return counts
}
