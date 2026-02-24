# syntax=docker/dockerfile:1

# ---- Base ----
# Node 24 Alpine for small image size; native TS execution (no build step needed)
FROM node:24-alpine AS base

RUN corepack enable
WORKDIR /app

# ---- Dev ----
FROM base AS dev

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts

COPY . .

CMD ["pnpm", "run", "dev"]

# ---- Production ----
FROM base AS production

# dumb-init for proper PID 1 signal forwarding
RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
ENV SERVER_HOST=0.0.0.0

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S api -u 1001 -G nodejs

# Install deps in this stage (pnpm symlinks would break when copying from deps)
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod --ignore-scripts

# Copy application source, Prisma config, tsconfig (for path aliases) and schema/migrations
COPY src ./src
COPY tsconfig.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma

# Generate Prisma client and engine so no write is needed at runtime
RUN npx prisma generate

# api user must own /app so "prisma migrate deploy" can run if needed
RUN chown -R api:nodejs /app

USER api

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://localhost:3000/health').then(r=>{if(!r.ok)throw r;process.exit(0)}).catch(()=>process.exit(1))"]

CMD ["dumb-init", "npx", "tsx", "src/server.ts"]