'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import type { VariantId, Difficulty, CategoryId } from '@/types/game'
import { GameShell } from '@/components/game/GameShell'

interface PlayClientProps {
  variant: VariantId
  difficulty: Difficulty
}

function PlayClientInner({ variant, difficulty }: PlayClientProps) {
  const searchParams = useSearchParams()
  const category = (searchParams.get('category') as CategoryId) ?? 'all'

  return <GameShell variant={variant} difficulty={difficulty} category={category} />
}

export function PlayClient({ variant, difficulty }: PlayClientProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 rounded-full border-2 border-game-accent border-t-transparent" />
        </div>
      }
    >
      <PlayClientInner variant={variant} difficulty={difficulty} />
    </Suspense>
  )
}
