import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/scores — global leaderboard (public)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('mode') ?? 'classic'
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100)

  const scores = await prisma.score.findMany({
    where: { mode },
    orderBy: { score: 'desc' },
    take: limit,
    include: {
      user: { select: { pseudo: true, name: true, image: true } },
    },
  })

  return NextResponse.json(scores)
}

// POST /api/scores — save a score (requires auth)
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { score, grade, variant, difficulty, category, correct, total, maxStreak, avgTime, mode, survivalRounds } = body

    if (score === undefined || !grade || !variant || !difficulty || correct === undefined || total === undefined) {
      return NextResponse.json({ error: 'Données manquantes.' }, { status: 400 })
    }

    const saved = await prisma.score.create({
      data: {
        userId: session.user.id,
        score: Number(score),
        grade,
        variant,
        difficulty,
        category: category ?? 'all',
        correct: Number(correct),
        total: Number(total),
        maxStreak: Number(maxStreak ?? 0),
        avgTime: avgTime ? Number(avgTime) : null,
        mode: mode ?? 'classic',
        survivalRounds: survivalRounds ? Number(survivalRounds) : null,
      },
    })

    return NextResponse.json(saved, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
