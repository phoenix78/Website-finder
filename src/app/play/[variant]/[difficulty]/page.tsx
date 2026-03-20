import type { Metadata } from 'next'
import type { VariantId, Difficulty } from '@/types/game'
import { GameRegistry } from '@/game-registry'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import { PlayClient } from './PlayClient'

interface PageParams {
  variant: VariantId
  difficulty: Difficulty
}

// ─── Static params generation for static export ───────────────────────────────

export function generateStaticParams(): PageParams[] {
  const variants: VariantId[] = ['photo-to-name', 'name-to-photo', 'body-part']
  const difficulties: Difficulty[] = ['easy', 'medium', 'expert']
  const params: PageParams[] = []

  for (const variant of variants) {
    for (const difficulty of difficulties) {
      params.push({ variant, difficulty })
    }
  }

  return params
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

const VARIANT_LABELS: Record<string, string> = {
  'photo-to-name': 'Photo → Nom',
  'name-to-photo': 'Nom → Photo',
  'body-part': 'Partie du corps',
}

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Facile',
  medium: 'Intermédiaire',
  expert: 'Expert',
}

export function generateMetadata({ params }: { params: PageParams }): Metadata {
  const variantLabel = VARIANT_LABELS[params.variant] ?? params.variant
  const diffLabel = DIFFICULTY_LABELS[params.difficulty] ?? params.difficulty

  return {
    title: `${variantLabel} — ${diffLabel}`,
    description: `Jouez en mode "${variantLabel}" niveau ${diffLabel} sur Celebrity Quiz.`,
    robots: { index: false },
  }
}

// ─── Page (server component — no searchParams access) ─────────────────────────

export default function PlayPage({ params }: { params: PageParams }) {
  const { variant, difficulty } = params

  const validVariants: VariantId[] = ['photo-to-name', 'name-to-photo', 'body-part']
  const validDiffs: Difficulty[] = ['easy', 'medium', 'expert']

  if (!validVariants.includes(variant) || !validDiffs.includes(difficulty)) {
    return (
      <div className="text-center py-20">
        <p className="text-game-muted">Configuration invalide.</p>
        <Link href="/" className="text-game-accent underline mt-2 inline-block">
          Retour à l&apos;accueil
        </Link>
      </div>
    )
  }

  const variantDef = GameRegistry.get(variant)

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link
          href="/"
          className="text-sm text-game-muted hover:text-game-text transition-colors"
        >
          ← Accueil
        </Link>
        <span className="text-game-border">/</span>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="info">
            {variantDef.icon} {VARIANT_LABELS[variant]}
          </Badge>
          <Badge variant={difficulty as 'easy' | 'medium' | 'expert'}>
            {DIFFICULTY_LABELS[difficulty]}
          </Badge>
        </div>
      </div>

      {/* Client component reads ?category from URL */}
      <PlayClient variant={variant} difficulty={difficulty} />
    </div>
  )
}
