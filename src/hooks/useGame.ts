'use client'

import { useState, useCallback, useRef } from 'react'
import type {
  GameState,
  GameSession,
  UserAnswer,
  Difficulty,
  VariantId,
  CategoryId,
} from '@/types/game'
import { generateSession } from '@/engine/questionGenerator'
import { validateAnswer } from '@/engine/answerValidator'
import { calculateScore } from '@/engine/scoreEngine'
import { ALL_CELEBRITIES } from '@/data'
import { nanoid } from '@/lib/utils'

const ROUNDS_PER_SESSION = 10

export function useGame() {
  const [state, setState] = useState<GameState>({
    status: 'idle',
    session: null,
    lastAnswer: null,
  })

  const roundStartTime = useRef<number>(0)

  // ─── Start a new game ───────────────────────────────────────────────────────

  const startGame = useCallback(
    (variant: VariantId, difficulty: Difficulty, category: CategoryId) => {
      const rounds = generateSession(
        ALL_CELEBRITIES,
        variant,
        difficulty,
        category,
        ROUNDS_PER_SESSION
      )

      if (rounds.length === 0) {
        console.warn('[useGame] Not enough celebrities for this configuration.')
        return
      }

      const session: GameSession = {
        id: nanoid(),
        variant,
        difficulty,
        category,
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
    []
  )

  // ─── Submit an answer ───────────────────────────────────────────────────────

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

  // ─── Advance to next round ──────────────────────────────────────────────────

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

  // ─── Timer expired (auto-submit wrong answer) ───────────────────────────────

  const timeExpired = useCallback(() => {
    submitAnswer('__timeout__')
  }, [submitAnswer])

  // ─── Reset / back to home ───────────────────────────────────────────────────

  const resetGame = useCallback(() => {
    setState({ status: 'idle', session: null, lastAnswer: null })
  }, [])

  return {
    state,
    startGame,
    submitAnswer,
    nextRound,
    timeExpired,
    resetGame,
  }
}
