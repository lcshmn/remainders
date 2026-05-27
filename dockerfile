# --- BUILD STAGE ---
# Wir wechseln auf Node 20 (aktueller LTS-Standard)
FROM node:20-alpine AS builder
WORKDIR /app

# Systemabhängigkeiten für Node-Gyp und Prisma installieren
RUN apk add --no-cache libc6-compat openssl python3 make g++

COPY package.json ./

# Wir aktivieren maximales Logging (LogLevel silly), damit wir den exakten Fehler sehen
RUN npm install --legacy-peer-deps --loglevel silly

COPY . .

RUN npx prisma generate

ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- RUN STAGE ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache openssl

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

RUN npx prisma generate

EXPOSE 3000
ENV PORT=3000

CMD npx prisma db push && node server.js
