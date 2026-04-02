'use client'

import { useState, useCallback, useRef } from 'react'
import type {
  GameState,
  GameSession,
  UserAnswer,
  Difficulty,
  VariantId,
  Celebrity,
} from '@/types/game'
import { generateSession } from '@/engine/questionGenerator'
import { validateAnswer } from '@/engine/answerValidator'
import { calculateScore } from '@/engine/scoreEngine'
import { nanoid } from '@/lib/utils'

const MAX_ROUNDS = 10

/**
 * Game hook for party / custom-pool games.
 * Identical to useGame but receives a fixed Celebrity[] pool instead of
 * pulling from ALL_CELEBRITIES, and the category is always 'custom'.
 */
export function usePartyGame(pool: Celebrity[]) {
  const [state, setState] = useState<GameState>({
    status: 'idle',
    session: null,
    lastAnswer: null,
  })

  const roundStartTime = useRef<number>(0)

  // ─── Start ────────────────────────────────────────────────────────────────

  const startGame = useCallback(
    (variant: VariantId, difficulty: Difficulty) => {
      const roundCount = Math.min(MAX_ROUNDS, pool.length)
      const rounds = generateSession(pool, variant, difficulty, 'custom', roundCount)

      if (rounds.length === 0) {
        console.warn('[usePartyGame] Not enough people for this configuration.')
        return
      }

      const session: GameSession = {
        id: nanoid(),
        variant,
        difficulty,
        category: 'custom',
        rounds,
        currentRoundIndex: 0,
        score: 0,
        streak: 0,
        maxStreak: 0,
        answers: [],
        startedAt: Date.now(),
      }

      setState({ status: 'playing', session, lastAnswer: null })
      roundStartTime.current = Date.now()
    },
    [pool]
  )

  // ─── Submit answer ────────────────────────────────────────────────────────

  const submitAnswer = useCallback((chosen: string) => {
    setState((prev) => {
      if (!prev.session || prev.status !== 'playing') return prev

      const { session } = prev
      const round = session.rounds[session.currentRoundIndex]
      const timeUsed = (Date.now() - roundStartTime.current) / 1000

      const correct = validateAnswer(round, chosen, session.difficulty)
      const { points, newStreak } = calculateScore(
        correct,
        session.difficulty,
        timeUsed,
        round.timeLimit,
        session.streak
      )

      const answer: UserAnswer = {
        roundId: round.id,
        correct,
        chosenSlug: session.difficulty !== 'expert' ? chosen : undefined,
        chosenText: session.difficulty === 'expert' ? chosen : undefined,
        timeUsed,
        pointsEarned: points,
      }

      const updatedSession: GameSession = {
        ...session,
        score: session.score + points,
        streak: correct ? newStreak : 0,
        maxStreak: Math.max(session.maxStreak, correct ? newStreak : session.streak),
        answers: [...session.answers, answer],
      }

      return { status: 'feedback', session: updatedSession, lastAnswer: answer }
    })
  }, [])

  // ─── Next round ───────────────────────────────────────────────────────────

  const nextRound = useCallback(() => {
    setState((prev) => {
      if (!prev.session) return prev

      const nextIndex = prev.session.currentRoundIndex + 1
      if (nextIndex >= prev.session.rounds.length) {
        return {
          ...prev,
          status: 'complete',
          session: { ...prev.session, completedAt: Date.now() },
        }
      }

      roundStartTime.current = Date.now()
      return {
        ...prev,
        status: 'playing',
        session: { ...prev.session, currentRoundIndex: nextIndex },
        lastAnswer: null,
      }
    })
  }, [])

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const timeExpired = useCallback(() => submitAnswer('__timeout__'), [submitAnswer])
  const resetGame   = useCallback(
    () => setState({ status: 'idle', session: null, lastAnswer: null }),
    []
  )

  return { state, startGame, submitAnswer, nextRound, timeExpired, resetGame }
}
