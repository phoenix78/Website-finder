import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { JsonLd, websiteJsonLd } from '@/components/seo/JsonLd'
import { ThemeProvider, THEME_SCRIPT } from '@/contexts/theme'
import { I18nProvider } from '@/i18n'

// Initialize game registry once at module load
import '@/game-registry'

export const metadata: Metadata = {
  metadataBase: new URL('https://celebrity-quiz.example.com'),
  title: {
    default: 'Celebrity Quiz — Testez vos connaissances',
    template: '%s | Celebrity Quiz',
  },
  description:
    'Quiz de célébrités interactif : reconnaissez acteurs, musiciens, sportifs et politiciens grâce à leurs photos. Plusieurs modes de jeu et niveaux de difficulté.',
  keywords: ['celebrity quiz', 'quiz célébrités', 'jeu célébrités', 'deviner célébrité', 'quiz photo'],
  authors: [{ name: 'Celebrity Quiz' }],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    title: 'Celebrity Quiz — Testez vos connaissances',
    description: 'Reconnaissez des célébrités à partir de leurs photos.',
    siteName: 'Celebrity Quiz',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Celebrity Quiz',
    description: 'Quiz de célébrités interactif avec photos',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)',  color: '#0a0f1e' },
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Anti-FOUC: apply theme class before React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <JsonLd data={websiteJsonLd()} />
      </head>
      <body className="flex flex-col min-h-dvh">
        <ThemeProvider>
          <I18nProvider>
            <Header />
            <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
