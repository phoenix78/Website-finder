import type { Metadata } from 'next'
import { SurvivalShell } from '@/components/game/SurvivalShell'

export const metadata: Metadata = {
  title: 'Survival Mode — Celebrity Quiz',
  description: 'Infinite chrono mode: answer as many questions as possible before your first mistake. One wrong answer = game over.',
}

export default function SurvivalPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <SurvivalShell />
    </div>
  )
}
