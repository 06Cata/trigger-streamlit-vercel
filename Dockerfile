# -------- Dockerfile ----------
    FROM node:20-bullseye-slim          # << 換成 bullseye

    RUN apt-get update && \
        apt-get install -y --no-install-recommends \
            chromium && \               # bullseye 依然有原生 chromium
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
    