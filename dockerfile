# --- BUILD STAGE ---
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Nur die absolut notwendigen Build-Tools für isolated-vm installieren
RUN apt-get update && apt-get install -y \
    openssl \
    python3 \
    make \
    g++ \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./

RUN npm ci --legacy-peer-deps

COPY . .

# Wir überspringen die Prisma-Generierung hier komplett!
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- RUN STAGE ---
FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# SSL-Support für Prisma zur Laufzeit bereitstellen
RUN apt-get update && apt-get install -y \
    openssl \
    libssl3 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Gesamten Build und Prisma-Konstrukte übertragen
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
ENV PORT=3000

# Prisma generiert sich JETZT erst, schiebt die Tabellen in die DB und startet die App
CMD npx prisma generate && npx prisma db push && node server.js
