# Project Documentation — Celebrity Quiz

> Auto-generated — updated after each Claude session.
> Last updated: 2026-04-02

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Directory Structure](#directory-structure)
4. [Tech Stack](#tech-stack)
5. [Game Variants](#game-variants)
6. [Scoring System](#scoring-system)
7. [Data Model](#data-model)
8. [State Management](#state-management)
9. [Routing](#routing)
10. [Internationalization](#internationalization)
11. [Theming](#theming)
12. [Leaderboard & Persistence](#leaderboard--persistence)
13. [Build & Deployment](#build--deployment)
14. [Adding a New Celebrity](#adding-a-new-celebrity)
15. [Adding a New Game Variant](#adding-a-new-game-variant)
16. [Adding a New Language](#adding-a-new-language)

---

## Overview

**Celebrity Quiz** is an interactive web game built with Next.js 14 where players identify celebrities through different game modes (photo → name, name → photo, body part recognition). The application supports 5 languages, dark/light themes, multiple difficulty levels, and persistent leaderboards.

**Current dataset**: 22 celebrities across 4 categories (actors, musicians, athletes, politicians).

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Next.js App Router               │
│  /              /play/[variant]/[difficulty]  /survival │
└──────────────────────────┬──────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │      Game Shell         │
              │  (GameShell / SurvivalShell) │
              └────────────┬────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   useGame /          Game Engine       Game Registry
   useSurvival    (question, score,    (variant definitions)
   (state hooks)   validator)
         │
         ▼
   Variant Components
   (PhotoToName / NameToPhoto / BodyPart)
         │
         ▼
   UI Components
   (Timer, ProgressBar, Button, ...)
```

**Key design decisions**:
- **Static export**: `output: 'export'` — the app is a pure client-side SPA (no server-side rendering needed)
- **No external API**: all celebrity data is embedded as JSON files
- **No auth**: leaderboard lives in `localStorage`
- **Plugin-style variant system**: adding new game modes doesn't require modifying core code

---

## Directory Structure

```
/
├── public/
│   └── celebrities/            # Celebrity images (SVG/JPG/WebP)
│       ├── actors/
│       ├── musicians/
│       ├── athletes/
│       └── politicians/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout (ThemeProvider, I18nProvider)
│   │   ├── page.tsx            # Home page
│   │   ├── globals.css         # CSS custom properties + base styles
│   │   ├── play/
│   │   │   └── [variant]/[difficulty]/
│   │   │       ├── page.tsx    # Static shell (generateStaticParams)
│   │   │       └── PlayClient.tsx  # 'use client' game component
│   │   └── survival/
│   │       └── page.tsx
│   ├── components/
│   │   ├── game/               # Game orchestration components
│   │   ├── variants/           # Game mode UI components
│   │   ├── ui/                 # Generic UI building blocks
│   │   ├── layout/             # Header, Footer
│   │   └── seo/                # JsonLd structured data
│   ├── contexts/
│   │   └── theme.tsx           # Dark/light theme context
│   ├── data/
│   │   ├── index.ts            # Celebrity data access functions
│   │   └── celebrities/        # JSON files per celebrity
│   │       ├── actors/
│   │       ├── musicians/
│   │       ├── athletes/
│   │       └── politicians/
│   ├── engine/                 # Pure game logic (no React)
│   │   ├── questionGenerator.ts
│   │   ├── answerValidator.ts
│   │   └── scoreEngine.ts
│   ├── game-registry/          # Variant plugin system
│   │   ├── index.ts            # Registration entry point
│   │   ├── registry.ts         # GameRegistry singleton
│   │   ├── types.ts            # GameVariantDefinition type
│   │   └── variants/           # Variant definitions
│   ├── hooks/
│   │   ├── useGame.ts          # Classic game state hook
│   │   └── useSurvival.ts      # Survival game state hook
│   ├── i18n/
│   │   ├── index.tsx           # I18nProvider + useI18n hook
│   │   └── locales/            # en.json, fr.json, de.json, es.json, it.json
│   ├── lib/
│   │   ├── utils.ts            # Shared utility functions
│   │   └── leaderboard.ts      # localStorage leaderboard management
│   └── types/
│       └── game.ts             # All shared TypeScript types
├── scripts/                    # Node.js utility scripts
├── docker/
├── docker-compose.yml
├── docker-compose.dev.yml
├── Dockerfile
├── Makefile
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── netlify.toml
└── nginx.conf.example
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 14.2.30 |
| Language | TypeScript | ^5 |
| UI | React | ^18.3 |
| Styling | Tailwind CSS | ^3.4 |
| Images | next/image | — |
| State | React hooks (useState/useReducer) | — |
| Persistence | localStorage | — |
| Build | Next.js static export | — |
| Deployment | Docker / Netlify / Nginx | — |

No external state management library. No database. No authentication.

---

## Game Variants

### `photo-to-name`
- Show a celebrity photo (face or full-body)
- User guesses the name
- Easy/Medium: multiple choice (2 or 4 options)
- Expert: free text input with fuzzy validation

### `name-to-photo`
- Show the celebrity name
- User picks the correct photo from 2 or 4 choices
- No expert mode (free text doesn't apply)

### `body-part`
- Show an isolated body part image (eyes, mouth, hands, silhouette, back)
- User guesses the celebrity
- Easy/Medium: multiple choice; Expert: free text

### Difficulty settings

| Difficulty | Choices | Time limit | Base score |
|------------|---------|------------|------------|
| Easy | 2 | 30–35s | 10 pts |
| Medium | 4 | 25–30s | 20 pts |
| Expert | free text | 45–50s | 50 pts |

### Categories

| ID | Celebrities |
|----|-------------|
| `actors` | 7 celebrities |
| `musicians` | 6 celebrities |
| `athletes` | 5 celebrities |
| `politicians` | 4 celebrities |
| `all` | 22 celebrities (mixed) |

---

## Scoring System

```
Round score = base_points × streak_multiplier + time_bonus

base_points:
  easy   = 10
  medium = 20
  expert = 50

time_bonus = base_points × 0.5 × (timeRemaining / timeLimit)

streak_multiplier:
  streak 0–1  → ×1.0
  streak 2–3  → ×1.25
  streak 4–5  → ×1.5
  streak 6+   → ×2.0

Grade thresholds (correct answers / total):
  S ≥ 95%   A ≥ 80%   B ≥ 60%   C ≥ 40%   D < 40%
```

Survival mode score accumulates indefinitely with no grade — only rounds survived matters.

---

## Data Model

### Celebrity JSON

```json
{
  "slug": "brad-pitt",
  "name": "Brad Pitt",
  "aliases": ["William Bradley Pitt", "Brad"],
  "category": "actors",
  "difficulty": "easy",
  "active": true,
  "nationality": "American",
  "birthYear": 1963,
  "description": "American actor and film producer",
  "images": [
    {
      "url": "/celebrities/actors/brad-pitt.jpg",
      "type": "face",
      "alt": "Brad Pitt — portrait",
      "width": 400,
      "height": 400
    }
  ]
}
```

- `slug`: URL-safe unique identifier
- `aliases`: Alternative names accepted by the fuzzy text validator
- `active`: Set to `false` to exclude a celebrity from the game without deleting the file
- `images[].type`: `"face"` | `"full-body"` | `"body-part"`
- Body-part images additionally have a `"bodyPart"` field: `"eyes"` | `"mouth"` | `"hands"` | `"silhouette"` | `"back"`

### Image files

Store images in: `public/celebrities/{category}/{slug}.{ext}`

Supported formats: `.jpg`, `.png`, `.svg`, `.webp`

Next.js `<Image>` serves images automatically in WebP to compatible browsers. Source format does not need to be WebP.

### Leaderboard entry (localStorage)

```typescript
interface LeaderboardEntry {
  id: string          // nanoid
  score: number
  grade: string       // 'S' | 'A' | 'B' | 'C' | 'D'
  variant: string
  difficulty: string
  correct: number
  total: number
  maxStreak: number
  date: string        // ISO 8601
  mode: 'classic' | 'survival'
  survivalRounds?: number
}
```

localStorage key: `celebrity-quiz-leaderboard`
Max entries: 100, sorted by score descending.

---

## State Management

All state is managed via React hooks — no Redux, Zustand, or similar library.

### Classic game lifecycle

```
idle ──startGame()──► playing ──submitAnswer()──► feedback
                         ▲                            │
                         └──────nextRound()───────────┘
                                     │
                              (last round) ──► complete
```

### Survival game lifecycle

```
idle ──startSurvival()──► playing ──submitAnswer()──► feedback ──nextRound()──► playing
                                         │
                                   (wrong answer)
                                         │
                                        dead
```

### Theme

`ThemeContext` (contexts/theme.tsx):
- Stores `'dark' | 'light'` in localStorage (`celebrity-quiz-theme`)
- Adds `.dark` class to `<html>` element
- Reads system preference on first visit
- Injected before React hydration via inline script to prevent FOUC

---

## Routing

Uses Next.js App Router with static export.

```
/                                   Home — game setup
/play/photo-to-name/easy            Classic game (2 choices, 30s)
/play/photo-to-name/medium          Classic game (4 choices, 25s)
/play/photo-to-name/expert          Classic game (free text, 45s)
/play/name-to-photo/easy            Name→Photo (2 choices, 30s)
/play/name-to-photo/medium          Name→Photo (4 choices, 25s)
/play/body-part/easy                Body part (2 choices, 35s)
/play/body-part/medium              Body part (4 choices, 30s)
/play/body-part/expert              Body part (free text, 50s)
/survival                           Infinite survival mode
```

Query param: `?category=actors|musicians|athletes|politicians|all`

---

## Internationalization

### Supported languages

| Code | Language | Flag |
|------|---------|------|
| `en` | English | 🇬🇧 |
| `fr` | French | 🇫🇷 |
| `de` | German | 🇩🇪 |
| `es` | Spanish | 🇪🇸 |
| `it` | Italian | 🇮🇹 |

### Adding a translation

1. Create `src/i18n/locales/{code}.json` copying `en.json` structure
2. Translate all values (do not change keys)
3. Add locale to the `LOCALES` array in `src/i18n/index.tsx`
4. Add flag emoji to `LanguageSelector.tsx`

### Using translations

```tsx
const { t } = useI18n()
t('game.score')                        // → "Score"
t('result.grade', { grade: 'S' })      // → "Grade: S" (with interpolation)
```

---

## Theming

CSS custom properties defined in `src/app/globals.css`:

```css
:root {
  --game-bg:     10, 15, 30;      /* dark background */
  --game-card:   20, 25, 45;      /* card background */
  --game-accent: 99, 102, 241;    /* primary indigo */
  --game-text:   248, 250, 252;   /* near-white text */
}

:root.light {
  --game-bg:     248, 250, 252;
  --game-card:   241, 245, 250;
  --game-accent: 79, 70, 229;
  --game-text:   15, 23, 42;
}
```

Tailwind config uses `rgb(var(--game-*) / <alpha>)` so opacity modifiers work transparently.

---

## Leaderboard & Persistence

All persistence is handled via `localStorage` — no backend required.

| Key | Value | Description |
|-----|-------|-------------|
| `celebrity-quiz-leaderboard` | `LeaderboardEntry[]` JSON | Game scores |
| `celebrity-quiz-locale` | `'en' \| 'fr' \| 'de' \| 'es' \| 'it'` | Selected language |
| `celebrity-quiz-theme` | `'dark' \| 'light'` | Theme preference |

---

## Build & Deployment

### Local development

```bash
npm install
npm run dev        # http://localhost:3000
```

### Production build

```bash
npm run build      # Static export → /out directory
```

### Docker

```bash
docker-compose up --build          # Production
docker-compose -f docker-compose.dev.yml up  # Development with hot reload
```

### Netlify

Push to main → auto-deploy via `netlify.toml` config.

### Nginx

Use `nginx.conf.example` as a reverse proxy config for serving the static `/out` directory.

### Makefile

Common targets:

```bash
make build    # Docker build
make up       # Start containers
make down     # Stop containers
make logs     # Follow logs
```

---

## Adding a New Celebrity

1. Create `src/data/celebrities/{category}/{slug}.json` following the schema above
2. Add the image to `public/celebrities/{category}/{slug}.jpg` (or .png/.webp)
3. The celebrity is automatically included in the game — no code changes needed

Set `"active": false` to temporarily exclude a celebrity.

---

## Adding a New Game Variant

1. Add the new `VariantId` to `src/types/game.ts`
2. Create `src/game-registry/variants/{id}.ts` with a `GameVariantDefinition`
3. Create `src/components/variants/{Name}.tsx` (implements the UI)
4. Register in `src/game-registry/index.ts`
5. Add routes to `generateStaticParams` in `src/app/play/[variant]/[difficulty]/page.tsx`
6. Add translations for the new variant in all 5 locale files

---

## Adding a New Language

1. Copy `src/i18n/locales/en.json` → `src/i18n/locales/{code}.json`
2. Translate all string values (never translate keys)
3. Add to `LOCALES` array in `src/i18n/index.tsx`
4. Add flag emoji to `LanguageSelector.tsx`
5. (Optional) Add locale to `hreflang` meta tags in `src/app/layout.tsx`
