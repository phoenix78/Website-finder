interface JsonLdProps {
  data: Record<string, unknown>
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 0),
      }}
    />
  )
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Celebrity Quiz',
    description:
      'Jeu de quiz sur les célébrités : acteurs, musiciens, sportifs et politiciens. Testez vos connaissances !',
    inLanguage: 'fr',
    genre: 'Quiz / Jeu',
  }
}
