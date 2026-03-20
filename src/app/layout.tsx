import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { JsonLd, websiteJsonLd } from '@/components/seo/JsonLd'

// Initialize game registry at module load time (server + client)
import '@/game-registry'

export const metadata: Metadata = {
  metadataBase: new URL('https://celebrity-quiz.example.com'),
  title: {
    default: 'Celebrity Quiz — Testez vos connaissances',
    template: '%s | Celebrity Quiz',
  },
  description:
    'Quiz de célébrités interactif : reconnaissez acteurs, musiciens, sportifs et politiciens grâce à leurs photos. Plusieurs modes de jeu et niveaux de difficulté.',
  keywords: [
    'celebrity quiz',
    'quiz célébrités',
    'jeu célébrités',
    'deviner célébrité',
    'quiz photo',
    'quiz acteurs',
    'quiz musiciens',
    'quiz sportifs',
  ],
  authors: [{ name: 'Celebrity Quiz' }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    title: 'Celebrity Quiz — Testez vos connaissances',
    description:
      'Reconnaissez des célébrités à partir de leurs photos. Quiz interactif avec plusieurs modes et difficultés.',
    siteName: 'Celebrity Quiz',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Celebrity Quiz',
    description: 'Quiz de célébrités interactif avec photos',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0f1e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <JsonLd data={websiteJsonLd()} />
      </head>
      <body className="flex flex-col min-h-dvh">
        <Header />
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
