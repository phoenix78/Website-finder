'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { encodePartyConfig, PARTY_MIN_PEOPLE } from '@/lib/party'
import type { PartyConfig, PartyPerson, PartyVariant, PartyDifficulty } from '@/types/party'
import { useT } from '@/i18n'
import { Button } from '@/components/ui/Button'
import { cn, nanoid } from '@/lib/utils'

// ── Types for the form ───────────────────────────────────────────────────────

interface PersonRow {
  id: string
  name: string
  photoUrl: string
  aliases: string
  photoError: boolean
}

const VARIANTS: { id: PartyVariant; icon: string; labelKey: string }[] = [
  { id: 'ptn', icon: '📸', labelKey: 'variant.photo-to-name.label' },
  { id: 'ntp', icon: '🏷️', labelKey: 'variant.name-to-photo.label' },
]

const DIFFICULTIES: { id: PartyDifficulty; color: string; labelKey: string; descKey: string }[] = [
  { id: 'e', color: 'border-green-500 text-green-500',  labelKey: 'difficulty.easy.label',   descKey: 'difficulty.easy.desc'   },
  { id: 'm', color: 'border-yellow-500 text-yellow-500', labelKey: 'difficulty.medium.label', descKey: 'difficulty.medium.desc' },
  { id: 'x', color: 'border-red-500 text-red-500',      labelKey: 'difficulty.expert.label', descKey: 'difficulty.expert.desc' },
]

function emptyPerson(): PersonRow {
  return { id: nanoid(6), name: '', photoUrl: '', aliases: '', photoError: false }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function CreatePartyPage() {
  const { t } = useT()
  const router = useRouter()

  const [title,      setTitle]      = useState('')
  const [variant,    setVariant]    = useState<PartyVariant>('ptn')
  const [difficulty, setDifficulty] = useState<PartyDifficulty>('e')
  const [people,     setPeople]     = useState<PersonRow[]>([emptyPerson(), emptyPerson(), emptyPerson(), emptyPerson()])
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [copied,     setCopied]     = useState(false)

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const validPeople = people.filter(
    (p) => p.name.trim() && p.photoUrl.match(/^https?:\/\/.+/) && !p.photoError
  )
  const canGenerate = validPeople.length >= PARTY_MIN_PEOPLE

  const updatePerson = useCallback((id: string, patch: Partial<PersonRow>) => {
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }, [])

  const addPerson = () => setPeople((prev) => [...prev, emptyPerson()])

  const removePerson = (id: string) =>
    setPeople((prev) => (prev.length > PARTY_MIN_PEOPLE ? prev.filter((p) => p.id !== id) : prev))

  const generateLink = () => {
    const config: PartyConfig = {
      v: variant,
      d: difficulty,
      t: title.trim() || undefined,
      p: validPeople.map((p): PartyPerson => ({
        n: p.name.trim(),
        i: p.photoUrl.trim(),
        a: p.aliases.trim()
          ? p.aliases.split(',').map((s) => s.trim()).filter(Boolean)
          : undefined,
      })),
    }
    const encoded = encodePartyConfig(config)
    const url = `${window.location.origin}/party?g=${encoded}`
    setGeneratedLink(url)
    setCopied(false)
  }

  const copyLink = async () => {
    if (!generatedLink) return
    await navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const playNow = () => {
    if (!generatedLink) return
    const url = new URL(generatedLink)
    router.push(`/party?g=${url.searchParams.get('g')}`)
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto animate-fade-in pb-16">

      {/* Header */}
      <section className="text-center pt-4">
        <div className="text-5xl mb-3">🔒</div>
        <h1 className="text-2xl sm:text-3xl font-black text-game-text mb-2">
          {t('party.create_title')}
        </h1>
        <p className="text-game-muted text-sm max-w-sm mx-auto">
          {t('party.create_subtitle')}
        </p>
      </section>

      {/* Title */}
      <section className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-game-muted uppercase tracking-widest">
          {t('party.party_title_label')}
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setGeneratedLink(null) }}
          placeholder={t('party.party_title_placeholder')}
          maxLength={60}
          className="w-full bg-game-card border border-game-border rounded-xl px-4 py-3 text-game-text placeholder:text-game-muted text-sm focus:outline-none focus:ring-2 focus:ring-game-accent focus:border-transparent transition"
        />
      </section>

      {/* Variant */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-game-muted uppercase tracking-widest">
          {t('home.step1')}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {VARIANTS.map((v) => (
            <button
              key={v.id}
              onClick={() => { setVariant(v.id); setGeneratedLink(null) }}
              aria-pressed={variant === v.id}
              className={cn(
                'flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-game-accent',
                variant === v.id
                  ? 'border-game-accent bg-game-accent/10'
                  : 'border-game-border bg-game-card hover:border-game-accent/50'
              )}
            >
              <span className="text-2xl">{v.icon}</span>
              <span className="font-semibold text-game-text text-sm">{t(v.labelKey)}</span>
              {variant === v.id && <span className="ml-auto text-game-accent">✓</span>}
            </button>
          ))}
        </div>
      </section>

      {/* Difficulty */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-game-muted uppercase tracking-widest">
          {t('home.step2')}
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              onClick={() => { setDifficulty(d.id); setGeneratedLink(null) }}
              aria-pressed={difficulty === d.id}
              className={cn(
                'flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-game-accent',
                difficulty === d.id
                  ? `${d.color} bg-game-card shadow-lg`
                  : 'border-game-border bg-game-card hover:border-game-accent/50 text-game-text'
              )}
            >
              <span className="font-bold text-sm">{t(d.labelKey)}</span>
              <span className="text-xs text-game-muted">{t(d.descKey)}</span>
            </button>
          ))}
        </div>
      </section>

      {/* People list */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-game-muted uppercase tracking-widest">
            {t('party.people_list')} ({validPeople.length}/{people.length})
          </h2>
          <span className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            canGenerate
              ? 'bg-green-500/20 text-green-500'
              : 'bg-red-500/20 text-red-500'
          )}>
            {canGenerate ? '✓' : t('party.min_people', { n: String(PARTY_MIN_PEOPLE) })}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {people.map((person, idx) => (
            <PersonEntry
              key={person.id}
              person={person}
              index={idx}
              canRemove={people.length > PARTY_MIN_PEOPLE}
              t={t}
              onChange={(patch) => { updatePerson(person.id, patch); setGeneratedLink(null) }}
              onRemove={() => { removePerson(person.id); setGeneratedLink(null) }}
            />
          ))}
        </div>

        <button
          onClick={addPerson}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-dashed border-game-border text-game-muted hover:border-game-accent hover:text-game-accent transition-all text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-game-accent"
        >
          + {t('party.add_person')}
        </button>
      </section>

      {/* Generate button */}
      <Button
        onClick={generateLink}
        disabled={!canGenerate}
        size="lg"
        className="w-full"
      >
        {t('party.generate_link')}
      </Button>

      {/* Generated link */}
      {generatedLink && (
        <section className="flex flex-col gap-4 p-5 bg-game-card border border-game-accent/30 rounded-2xl animate-fade-in">
          <p className="text-sm font-semibold text-game-text">{t('party.link_ready')}</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={generatedLink}
              className="flex-1 bg-game-bg border border-game-border rounded-xl px-3 py-2 text-game-muted text-xs font-mono focus:outline-none"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={copyLink} variant="secondary" size="lg" className="flex-1">
              {copied ? `✓ ${t('party.link_copied')}` : t('party.copy_link')}
            </Button>
            <Button onClick={playNow} size="lg" className="flex-1">
              {t('party.play_now')}
            </Button>
          </div>
        </section>
      )}

      {/* Back link */}
      <div className="flex justify-center">
        <Link href="/" className="text-sm text-game-muted hover:text-game-text transition-colors">
          {t('common.back_home')}
        </Link>
      </div>
    </div>
  )
}

