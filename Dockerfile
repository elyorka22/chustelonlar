# Build stage
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .

RUN npx prisma generate

# Build must not connect to runtime Docker services (postgres/redis).
# Route segments use `force-dynamic`; inline envs avoid persisting build URLs.
RUN DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build?schema=public" \
    REDIS_URL="" \
    npm run build

# Prisma runtime artifacts (generated client, engines, CLI package)
FROM node:20-alpine AS prisma

WORKDIR /app

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Production stage
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat openssl vips-dev curl

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Full Prisma client + CLI from builder (same arch). Do not copy .bin/prisma alone —
# Docker breaks the symlink and the CLI then misses prisma_schema_build_bg.wasm.
COPY --from=prisma /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=prisma /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=prisma /app/node_modules/prisma ./node_modules/prisma

RUN mkdir -p node_modules/.bin \
  && ln -sf ../prisma/build/index.js node_modules/.bin/prisma

COPY --chmod=755 scripts/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV PATH="/app/node_modules/.bin:${PATH}"

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
