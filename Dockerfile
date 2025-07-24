# ---- 基底 ----
    FROM node:20-slim

    # ---- 安裝系統 Chromium（以及 Puppeteer 需要的最小依賴）----
    RUN apt-get update && \
        apt-get install -y --no-install-recommends \
            chromium \
            ca-certificates \
            fonts-liberation \
            libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 libdrm2 libgbm1 \
            libgtk-3-0 libnspr4 libnss3 libx11-xcb1 libxcb1 libxcomposite1 \
            libxdamage1 libxrandr2 libxss1 libxtst6 xdg-utils && \
        rm -rf /var/lib/apt/lists/*
    
    # Puppeteer 不要再下載自己的 Chrome
    ENV PUPPETEER_SKIP_DOWNLOAD=true \
        PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
        PORT=8080
    
    # ---- 安裝 Node 相依 ----
    WORKDIR /app
    COPY package*.json ./
    RUN npm ci --omit=dev          # 省空間，純 production
    
    # ---- 複製程式碼 ----
    COPY . .
    
    EXPOSE 8080
    CMD ["node", "server.js"]
    