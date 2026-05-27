# --- BUILD STAGE ---
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Installiere wichtige SSL-Bibliotheken und Build-Tools
RUN apt-get update && apt-get install -y \
    openssl \
    libssl3 \
    python3 \
    make \
    g++ \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./

RUN npm ci --legacy-peer-deps

COPY . .

# Dummy-DATABASE_URL und Prisma-Spezifikation für Debian-Systeme
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV PRISMA_CLI_QUERY_ENGINE_TYPE="binary"
ENV PRISMA_CLIENT_ENGINE_TYPE="binary"
RUN npx prisma generate

ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- RUN STAGE ---
FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update && apt-get install -y \
    openssl \
    libssl3 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV PRISMA_CLI_QUERY_ENGINE_TYPE="binary"
ENV PRISMA_CLIENT_ENGINE_TYPE="binary"
RUN npx prisma generate

EXPOSE 3000
ENV PORT=3000

CMD npx prisma db push && node server.js
