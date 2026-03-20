'use client'

import { useState, useCallback, useRef } from 'react'
import type { VariantId, CategoryId, GameRound, UserAnswer } from '@/types/game'
import { generateRound } from '@/engine/questionGenerator'
import { validateAnswer } from '@/engine/answerValidator'
import { calculateScore } from '@/engine/scoreEngine'
import { ALL_CELEBRITIES } from '@/data'
import { shuffle } from '@/lib/utils'
import type { LeaderboardEntry } from '@/lib/leaderboard'
import { saveScore } from '@/lib/leaderboard'
import { getGameGrade } from '@/engine/scoreEngine'

const SURVIVAL_DIFFICULTY = 'medium' as const
const TIME_LIMIT = 10 // seconds per question

export type SurvivalStatus = 'idle' | 'playing' | 'feedback' | 'dead'

export interface SurvivalState {
  status: SurvivalStatus
  round: GameRound | null
  roundNumber: number   // 1-based rounds survived
  score: number
  streak: number
  maxStreak: number
  lastAnswer: UserAnswer | null
  savedEntry: LeaderboardEntry | null
}

export function useSurvival() {
  const [state, setState] = useState<SurvivalState>({
    status: 'idle',
    round: null,
    roundNumber: 0,
    score: 0,
    streak: 0,
    maxStreak: 0,
    lastAnswer: null,
    savedEntry: null,
  })

  const variantRef     = useRef<VariantId>('photo-to-name')
  const categoryRef    = useRef<CategoryId>('all')
  const poolRef        = useRef<typeof ALL_CELEBRITIES>([])
  const usedSlugsRef   = useRef<Set<string>>(new Set())
  const roundStartTime = useRef<number>(0)

  // ─── Build the eligible pool ────────────────────────────────────────────────

  const buildPool = useCallback((variant: VariantId, category: CategoryId) => {
    const acceptedTypes: string[] = variant === 'body-part'
      ? ['body-part']
      : ['face', 'full-body']

    return ALL_CELEBRITIES.filter((c) => {
      if (!c.active) return false
      if (category !== 'all' && c.category !== category) return false
      return c.images.some((img) => acceptedTypes.includes(img.type))
    })
  }, [])

  // ─── Pick next random target ────────────────────────────────────────────────

  const pickNextTarget = useCallback(() => {
    const pool = poolRef.current
    const unused = pool.filter((c) => !usedSlugsRef.current.has(c.slug))
    // If all used, reset cycle
    const candidates = unused.length > 0 ? unused : pool
    const shuffled = shuffle([...candidates])
    return shuffled[0]
  }, [])

  // ─── Start game ─────────────────────────────────────────────────────────────

  const startSurvival = useCallback((variant: VariantId, category: CategoryId) => {
    variantRef.current = variant
    categoryRef.current = category
    usedSlugsRef.current = new Set()

    const pool = buildPool(variant, category)
    if (pool.length === 0) return
    poolRef.current = pool

    const target = shuffle([...pool])[0]
    usedSlugsRef.current.add(target.slug)

    const round = generateRound(pool, target, SURVIVAL_DIFFICULTY, variant)
    roundStartTime.current = Date.now()

    setState({
      status: 'playing',
      round,
      roundNumber: 1,
      score: 0,
      streak: 0,
      maxStreak: 0,
      lastAnswer: null,
      savedEntry: null,
    })
  }, [buildPool])

  // ─── Submit answer ───────────────────────────────────────────────────────────

  const submitAnswer = useCallback((chosen: string) => {
    setState((prev) => {
      if (!prev.round || prev.status !== 'playing') return prev

      const timeUsed = (Date.now() - roundStartTime.current) / 1000
      const correct = validateAnswer(prev.round, chosen, SURVIVAL_DIFFICULTY)
      const { points, newStreak } = calculateScore(
        correct,
        SURVIVAL_DIFFICULTY,
        timeUsed,
        TIME_LIMIT,
        prev.streak
      )

      const answer: UserAnswer = {
        roundId: prev.round.id,
        correct,
        chosenSlug: chosen !== '__timeout__' ? chosen : undefined,
        timeUsed,
        pointsEarned: correct ? points : 0,
      }

      const newScore   = prev.score + (correct ? points : 0)
      const newStreak_ = correct ? newStreak : 0
      const newMax     = Math.max(prev.maxStreak, correct ? newStreak : prev.streak)

      // Wrong answer → DEAD
      if (!correct) {
        const grade = getGameGrade(prev.roundNumber - 1, prev.roundNumber - 1 || 1)
        const savedEntry = saveScore({
          score: prev.score,
          grade: grade.letter,
          variant: variantRef.current,
          difficulty: SURVIVAL_DIFFICULTY,
          correct: prev.roundNumber - 1,
          total: 0,
          maxStreak: newMax,
          mode: 'survival',
          survivalRounds: prev.roundNumber - 1,
        })
        return {
          ...prev,
          status: 'dead',
          lastAnswer: answer,
          maxStreak: newMax,
          savedEntry,
        }
      }

      return {
        ...prev,
        status: 'feedback',
        score: newScore,
        streak: newStreak_,
        maxStreak: newMax,
        lastAnswer: answer,
      }
    })
  }, [])

  // ─── Next round ──────────────────────────────────────────────────────────────

  const nextRound = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'feedback') return prev

      const target = pickNextTarget()
      usedSlugsRef.current.add(target.slug)
      const round = generateRound(poolRef.current, target, SURVIVAL_DIFFICULTY, variantRef.current)
      roundStartTime.current = Date.now()

      return {
        ...prev,
        status: 'playing',
        round,
        roundNumber: prev.roundNumber + 1,
        lastAnswer: null,
      }
    })
  }, [pickNextTarget])

  // ─── Timer expired ────────────────────────────────────────────────────────────

  const timeExpired = useCallback(() => {
    submitAnswer('__timeout__')
  }, [submitAnswer])

  // ─── Reset ────────────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      round: null,
      roundNumber: 0,
      score: 0,
      streak: 0,
      maxStreak: 0,
      lastAnswer: null,
      savedEntry: null,
    })
  }, [])

  return {
    state,
    startSurvival,
    submitAnswer,
    nextRound,
    timeExpired,
    reset,
    timeLimit: TIME_LIMIT,
  }
}
