# --- Base -------------------------------------------------------------------
    FROM node:20-bullseye-slim       # ← 換回 bullseye

    # --- 安裝 Chromium ----------------------------------------------------------
    RUN apt-get update && \
        apt-get install -y chromium && \
        rm -rf /var/lib/apt/lists/*
    
    ENV PUPPETEER_SKIP_DOWNLOAD=true \
        PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
        PORT=8080
    
    # --- App --------------------------------------------------------------------
    WORKDIR /app
    COPY package*.json ./
    RUN npm ci --omit=dev
    COPY . .
    
    EXPOSE 8080
    CMD ["node", "server.js"]
    