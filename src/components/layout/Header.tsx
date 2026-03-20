import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LanguageSelector } from '@/components/ui/LanguageSelector'

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-game-bg/80 backdrop-blur-md border-b border-game-border transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-game-text hover:text-game-accent transition-colors shrink-0"
          aria-label="Celebrity Quiz — Accueil"
        >
          <span className="text-2xl" aria-hidden="true">🎭</span>
          <span className="hidden sm:inline">Celebrity Quiz</span>
        </Link>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <ThemeToggle />
        </div>

      </div>
    </header>
  )
}
