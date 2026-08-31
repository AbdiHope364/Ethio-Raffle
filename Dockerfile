# ==============================================================================
# MULTI-STAGE DOCKERFILE FOR LUCKYETHIO MONOREPO PRODUCTION DEPLOYMENT
# ==============================================================================

# 1. Base Node Image
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
RUN npm install -g turbo

# 2. Prune Workspace
FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune --scope=@raffle/web --scope=@raffle/admin --docker

# 3. Dependencies & Build
FROM base AS builder
WORKDIR /app

# Copy lockfile and package manifests
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm ci

# Copy full source and generate Prisma client
COPY --from=pruner /app/out/full/ .
COPY tsconfig.json turbo.json ./

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run db:generate
RUN npm run build

# 4. Production Runner (Web Application - Port 3000)
FROM node:20-alpine AS runner-web
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/packages ./packages

USER nextjs
EXPOSE 3000

CMD ["npm", "--workspace=@raffle/web", "run", "start"]

