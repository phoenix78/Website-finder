# Celebrity Quiz

> Interactive celebrity guessing game — Next.js 14 · TypeScript · Tailwind CSS
>
> Auto-generated — updated after each Claude session. Last updated: 2026-04-03



---

## What is it?

A web-based quiz game where you identify celebrities through three different game modes, five difficulty levels, and five languages. No account required — everything runs in the browser.

**Live game modes**:
- **Photo → Name**: See a photo, guess who it is
- **Name → Photo**: See a name, pick the right photo
- **Body Part**: Identify a celebrity from eyes, hands, or silhouette
- **Survival**: Infinite rounds — one mistake ends the game
- **Private Game**: Create a custom quiz with your own people, share the link

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → http://localhost:3000

# Production build (Node.js server)
npm run build
npm start
```

---

## Tech Stack

| | |
|---|---|
| **Framework** | Next.js 14 (App Router, Node.js server) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3 + CSS custom properties |
| **State** | React hooks (no external lib) |
| **Persistence** | localStorage (scores, theme, language) |
| **Images** | next/image (wikimedia + local SVG fallback) |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx           # Home (variant / difficulty / category selector)
│   ├── play/[v]/[d]/      # Classic game
│   ├── survival/          # Survival mode
│   ├── create/            # Private party creator
│   └── party/             # Private party player (?g=<base64>)
├── components/
│   ├── game/              # GameShell, PartyGameShell, SurvivalShell, ResultScreen, RoundFeedback
│   ├── variants/          # PhotoToName, NameToPhoto, BodyPart
│   ├── ui/                # Button, Timer, ProgressBar, Leaderboard, …
│   └── layout/            # Header, Footer
├── engine/                # Pure game logic (score, questions, validation)
├── hooks/                 # useGame, useSurvival, usePartyGame
├── data/                  # Celebrity JSON files (22 celebrities)
├── game-registry/         # Plugin-style variant system
├── i18n/                  # Translations (en, fr, de, es, it)
├── lib/                   # Utility functions + leaderboard + party
└── types/                 # Shared TypeScript types (game.ts, party.ts)
```

---

## Game Details

### Categories
| Category | Count |
|----------|-------|
| Actors | 7 |
| Musicians | 6 |
| Athletes | 5 |
| Politicians | 4 |

### Difficulties
| Difficulty | Choices | Timer | Base score |
|------------|---------|-------|------------|
| Easy | 2 choices | 30–35s | 10 pts |
| Medium | 4 choices | 25–30s | 20 pts |
| Expert | Free text | 45–50s | 50 pts |

### Scoring
- **Time bonus**: up to +50% for fast answers
- **Streak multiplier**: up to ×2 for 6+ consecutive correct answers
- **Grades**: S (≥95%) · A (≥80%) · B (≥60%) · C (≥40%) · D (<40%)

---

## Languages

🇬🇧 English · 🇫🇷 French · 🇩🇪 German · 🇪🇸 Spanish · 🇮🇹 Italian

Language preference is saved automatically in `localStorage`.

---

## Deployment

### Docker

```bash
docker-compose up --build
```

### Netlify

Push to `main` — auto-deploys via `netlify.toml`.

### Nginx

Use `nginx.conf.example` to serve the `/out` static export.

---

## Private Party Mode

Create a custom game with any people you choose (celebrities or private individuals):

1. Go to **`/create`** (or click "Private Game" on the home page)
2. Enter a title (optional) and choose variant + difficulty
3. Add 4+ people with a name and a photo URL each
4. Click **Generate link** — a shareable `/party?g=<code>` URL is created
5. Share the link — anyone with it can play (no account required)

The entire game config is encoded in the URL (base64 JSON) — **no server needed**.
Scores from private games are not saved to the leaderboard.

---

## Adding Content

### New celebrity

1. Create `src/data/celebrities/{category}/{slug}.json`
2. Add image to `public/celebrities/{category}/{slug}.jpg`

No code changes needed — the celebrity is automatically included.

### New game variant

1. Add `VariantId` to `src/types/game.ts`
2. Create `src/game-registry/variants/{id}.ts`
3. Create `src/components/variants/{Name}.tsx`
4. Register in `src/game-registry/index.ts`

See [docs/PROJECT.md](docs/PROJECT.md) for the full guide.

---

## Documentation

| File | Content |
|------|---------|
| [`docs/FUNCTIONS.md`](docs/FUNCTIONS.md) | All functions, hooks, components with signatures and descriptions |
| [`docs/PROJECT.md`](docs/PROJECT.md) | Architecture, data model, routing, i18n, theming, how-to guides |

---

## Scripts

```bash
npm run dev      # Dev server
npm run build    # Static export
npm run lint     # ESLint
```

```bash
make build       # Docker build
make up          # Start containers
make down        # Stop containers
make logs        # Follow logs
```
