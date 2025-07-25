# --- Base ------------------------------------------------------------------
    FROM debian:bookworm-slim

    # --- 安裝官方 build 的 Chromium -------------------------------------------
    RUN apt-get update && \
        apt-get install -y --no-install-recommends \
            chromium chromium-common chromium-driver \
            ca-certificates fonts-liberation \
            libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 libdrm2 libgbm1 \
            libgtk-3-0 libnspr4 libnss3 libx11-xcb1 libxcb1 libxcomposite1 \
            libxdamage1 libxrandr2 libxss1 libxtst6 xdg-utils && \
        # -- ➊ 為 Puppeteer 製作 wrapper ----------------------------------------
        ln -sf /usr/lib/chromium/chromium /usr/bin/chromium && \
        # -----------------------------------------------------------------------
        rm -rf /var/lib/apt/lists/*
    
    # --- 安裝 Node -------------------------------------------------------------
    ENV NODE_VERSION=20.14.0
    RUN curl -fsSL https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz \
        | tar -xJf - -C /usr/local --strip-components=1
    ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
    # Puppeteer 相關 env
    ENV PUPPETEER_SKIP_DOWNLOAD=true \
        PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
        PORT=8080
    
    # --- App -------------------------------------------------------------------
    WORKDIR /app
    COPY package*.json ./
    RUN npm ci --omit=dev
    COPY . .
    
    EXPOSE 8080
    CMD ["node", "server.js"]
    