# ---- 基底 ----
    FROM node:20-slim

    # ---- 安裝 Chromium 及所有常用依賴 ----
    RUN apt-get update && \
        apt-get install -y \
            chromium \
            ca-certificates fonts-liberation libappindicator3-1 libasound2 \
            libatk-bridge2.0-0 libatk1.0-0 libcups2 libdrm2 libgbm1 \
            libgtk-3-0 libnspr4 libnss3 libx11-xcb1 libxcb1 libxcomposite1 \
            libxdamage1 libxrandr2 libxss1 libxtst6 xdg-utils wget gnupg && \
        rm -rf /var/lib/apt/lists/*
    
    # Puppeteer 不再下載自己的 Chrome，並告訴它系統 Chrome 的路徑
    ENV PUPPETEER_SKIP_DOWNLOAD=true \
        PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
        PORT=8080
    
    # ---- 安裝相依 ----
    WORKDIR /app
    COPY package*.json ./
    RUN npm ci --production
    
    # ---- 複製程式碼 ----
    COPY . .
    
    EXPOSE 8080
    CMD ["node", "server.js"]
    