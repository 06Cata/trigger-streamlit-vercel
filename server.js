/* ─── 依賴 ─────────────────────────────── */
const express   = require('express');
const puppeteer = require('puppeteer-core');

/* Node 18+ 內建 fetch */
const fetch = globalThis.fetch;

/* ─── 基本設定 ─────────────────────────── */
const app  = express();
const port = process.env.PORT || 8080;         // Render 預設會提供 PORT=8080
const URL  = 'https://value-investment-analysis-website.streamlit.app/';

/* ─── 根路由（健康檢查）──────────────────── */
app.get('/', (_req, res) => res.send('🟢 Service OK — hit /trigger'));

/* ─── 主要觸發 ─────────────────────────── */
app.get('/trigger', async (_req, res) => {
  try {
    /* Step‑1: HEAD Ping（不追蹤 302）喚醒 Streamlit */
    console.log('🔔  Pinging Streamlit (HEAD)…');
    await fetch(URL, {
      method   : 'HEAD',
      redirect : 'manual',
      cache    : 'no-store',
      timeout  : 60_000,
    });
    console.log('✅  Ping OK — Launching Puppeteer');

    /* Step‑2: Puppeteer 載入 */
    const launchOpts = process.env.PUPPETEER_EXECUTABLE_PATH
      ? {                                      // 伺服器（Render）
          headless       : 'new',
          executablePath : process.env.PUPPETEER_EXECUTABLE_PATH,
          args           : ['--no-sandbox', '--disable-dev-shm-usage'],
        }
      : {                                      // 本機開發（Mac/Win）
          headless : 'new',
          channel  : 'chrome',
        };

    const browser = await puppeteer.launch(launchOpts);
    const page    = await browser.newPage();
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120_000 });
    await browser.close();

    console.log('🎉  Trigger 完成');
    res.send('✅ Streamlit page triggered successfully');
  } catch (err) {
    console.error('❌ Trigger failed:', err);
    res.status(500).send('❌ Failed — see logs');
  }
});

/* ─── 啟動伺服器 ───────────────────────── */
app.listen(port, () => console.log(`🚀  Server listening on ${port}`));
