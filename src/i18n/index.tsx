'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

// ─── Locale type ──────────────────────────────────────────────────────────────

export type Locale = 'en' | 'fr' | 'de' | 'es' | 'it'

export const LOCALES: Locale[] = ['en', 'fr', 'de', 'es', 'it']

export const LOCALE_FLAGS: Record<Locale, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  de: '🇩🇪',
  es: '🇪🇸',
  it: '🇮🇹',
}

// ─── Lazy-load translations ───────────────────────────────────────────────────

type TranslationDict = Record<string, unknown>

const cache: Partial<Record<Locale, TranslationDict>> = {}

async function loadLocale(locale: Locale): Promise<TranslationDict> {
  if (cache[locale]) return cache[locale]!
  const mod = await import(`./locales/${locale}.json`)
  cache[locale] = mod.default as TranslationDict
  return cache[locale]!
}

// ─── t() helper: get nested key with optional {param} interpolation ──────────

function resolve(dict: TranslationDict, path: string): string {
  const parts = path.split('.')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let node: any = dict
  for (const p of parts) {
    if (node == null || typeof node !== 'object') return path
    node = node[p]
  }
  return typeof node === 'string' ? node : path
}

function interpolate(template: string, params?: Record<string, string>): string {
  if (!params) return template
  return Object.entries(params).reduce(
    (str, [k, v]) => str.replace(new RegExp(`\\{${k}\\}`, 'g'), v),
    template
  )
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface I18nContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string, params?: Record<string, string>) => string
  ready: boolean
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'fr',
  setLocale: () => {},
  t: (key) => key,
  ready: false,
})

// ─── Provider ─────────────────────────────────────────────────────────────────

const LS_KEY = 'celebrity-quiz-locale'

function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'fr'
  const stored = localStorage.getItem(LS_KEY) as Locale | null
  if (stored && LOCALES.includes(stored)) return stored
  // Browser language hint
  const lang = navigator.language.slice(0, 2) as Locale
  return LOCALES.includes(lang) ? lang : 'fr'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr')
  const [dict, setDict] = useState<TranslationDict>({})
  const [ready, setReady] = useState(false)

  // Load translations on mount and on locale change
  useEffect(() => {
    const detected = detectLocale()
    setLocaleState(detected)
    loadLocale(detected).then((d) => {
      setDict(d)
      setReady(true)
    })
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem(LS_KEY, l)
    setReady(false)
    loadLocale(l).then((d) => {
      setDict(d)
      setReady(true)
    })
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, string>) =>
      interpolate(resolve(dict, key), params),
    [dict]
  )

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, ready }}>
      {children}
    </I18nContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useT() {
  return useContext(I18nContext)
}
