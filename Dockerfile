# Build stage — Next.js app + Prisma client generation
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat openssl

ENV SHARP_IGNORE_GLOBAL_LIBVIPS=1

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .

RUN npx prisma generate

# Build must not connect to runtime Docker services (postgres/redis).
RUN DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build?schema=public" \
    REDIS_URL="" \
    SPACES_BUCKET="build" \
    SPACES_ENDPOINT="https://build.example.com" \
    npm run build

# Migrate stage — full production node_modules for Prisma CLI (migrate deploy)
FROM node:20-alpine AS migrate

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev

COPY --chmod=755 scripts/docker-entrypoint.sh ./docker-entrypoint.sh

ENV PATH="/app/node_modules/.bin:${PATH}"

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["prisma", "migrate", "deploy"]

# App runtime — Next.js standalone + Prisma Client only (no Prisma CLI)
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat openssl curl

ENV SHARP_IGNORE_GLOBAL_LIBVIPS=1

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Query client + engines only — app never runs `prisma` CLI
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# sharp native binaries for image upload optimization
COPY --from=builder /app/node_modules/sharp ./node_modules/sharp
COPY --from=builder /app/node_modules/@img ./node_modules/@img

COPY --chmod=755 scripts/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
