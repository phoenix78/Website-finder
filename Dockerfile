# =============================================================================
#  Celebrity Quiz — Multi-stage Dockerfile
#  Stages:
#    deps     → install node_modules (cache layer)
#    builder  → Next.js production build → /app/out
#    runner   → nginx:alpine serving the static export (~20 MB final image)
#    dev      → Node dev server with hot-reload (used by docker-compose.dev.yml)
# =============================================================================

# ── 1. deps: install dependencies only (cached unless package*.json changes) ──
FROM node:20-alpine AS deps

WORKDIR /app

# Install only what's needed to compile native addons (if any)
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# ── 2. builder: build the Next.js app ─────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Re-use installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY . .

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ── 3. runner: minimal nginx image serving the static export ──────────────────
FROM nginx:1.27-alpine AS runner

LABEL org.opencontainers.image.title="Celebrity Quiz"
LABEL org.opencontainers.image.description="Celebrity guessing game — static export served by nginx"
LABEL org.opencontainers.image.source="https://github.com/phoenix78/Website-finder"

# Remove default nginx config and html
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Copy our hardened nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy static export from builder
COPY --from=builder /app/out /usr/share/nginx/html

# nginx runs as non-root (nginx user exists by default in nginx:alpine)
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chmod -R 755 /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost/index.html || exit 1

CMD ["nginx", "-g", "daemon off;"]

# ── 4. dev: Next.js dev server (hot-reload) ───────────────────────────────────
FROM node:20-alpine AS dev

WORKDIR /app

RUN apk add --no-cache libc6-compat

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=development

# Dependencies will be mounted from the host via volume in dev compose,
# but we pre-install them so the image is self-contained if needed.
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./

EXPOSE 3000

CMD ["npm", "run", "dev"]
