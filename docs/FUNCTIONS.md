# Functions Documentation

> Auto-generated — updated after each Claude session.
> Last updated: 2026-03-21

---

## Table of Contents

- [Engine](#engine)
  - [scoreEngine.ts](#scoreenginets)
  - [questionGenerator.ts](#questiongeneratorts)
  - [answerValidator.ts](#answervalidatorts)
- [Hooks](#hooks)
  - [useGame.ts](#usegamets)
  - [useSurvival.ts](#usesurvivalts)
- [Lib / Utilities](#lib--utilities)
  - [utils.ts](#utilsts)
  - [leaderboard.ts](#leaderboardts)
- [Data](#data)
  - [data/index.ts](#dataindexts)
- [i18n](#i18n)
  - [i18n/index.tsx](#i18nindextsx)
- [Game Registry](#game-registry)
  - [registry.ts](#registryts)
  - [Variant definitions](#variant-definitions)
- [Components — Game](#components--game)
  - [GameShell.tsx](#gameshelltsx)
  - [SurvivalShell.tsx](#survivalshelltsx)
  - [ResultScreen.tsx](#resultscreentsx)
  - [RoundFeedback.tsx](#roundfeedbacktsx)
- [Components — Variants](#components--variants)
  - [PhotoToName.tsx](#phototonaметsx)
  - [NameToPhoto.tsx](#nametophototsx)
  - [BodyPart.tsx](#bodyparttsx)
- [Components — UI](#components--ui)
- [Components — Layout](#components--layout)
- [App Pages](#app-pages)

---

## Engine

### `scoreEngine.ts`
`src/engine/scoreEngine.ts`

Handles all score and grade computation.

| Function | Signature | Description |
|----------|-----------|-------------|
| `getBasePoints` | `(difficulty: Difficulty) => number` | Returns base points per difficulty: Easy=10, Medium=20, Expert=50 |
| `getTimeBonus` | `(timeRemaining: number, timeLimit: number, basePoints: number) => number` | Calculates time bonus up to 50% of base points |
| `getStreakMultiplier` | `(streak: number) => number` | Returns streak multiplier: ×1 (0–1), ×1.25 (2–3), ×1.5 (4–5), ×2 (6+) |
| `calculateRoundScore` | `(correct: boolean, difficulty, timeRemaining, timeLimit, streak) => number` | Full round score = basePoints × streakMultiplier + timeBonus (0 if wrong) |
| `calculateGrade` | `(correctCount: number, totalRounds: number) => Grade` | Returns grade: S (≥95%), A (≥80%), B (≥60%), C (≥40%), D (<40%) |
| `calculateFinalScore` | `(session: GameSession) => FinalScore` | Aggregates session score, grade, accuracy, maxStreak |

---

### `questionGenerator.ts`
`src/engine/questionGenerator.ts`

Generates randomized `GameRound` objects from the celebrity pool.

| Function | Signature | Description |
|----------|-----------|-------------|
| `getPool` | `(category, difficulty, imageType?) => Celebrity[]` | Filters celebrity pool by category, difficulty, and optional image type |
| `pickDistractors` | `(target: Celebrity, pool: Celebrity[], count: number) => Celebrity[]` | Selects `count` distractors preferring same category, then expanding |
| `generateRound` | `(variant, difficulty, category, usedSlugs?) => GameRound` | Creates one round with target + distractors + timeLimit + unique id |
| `generateSession` | `(variant, difficulty, category) => GameRound[]` | Creates 10 rounds for a classic game session |

---

### `answerValidator.ts`
`src/engine/answerValidator.ts`

Validates user answers for both MCQ and free-text modes.

| Function | Signature | Description |
|----------|-----------|-------------|
| `normalizeText` | `(text: string) => string` | Lowercases, removes accents and punctuation |
| `levenshtein` | `(a: string, b: string) => number` | Computes edit distance between two strings |
| `isFuzzyMatch` | `(input: string, target: string) => boolean` | Returns true if input closely matches target (exact, substring ≥4 chars, or Levenshtein ≤1–3 depending on length) |
| `validateMCQ` | `(chosenIndex: number, correctIndex: number) => boolean` | Returns true if chosen index matches correct index |
| `validateFreeText` | `(input: string, celebrity: Celebrity) => boolean` | Checks input against celebrity name and all aliases via fuzzy matching |
| `validateAnswer` | `(answer: UserAnswer, round: GameRound) => boolean` | Entry point — dispatches to MCQ or free-text validator |

---

## Hooks

### `useGame.ts`
`src/hooks/useGame.ts`

Main hook managing classic game session state.

**State machine**: `idle` → `playing` → `feedback` → `complete`

| Export | Type | Description |
|--------|------|-------------|
| `state` | `GameState` | Current phase: `idle \| playing \| feedback \| complete` |
| `session` | `GameSession \| null` | Full session object with rounds, score, streak |
| `currentRound` | `GameRound \| null` | Active round object |
| `roundResult` | `RoundResult \| null` | Result of last answered round |
| `startGame` | `(variant, difficulty, category) => void` | Initializes and starts a new 10-round session |
| `submitAnswer` | `(answer: MCQAnswer \| TextAnswer) => void` | Validates answer, updates score/streak, transitions to feedback |
| `nextRound` | `() => void` | Advances to next round or completes session |
| `timeExpired` | `() => void` | Auto-submits wrong answer when timer runs out |
| `resetGame` | `() => void` | Resets state to idle |

---

### `useSurvival.ts`
`src/hooks/useSurvival.ts`

Manages infinite survival mode (play until first mistake).

**State machine**: `idle` → `playing` → `feedback` → `dead`

| Export | Type | Description |
|--------|------|-------------|
| `state` | `SurvivalState` | Current phase: `idle \| playing \| feedback \| dead` |
| `currentRound` | `GameRound \| null` | Active round |
| `score` | `number` | Accumulated score |
| `roundsAlive` | `number` | Number of rounds survived |
| `streak` | `number` | Current correct streak |
| `startSurvival` | `() => void` | Begins survival session (fixed: medium difficulty, 10s limit) |
| `submitAnswer` | `(answer) => void` | Validates answer; on failure transitions to `dead` and saves to leaderboard |
| `nextRound` | `() => void` | Generates next round (unlimited) |
| `timeExpired` | `() => void` | Triggers death on timer expiry |
| `resetSurvival` | `() => void` | Returns to idle |

---

## Lib / Utilities

### `utils.ts`
`src/lib/utils.ts`

| Function | Signature | Description |
|----------|-----------|-------------|
| `cn` | `(...classes: string[]) => string` | Merges Tailwind class names (wrapper around clsx/twMerge) |
| `shuffle` | `<T>(array: T[]) => T[]` | Fisher-Yates in-place shuffle, returns shuffled array |
| `nanoid` | `(length?: number) => string` | Generates a random alphanumeric ID (default 12 chars) |
| `levenshtein` | `(a: string, b: string) => number` | Edit distance between two strings |
| `normalizeForComparison` | `(str: string) => string` | Removes accents, punctuation, lowercases for fuzzy text matching |
| `formatScore` | `(score: number) => string` | Formats score with locale-aware comma separator |
| `formatTime` | `(seconds: number) => string` | Formats seconds as `mm:ss` |
| `formatPercent` | `(value: number, total: number) => string` | Returns `"XX%"` string |

---

### `leaderboard.ts`
`src/lib/leaderboard.ts`

| Function | Signature | Description |
|----------|-----------|-------------|
| `getLeaderboard` | `() => LeaderboardEntry[]` | Reads and parses leaderboard from `localStorage` |
| `saveLeaderboard` | `(entries: LeaderboardEntry[]) => void` | Serializes and writes leaderboard to `localStorage` |
| `addLeaderboardEntry` | `(entry: Omit<LeaderboardEntry, 'id' \| 'date'>) => LeaderboardEntry` | Creates entry with id+date, appends, sorts by score desc, trims to 100 entries |
| `clearLeaderboard` | `() => void` | Removes leaderboard key from `localStorage` |
| `getTopEntries` | `(mode?: GameMode, limit?: number) => LeaderboardEntry[]` | Returns top N entries, optionally filtered by game mode |

---

## Data

### `data/index.ts`
`src/data/index.ts`

| Function | Signature | Description |
|----------|-----------|-------------|
| `getAllCelebrities` | `() => Celebrity[]` | Returns all 22 celebrities from all categories |
| `getCelebrityBySlug` | `(slug: string) => Celebrity \| undefined` | Finds a celebrity by their slug |
| `getCelebritiesByCategory` | `(category: CategoryId) => Celebrity[]` | Returns celebrities for a given category (`'all'` returns everything) |
| `getCelebritiesByDifficulty` | `(difficulty: Difficulty) => Celebrity[]` | Filters by difficulty level |

**Celebrity counts**:
- `actors`: 7 (Brad Pitt, Leonardo DiCaprio, Meryl Streep, Tom Hanks, Scarlett Johansson, Angelina Jolie, Johnny Depp)
- `musicians`: 6 (Beyoncé, Michael Jackson, Taylor Swift, Eminem, Rihanna, Madonna)
- `athletes`: 5 (Cristiano Ronaldo, LeBron James, Serena Williams, Usain Bolt, Roger Federer)
- `politicians`: 4 (Barack Obama, Angela Merkel, Emmanuel Macron, Nelson Mandela)

---

## i18n

### `i18n/index.tsx`
`src/i18n/index.tsx`

| Export | Type | Description |
|--------|------|-------------|
| `I18nProvider` | `React.FC<{children}>` | Context provider; detects browser locale, falls back to `'en'`; persists choice to localStorage |
| `useI18n` | `() => I18nContext` | Returns `{ locale, setLocale, t }` |
| `t` | `(key: string, params?: Record<string,string>) => string` | Resolves dot-notation key to translated string; interpolates `{{param}}` placeholders |

**Supported locales**: `en`, `fr`, `de`, `es`, `it`

**Persistence key**: `celebrity-quiz-locale`

---

## Game Registry

### `registry.ts`
`src/game-registry/registry.ts`

| Method | Signature | Description |
|--------|-----------|-------------|
| `GameRegistry.register` | `(variant: GameVariantDefinition) => void` | Registers a new game variant |
| `GameRegistry.get` | `(id: VariantId) => GameVariantDefinition` | Retrieves a variant definition by id |
| `GameRegistry.getAll` | `() => GameVariantDefinition[]` | Returns all registered variants |
| `GameRegistry.has` | `(id: VariantId) => boolean` | Returns true if variant is registered |

### Variant definitions
`src/game-registry/variants/`

Each file exports a `GameVariantDefinition` object:

| File | VariantId | Image types used | Expert mode |
|------|-----------|-----------------|-------------|
| `photo-to-name.ts` | `photo-to-name` | `face`, `full-body` | Yes (free text) |
| `name-to-photo.ts` | `name-to-photo` | `face`, `full-body` | No |
| `body-part.ts` | `body-part` | `body-part` | Yes (free text) |

---

## Components — Game

### `GameShell.tsx`
`src/components/game/GameShell.tsx`

Orchestrates a complete classic game session.

| Prop | Type | Description |
|------|------|-------------|
| `variant` | `VariantId` | Which game variant to run |
| `difficulty` | `Difficulty` | Game difficulty |
| `category` | `CategoryId` | Celebrity category filter |

Renders: `<Timer>` → variant component → `<RoundFeedback>` → `<ResultScreen>`

---

### `SurvivalShell.tsx`
`src/components/game/SurvivalShell.tsx`

Orchestrates infinite survival mode. No props — always uses medium difficulty, 10s timer, random category.

---

### `ResultScreen.tsx`
`src/components/game/ResultScreen.tsx`

End-game summary displayed after session completes.

| Prop | Type | Description |
|------|------|-------------|
| `session` | `GameSession` | Completed session data |
| `onReplay` | `() => void` | Callback to replay same settings |
| `onHome` | `() => void` | Callback to return to home |

Renders: grade badge, score, accuracy, max streak, per-round breakdown, `<ShareScore>`, `<Leaderboard>` link.

---

### `RoundFeedback.tsx`
`src/components/game/RoundFeedback.tsx`

Brief feedback shown between rounds.

| Prop | Type | Description |
|------|------|-------------|
| `result` | `RoundResult` | Contains correct/wrong, points earned, streak |
| `round` | `GameRound` | Round data to show correct answer |
| `onNext` | `() => void` | Callback to advance |

---

## Components — Variants

### `PhotoToName.tsx`
`src/components/variants/PhotoToName.tsx`

Displays celebrity photo; user picks or types the name.

| Prop | Type | Description |
|------|------|-------------|
| `round` | `GameRound` | Current round data |
| `difficulty` | `Difficulty` | Controls MCQ (easy/medium) vs free-text (expert) |
| `onAnswer` | `(answer) => void` | Fires when user submits an answer |
| `disabled` | `boolean` | Disables interaction after answer |

---

### `NameToPhoto.tsx`
`src/components/variants/NameToPhoto.tsx`

Displays celebrity name; user selects the correct photo.

| Prop | Type | Description |
|------|------|-------------|
| `round` | `GameRound` | Current round data |
| `difficulty` | `Difficulty` | Controls number of photo choices |
| `onAnswer` | `(answer) => void` | Fires when user clicks a photo |
| `disabled` | `boolean` | Disables interaction after answer |

---

### `BodyPart.tsx`
`src/components/variants/BodyPart.tsx`

Displays an isolated body part (eyes, mouth, etc.); user guesses the celebrity.

| Prop | Type | Description |
|------|------|-------------|
| `round` | `GameRound` | Current round data |
| `difficulty` | `Difficulty` | Controls MCQ vs free-text |
| `onAnswer` | `(answer) => void` | Fires when user submits |
| `disabled` | `boolean` | Disables after answer |

---

## Components — UI

| Component | Key Props | Description |
|-----------|-----------|-------------|
| `Button` | `variant`, `size`, `onClick`, `disabled` | Styled button; variants: `primary`, `secondary`, `ghost`, `success`, `danger` |
| `Badge` | `variant`, `children` | Label chip; variants: `easy`, `medium`, `expert`, `info`, `success` |
| `Timer` | `seconds`, `total`, `onExpire` | Countdown with color gradient (green→yellow→red); calls `onExpire` at 0 |
| `ProgressBar` | `value`, `max`, `variant` | Progress bar; variants: `round`, `success`, `timer` |
| `ScoreDisplay` | `score`, `streak`, `round`, `totalRounds` | Score + streak + round counter display |
| `ThemeToggle` | — | Toggles dark/light mode via `ThemeContext` |
| `LanguageSelector` | — | Locale picker with flag emoji, persists to localStorage |
| `Leaderboard` | `isOpen`, `onClose` | Modal showing top classic and survival scores |
| `ShareScore` | `session` | Copies formatted score text to clipboard |

---

## Components — Layout

| Component | Description |
|-----------|-------------|
| `Header` | Top bar with logo, `<ThemeToggle>`, `<LanguageSelector>` |
| `Footer` | Attribution, demo notice, links |
| `JsonLd` | Injects JSON-LD structured data for SEO |

---

## App Pages

| Route | File | Description |
|-------|------|-------------|
| `/` | `src/app/page.tsx` | Home — variant/difficulty/category selector |
| `/play/[variant]/[difficulty]` | `src/app/play/[variant]/[difficulty]/page.tsx` | SSG shell; reads params |
| `/play/[variant]/[difficulty]` | `src/app/play/[variant]/[difficulty]/PlayClient.tsx` | Client component mounting `<GameShell>` |
| `/survival` | `src/app/survival/page.tsx` | Survival mode entry; mounts `<SurvivalShell>` |

---

## Types Reference
`src/types/game.ts`

```typescript
type Difficulty   = 'easy' | 'medium' | 'expert'
type VariantId    = 'photo-to-name' | 'name-to-photo' | 'body-part'
type CategoryId   = 'actors' | 'musicians' | 'athletes' | 'politicians' | 'all'
type ImageType    = 'face' | 'full-body' | 'body-part'
type BodyPartType = 'eyes' | 'mouth' | 'hands' | 'silhouette' | 'back'
type GameMode     = 'classic' | 'survival'
type GameState    = 'idle' | 'playing' | 'feedback' | 'complete'
type SurvivalState = 'idle' | 'playing' | 'feedback' | 'dead'
type Grade        = 'S' | 'A' | 'B' | 'C' | 'D'
```