// ── Person entry row ─────────────────────────────────────────────────────────

function PersonEntry({
  person,
  index,
  canRemove,
  t,
  onChange,
  onRemove,
}: {
  person: PersonRow
  index: number
  canRemove: boolean
  t: (key: string, vars?: Record<string, string>) => string
  onChange: (patch: Partial<PersonRow>) => void
  onRemove: () => void
}) {
  const isValid = person.name.trim() && person.photoUrl.match(/^https?:\/\/.+/) && !person.photoError

  return (
    <div className={cn(
      'flex gap-3 p-3 rounded-2xl border-2 transition-all',
      isValid ? 'border-game-border' : 'border-game-border/50'
    )}>
      {/* Photo preview */}
      <div className="relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-game-bg border border-game-border">
        {person.photoUrl && !person.photoError ? (
          <Image
            src={person.photoUrl}
            alt={person.name || `Person ${index + 1}`}
            fill
            className="object-cover"
            onError={() => onChange({ photoError: true })}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl text-game-muted">
            {person.photoError ? '⚠️' : '👤'}
          </div>
        )}
      </div>

      {/* Fields */}
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <input
          type="text"
          value={person.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder={t('party.person_name')}
          className="w-full bg-game-bg border border-game-border rounded-lg px-3 py-1.5 text-game-text placeholder:text-game-muted text-sm focus:outline-none focus:ring-2 focus:ring-game-accent focus:border-transparent transition"
        />
        <input
          type="url"
          value={person.photoUrl}
          onChange={(e) => onChange({ photoUrl: e.target.value, photoError: false })}
          placeholder={t('party.person_photo')}
          className={cn(
            'w-full bg-game-bg border rounded-lg px-3 py-1.5 text-game-text placeholder:text-game-muted text-sm focus:outline-none focus:ring-2 focus:ring-game-accent focus:border-transparent transition',
            person.photoError ? 'border-red-500' : 'border-game-border'
          )}
        />
        <input
          type="text"
          value={person.aliases}
          onChange={(e) => onChange({ aliases: e.target.value })}
          placeholder={t('party.person_aliases')}
          className="w-full bg-game-bg border border-game-border rounded-lg px-3 py-1.5 text-game-muted placeholder:text-game-muted text-xs focus:outline-none focus:ring-2 focus:ring-game-accent focus:border-transparent transition"
        />
      </div>

      {/* Remove */}
      {canRemove && (
        <button
          onClick={onRemove}
          aria-label="Remove"
          className="self-start p-1.5 rounded-lg text-game-muted hover:text-red-500 hover:bg-red-500/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          ✕
        </button>
      )}
    </div>
  )
}
