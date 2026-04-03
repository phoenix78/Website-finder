'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export function AuthButton() {
  const { data: session, status } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  if (status === 'loading') {
    return (
      <div
        className="w-8 h-8 rounded-full animate-pulse"
        style={{ background: 'rgb(var(--game-card))' }}
      />
    )
  }

  if (!session) {
    return (
      <Link
        href="/login"
        className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
        style={{
          background: 'rgb(var(--game-accent))',
          color: '#fff',
        }}
      >
        Connexion
      </Link>
    )
  }

  const displayName = session.user.name ?? session.user.email ?? 'Profil'
  const initial = displayName[0].toUpperCase()

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full focus:outline-none"
        aria-label="Menu utilisateur"
      >
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt={displayName}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{
              background: 'rgb(var(--game-accent))',
              color: '#fff',
            }}
          >
            {initial}
          </div>
        )}
        <span
          className="hidden sm:inline text-sm font-medium max-w-[100px] truncate"
          style={{ color: 'rgb(var(--game-text))' }}
        >
          {displayName}
        </span>
      </button>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="absolute right-0 mt-2 w-48 rounded-xl shadow-xl z-20 py-1 border"
            style={{
              background: 'rgb(var(--game-card))',
              borderColor: 'rgb(var(--game-text) / 0.1)',
            }}
          >
            <div
              className="px-4 py-2 text-xs truncate"
              style={{ color: 'rgb(var(--game-text) / 0.5)' }}
            >
              {session.user.email}
            </div>
            <div
              className="my-1 h-px"
              style={{ background: 'rgb(var(--game-text) / 0.1)' }}
            />
            <Link
              href="/profile"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 text-sm hover:opacity-70 transition-opacity"
              style={{ color: 'rgb(var(--game-text))' }}
            >
              Mon profil
            </Link>
            <button
              onClick={() => {
                setMenuOpen(false)
                signOut({ callbackUrl: '/' })
              }}
              className="w-full text-left px-4 py-2 text-sm hover:opacity-70 transition-opacity"
              style={{ color: 'rgb(var(--game-text))' }}
            >
              Se déconnecter
            </button>
          </div>
        </>
      )}
    </div>
  )
}
