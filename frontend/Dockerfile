# ── Stage 1: Install dependencies ───────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production=false

# ── Stage 2: Build ───────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Use placeholder for public env var to replace at runtime
ENV NEXT_PUBLIC_API_URL=__RUNTIME_API_URL__

RUN npm run build

# ── Stage 3: Run (standalone output) ────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Copy standalone build output (contains minimal node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Copy static assets and public folder
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Add runtime entrypoint for env var injection
COPY --from=builder --chown=nextjs:nodejs /app/entrypoint.sh ./
RUN chmod +x entrypoint.sh

USER nextjs

EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "server.js"]
