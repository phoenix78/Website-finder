# =============================================================================
#  Celebrity Quiz — Multi-stage Dockerfile
#  Stages:
#    deps     → install node_modules (cache layer)
#    builder  → Next.js production build (Node.js server)
#    dev      → Node dev server with hot-reload
#    runner   → minimal Node.js image running the Next.js server (default/prod)
# =============================================================================

# ── 1. deps: install dependencies only (cached unless package*.json changes) ──
FROM node:20-alpine AS deps

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# ── 2. builder: build the Next.js app ─────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Generate Prisma client
RUN npx prisma generate

RUN npm run build

# ── 3. dev: Next.js dev server (hot-reload) ───────────────────────────────────
FROM node:20-alpine AS dev

WORKDIR /app

RUN apk add --no-cache libc6-compat

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=development

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]

# ── 4. runner: minimal Node.js image running Next.js server (production) ──────
FROM node:20-alpine AS runner

WORKDIR /app

LABEL org.opencontainers.image.title="Celebrity Quiz"
LABEL org.opencontainers.image.description="Celebrity guessing game — Next.js server"
LABEL org.opencontainers.image.source="https://github.com/phoenix78/Website-finder"

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy built artifacts
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
