'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [pseudo, setPseudo] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pseudo, email, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erreur lors de l\'inscription.')
      setLoading(false)
      return
    }

    // Auto-login after registration
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      router.push('/login')
    } else {
      router.push('/')
      router.refresh()
    }
  }

  async function handleGoogle() {
    await signIn('google', { callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div
          className="rounded-2xl p-8 shadow-xl"
          style={{ background: 'rgb(var(--game-card))' }}
        >
          <h1
            className="text-2xl font-bold text-center mb-6"
            style={{ color: 'rgb(var(--game-text))' }}
          >
            Créer un compte
          </h1>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/40 px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: 'rgb(var(--game-text) / 0.7)' }}
              >
                Pseudo
              </label>
              <input
                type="text"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                required
                minLength={2}
                maxLength={30}
                className="w-full rounded-lg px-4 py-2.5 text-sm outline-none border focus:border-indigo-500 transition-colors"
                style={{
                  background: 'rgb(var(--game-bg))',
                  color: 'rgb(var(--game-text))',
                  borderColor: 'rgb(var(--game-text) / 0.15)',
                }}
                placeholder="MonPseudo"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: 'rgb(var(--game-text) / 0.7)' }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg px-4 py-2.5 text-sm outline-none border focus:border-indigo-500 transition-colors"
                style={{
                  background: 'rgb(var(--game-bg))',
                  color: 'rgb(var(--game-text))',
                  borderColor: 'rgb(var(--game-text) / 0.15)',
                }}
                placeholder="vous@exemple.com"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: 'rgb(var(--game-text) / 0.7)' }}
              >
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg px-4 py-2.5 text-sm outline-none border focus:border-indigo-500 transition-colors"
                style={{
                  background: 'rgb(var(--game-bg))',
                  color: 'rgb(var(--game-text))',
                  borderColor: 'rgb(var(--game-text) / 0.15)',
                }}
                placeholder="Min. 6 caractères"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-semibold text-sm transition-opacity disabled:opacity-60"
              style={{
                background: 'rgb(var(--game-accent))',
                color: '#fff',
              }}
            >
              {loading ? 'Création…' : 'Créer mon compte'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div
              className="flex-1 h-px"
              style={{ background: 'rgb(var(--game-text) / 0.15)' }}
            />
            <span
              className="text-xs"
              style={{ color: 'rgb(var(--game-text) / 0.4)' }}
            >
              ou
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: 'rgb(var(--game-text) / 0.15)' }}
            />
          </div>

          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg border text-sm font-medium transition-colors hover:opacity-80"
            style={{
              borderColor: 'rgb(var(--game-text) / 0.2)',
              color: 'rgb(var(--game-text))',
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuer avec Google
          </button>

          <p
            className="mt-6 text-center text-sm"
            style={{ color: 'rgb(var(--game-text) / 0.5)' }}
          >
            Déjà un compte ?{' '}
            <Link
              href="/login"
              className="underline hover:opacity-80"
              style={{ color: 'rgb(var(--game-accent))' }}
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
