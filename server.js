/* ─── 依賴 ─────────────────────────────── */
const fs        = require('fs');
const express   = require('express');
const puppeteer = require('puppeteer-core');
const chromium  = require('@sparticuz/chromium');

/* Node 18+ 內建 fetch */
const fetch = globalThis.fetch;

/* ─── 基本設定 ─────────────────────────── */
const isLinux = process.platform === 'linux';
const app     = express();
const port    = process.env.PORT || 3000;
const URL     = 'https://value-investment-analysis-website.streamlit.app/';

/* ─── Linux: 把 bundled Chromium 安全複製到 /tmp ─ */
async function chromePath() {
  if (!isLinux) return undefined;

  const src = await chromium.executablePath();
  const dst = '/tmp/chrome';
  if (!fs.existsSync(dst)) {
    fs.copyFileSync(src, dst);
    fs.chmodSync(dst, 0o755);                    // 確保可執行
  }
  return dst;
}

/* ─── 根路由（健康檢查）──────────────────── */
app.get('/', (_req, res) => res.send('🟢 Service OK — hit /trigger'));

/* ─── 主要觸發 ─────────────────────────── */
app.get('/trigger', async (_req, res) => {
  try {
    /* Step-1: HEAD Ping（不追蹤 302）喚醒 Streamlit */
    console.log('🔔  Pinging Streamlit (HEAD)…');
    await fetch(URL, {
      method   : 'HEAD',
      redirect : 'manual',
      cache    : 'no-store',
      timeout  : 60_000,
    });
    console.log('✅  Ping OK — Launching Puppeteer');

    /* Step-2: Puppeteer 載入（Streamlit 已熱啟） */
    const launchOpts = {
      headless       : isLinux ? chromium.headless : 'new',
      args           : isLinux ? chromium.args     : ['--no-sandbox'],
      defaultViewport: chromium.defaultViewport,
    };

    if (isLinux) {
      launchOpts.executablePath = await chromePath(); // Linux 用 bundled binary
    } else {
      launchOpts.channel = 'chrome';                  // mac/Win 用系統 Chrome
    }

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
