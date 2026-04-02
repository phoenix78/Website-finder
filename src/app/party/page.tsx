import { Suspense } from 'react'
import { PartyClient } from './PartyClient'

export const metadata = {
  title: 'Partie privée',
  robots: { index: false, follow: false },
}

export default function PartyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20 text-game-muted animate-pulse">
          Chargement de la partie…
        </div>
      }
    >
      <PartyClient />
    </Suspense>
  )
}
