# ─── Stage 1: build ─────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Workspace manifests — lets pnpm resolve the full monorepo graph
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# package.json files for the frontend and its local workspace dependencies
COPY artifacts/daddyx/package.json       ./artifacts/daddyx/
COPY lib/api-client-react/package.json   ./lib/api-client-react/
COPY lib/db/package.json                 ./lib/db/

RUN pnpm install --frozen-lockfile

# Source for the frontend and its local libraries
COPY artifacts/daddyx     ./artifacts/daddyx
COPY lib/api-client-react ./lib/api-client-react
COPY lib/db               ./lib/db

# Build → artifacts/daddyx/.next/standalone (output: 'standalone' in next.config.ts)
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @workspace/daddyx build


# ─── Stage 2: production image ───────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Next.js standalone output is fully self-contained
COPY --from=builder /app/artifacts/daddyx/.next/standalone ./
COPY --from=builder /app/artifacts/daddyx/.next/static     ./artifacts/daddyx/.next/static
COPY --from=builder /app/artifacts/daddyx/public           ./artifacts/daddyx/public

EXPOSE 3000

CMD ["node", "artifacts/daddyx/server.js"]
