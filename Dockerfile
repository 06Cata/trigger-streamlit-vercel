# Dockerfile －－方案 A：node:20-bullseye-slim + chromium
FROM node:20-bullseye-slim            # bullseye 還有官方 chromium 套件

RUN apt-get update && \
    apt-get install -y chromium && \
    rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    PORT=8080

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

EXPOSE 8080
CMD ["node", "server.js"]
