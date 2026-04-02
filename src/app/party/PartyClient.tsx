'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { decodePartyConfig, partyConfigToCelebrities } from '@/lib/party'
import { PartyGameShell } from '@/components/game/PartyGameShell'
import { useT } from '@/i18n'

export function PartyClient() {
  const { t } = useT()
  const searchParams = useSearchParams()
  const encoded = searchParams.get('g')

  if (!encoded) {
    return <InvalidLink t={t} reason="missing" />
  }

  const config = decodePartyConfig(encoded)
  if (!config) {
    return <InvalidLink t={t} reason="invalid" />
  }

  const pool = partyConfigToCelebrities(config)

  return <PartyGameShell config={config} pool={pool} />
}

function InvalidLink({
  t,
  reason,
}: {
  t: (key: string) => string
  reason: string
}) {
  return (
    <div className="flex flex-col items-center gap-6 py-20 animate-fade-in text-center">
      <div className="text-6xl">🔗</div>
      <div>
        <h1 className="text-2xl font-bold text-game-text mb-2">
          {t('party.invalid_link')}
        </h1>
        <p className="text-game-muted text-sm max-w-xs mx-auto">
          {reason === 'missing'
            ? t('party.invalid_link_missing')
            : t('party.invalid_link_desc')}
        </p>
      </div>
      <Link
        href="/create"
        className="px-6 py-3 bg-game-accent hover:bg-game-accent-hover text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-game-accent"
      >
        {t('party.create_your_own')}
      </Link>
      <Link href="/" className="text-sm text-game-muted hover:text-game-text transition-colors">
        {t('common.back_home')}
      </Link>
    </div>
  )
}
