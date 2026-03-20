'use client'

import { useState, useRef, useEffect } from 'react'
import { useT, LOCALES, LOCALE_FLAGS, type Locale } from '@/i18n'
import { cn } from '@/lib/utils'

export function LanguageSelector({ className }: { className?: string }) {
  const { locale, setLocale, t } = useT()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-game-border bg-game-card hover:border-game-accent/60 text-sm font-medium text-game-text transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-game-accent"
      >
        <span aria-hidden="true" className="text-base">{LOCALE_FLAGS[locale]}</span>
        <span className="hidden sm:inline uppercase text-xs font-bold text-game-muted">{locale}</span>
        <svg
          aria-hidden="true"
          className={cn('w-3 h-3 text-game-muted transition-transform duration-200', open && 'rotate-180')}
          viewBox="0 0 12 12"
          fill="none"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Language"
          className="absolute right-0 top-full mt-1.5 z-50 min-w-[9rem] bg-game-surface border border-game-border rounded-xl shadow-2xl overflow-hidden animate-scale-in"
        >
          {LOCALES.map((l: Locale) => (
            <li key={l} role="option" aria-selected={l === locale}>
              <button
                onClick={() => { setLocale(l); setOpen(false) }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left',
                  l === locale
                    ? 'bg-game-accent/15 text-game-accent font-semibold'
                    : 'text-game-text hover:bg-game-card'
                )}
              >
                <span aria-hidden="true" className="text-base">{LOCALE_FLAGS[l]}</span>
                <span>{t(`lang.${l}`)}</span>
                {l === locale && (
                  <span aria-hidden="true" className="ml-auto text-game-accent text-xs">✓</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
