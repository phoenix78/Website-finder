'use client'

import { useT } from '@/i18n'

export function Footer() {
  const { t } = useT()

  return (
    <footer className="mt-auto border-t border-game-border py-6 text-center text-sm text-game-muted transition-colors duration-200">
      <p>© {new Date().getFullYear()} Celebrity Quiz — {t('footer.tagline')}</p>
      <p className="mt-1 text-xs">
        {t('footer.demo_notice')}{' '}
        <code className="text-game-accent">/src/data/celebrities/</code>
      </p>
    </footer>
  )
}
