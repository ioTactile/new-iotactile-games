# syntax=docker/dockerfile:1
# Frontend Next.js — build puis exécution en production

FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /app

# ---- Builder ----
FROM base AS builder
COPY package.json pnpm-lock.yaml* ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts
COPY . .

# NEXT_PUBLIC_* doit être défini au build pour être injecté dans le client
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN pnpm run build

# ---- Production ----
FROM base AS production
RUN apk add --no-cache dumb-init
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["dumb-init", "node", "server.js"]
