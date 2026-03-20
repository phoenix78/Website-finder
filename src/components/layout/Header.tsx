import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-game-bg/80 backdrop-blur-md border-b border-game-border">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-game-text hover:text-game-accent transition-colors"
          aria-label="Accueil Celebrity Quiz"
        >
          <span className="text-2xl" aria-hidden="true">🎭</span>
          <span>Celebrity Quiz</span>
        </Link>

        <nav aria-label="Navigation principale">
          <Link
            href="/"
            className="text-sm text-game-muted hover:text-game-text transition-colors px-3 py-1.5 rounded-lg hover:bg-game-card"
          >
            Jouer
          </Link>
        </nav>
      </div>
    </header>
  )
}
