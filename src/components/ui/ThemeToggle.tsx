'use client'

import { useTheme } from '@/contexts/theme'
import { useT } from '@/i18n'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()
  const { t } = useT()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? t('theme.light') : t('theme.dark')}
      title={isDark ? t('theme.light') : t('theme.dark')}
      className={cn(
        'relative w-14 h-7 rounded-full border-2 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-game-accent focus-visible:ring-offset-2 focus-visible:ring-offset-game-bg',
        isDark
          ? 'bg-game-accent/20 border-game-accent/40'
          : 'bg-amber-100 border-amber-300',
        className
      )}
    >
      {/* Track icons */}
      <span className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none select-none text-xs">
        <span aria-hidden="true">🌙</span>
        <span aria-hidden="true">☀️</span>
      </span>

      {/* Thumb */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-0.5 w-5 h-5 rounded-full shadow-md transition-all duration-300',
          isDark
            ? 'left-0.5 bg-game-accent'
            : 'left-[calc(100%-1.375rem)] bg-amber-400'
        )}
      />
    </button>
  )
}
