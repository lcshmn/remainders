FROM node:20-alpine
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV NODE_OPTIONS="--max-old-space-size=1536"

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
