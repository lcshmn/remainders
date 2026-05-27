# --- BUILD STAGE ---
# Wir nutzen das Debian-basierte "bookworm-slim" Image für maximale Kompatibilität
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# Notwendige native Abhängigkeiten für Prisma und Build-Tools installieren
RUN apt-get update && apt-get install -y \
    openssl \
    python3 \
    make \
    g++ \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json ./

# Frische Installation der Node-Module
RUN npm install --legacy-peer-deps

COPY . .

# Prisma-Client generieren
RUN npx prisma generate

ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- RUN STAGE ---
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

RUN npx prisma generate

EXPOSE 3000
ENV PORT=3000

CMD npx prisma db push && node server.js
