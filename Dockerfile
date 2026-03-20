# ─── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --frozen-lockfile

COPY . .
RUN npm run build

# ─── Serve stage ──────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Copy static export
COPY --from=builder /app/out /usr/share/nginx/html

# Security-hardened nginx config
COPY nginx.conf.example /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
