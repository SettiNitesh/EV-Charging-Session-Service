# syntax=docker/dockerfile:1

FROM node:22-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src

EXPOSE 3000

CMD ["node", "--max-http-header-size", "24000", "src/server.js"]
