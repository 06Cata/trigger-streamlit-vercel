/* ─── Dependencies ─────────────────────────── */
const express   = require('express');
const puppeteer = require('puppeteer-core');
const fs        = require('fs');                 // 只用來偵測執行檔存在

/* Node ≥18 已內建 fetch */
const fetch = globalThis.fetch;

/* ─── Basic Config ─────────────────────────── */
const app  = express();
const PORT = process.env.PORT || 8080;           // Render 會自動注入
const URL  = 'https://value-investment-analysis-website.streamlit.app/';

/* ─── Helper: 找到可執行的 Chrome / Chromium ─ */
function detectChrome() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,       // 優先使用環境變數
    '/usr/lib/chromium/chromium',
    '/usr/lib/chromium',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/opt/google/chrome/chrome'
  ].filter(Boolean);

  for (const p of candidates) {
    try {
      fs.accessSync(p, fs.constants.X_OK);
      return p;                                  // 找到即可用
    } catch { /* 繼續嘗試下一條路徑 */ }
  }
  return null;                                   // 讓 Puppeteer 自行找 (dev 環境)
}

/* ─── Root (health check) ──────────────────── */
app.get('/', (_req, res) => res.send('🟢 Service OK — hit /trigger'));

/* ─── Main trigger ─────────────────────────── */
app.get('/trigger', async (_req, res) => {
  try {
    console.log('🔔  Trigger start', new Date().toISOString());

    /* Step-1: HEAD ping 叫醒 Streamlit */
    console.log('🔔  Pinging Streamlit (HEAD)…');
    await fetch(URL, { method: 'HEAD', redirect: 'manual', cache: 'no-store', timeout: 60_000 });
    console.log('✅  Ping OK — Launching Puppeteer');

    /* Step-2: Launch Puppeteer */
    const executablePath = detectChrome();
    const launchOpts = executablePath
      ? { headless: 'new', executablePath, args: ['--no-sandbox', '--disable-dev-shm-usage'] }
      : { headless: 'new', channel: 'chrome' };   // 本機開發 fallback

    const browser = await puppeteer.launch(launchOpts);
    const page    = await browser.newPage();
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120_000 });
    await browser.close();

    console.log('🎉  Trigger 完成');
    res.send('✅ Streamlit page triggered successfully');
  } catch (err) {
    // 把錯誤完整回傳給前端，同時寫入伺服器 log
    const detail = err?.stack || err?.message || String(err);
    console.error('❌ Trigger failed:', detail);
    res.status(500).type('text').send(`❌ Trigger failed:\n\n${detail}`);
  }
});

/* ─── Start server ─────────────────────────── */
app.listen(PORT, () => console.log(`🚀  Server listening on ${PORT}`));

/* ─── 全域錯誤攔截 ─────────────────────────── */
process.on('unhandledRejection', (reason) => console.error('UNHANDLED REJECTION:', reason));
process.on('uncaughtException',  (err)    => console.error('UNCAUGHT EXCEPTION:', err));
