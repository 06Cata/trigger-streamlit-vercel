# ---------- Base ----------
    FROM node:20-bookworm-slim

    # ---------- 安裝 Debian 官方 Chromium ----------
    # 必裝 core + common + sandbox，否則沒有 binary
    RUN apt-get update && \
        apt-get install -y --no-install-recommends \
            chromium \
            chromium-common \
            chromium-sandbox \
            ca-certificates fonts-liberation \
            libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 libdrm2 libgbm1 \
            libgtk-3-0 libnspr4 libnss3 libx11-xcb1 libxcb1 libxcomposite1 \
            libxdamage1 libxrandr2 libxss1 libxtst6 xdg-utils && \
        # 建 symlink，讓 /usr/bin/chromium 指向真正的 binary
        ln -sf /usr/lib/chromium/chromium /usr/bin/chromium && \
        rm -rf /var/lib/apt/lists/*
    
    ENV PUPPETEER_SKIP_DOWNLOAD=true \
        PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
        PORT=8080
    
    # ---------- App ----------
    WORKDIR /app
    COPY package*.json ./
    RUN npm ci --omit=dev           # 只裝 prod 依賴
    COPY . .
    
    EXPOSE 8080
    CMD ["node", "server.js"]
    