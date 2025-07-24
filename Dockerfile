# --- Base -------------------------------------------------------------------
    FROM debian:bookworm-slim                # 直接換成乾淨的 Debian

    # --- 安裝「官方 build」的 Chromium ------------------------------------------
    # 參考 https://packages.debian.org/search?keywords=chromium
    RUN apt-get update && \
        apt-get install -y --no-install-recommends \
            chromium chromium-common chromium-driver \
            ca-certificates fonts-liberation \
            libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 libdrm2 libgbm1 \
            libgtk-3-0 libnspr4 libnss3 libx11-xcb1 libxcb1 libxcomposite1 \
            libxdamage1 libxrandr2 libxss1 libxtst6 xdg-utils && \
        rm -rf /var/lib/apt/lists/*
    
    # --- 安裝 Node（用官方壓縮包最小）------------------------------------------
    ENV NODE_VERSION=20.14.0
    RUN curl -fsSL https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz \
        | tar -xJf - -C /usr/local --strip-components=1
    
    # Puppeteer 相關 env
    ENV PUPPETEER_SKIP_DOWNLOAD=true \
        PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \   # ← 改這裡
        PORT=8080
    
    # --- App --------------------------------------------------------------------
    WORKDIR /app
    COPY package*.json ./
    RUN npm ci --omit=dev
    COPY . .
    
    EXPOSE 8080
    CMD ["node", "server.js"]
    