# --- BUILD STAGE ---
FROM node:18-alpine AS builder
WORKDIR /app

# Systemabhängigkeiten installieren
RUN apk add --no-cache libc6-compat openssl

# clean install erzwingen und Peer-Dependencies ignorieren
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

COPY . .

# Prisma-Client generieren
RUN npx prisma generate

ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- RUN STAGE ---
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache openssl

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Auch hier den Prisma-Client für die Runtime bereitstellen
RUN npx prisma generate

EXPOSE 3000
ENV PORT=3000

CMD npx prisma db push && node server.js
