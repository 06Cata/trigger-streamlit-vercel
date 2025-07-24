/* ─── Dependencies ─────────────────────────── */
const express   = require('express');
const puppeteer = require('puppeteer-core');

/* Node 18+ 已內建 fetch */
const fetch = globalThis.fetch;

/* ─── Basic Config ─────────────────────────── */
const app  = express();
const PORT = process.env.PORT || 8080;                     // Render 會自動注入
const URL  = 'https://value-investment-analysis-website.streamlit.app/';

/* ─── Root (health check) ───────────────────── */
app.get('/', (_req, res) => res.send('🟢 Service OK — hit /trigger'));

/* ─── Main trigger ──────────────────────────── */
app.get('/trigger', async (_req, res) => {
  try {
    /* Step-1: HEAD ping 喚醒 Streamlit */
    console.log('🔔  Pinging Streamlit (HEAD)…');
    await fetch(URL, { method: 'HEAD', redirect: 'manual', cache: 'no-store', timeout: 60_000 });
    console.log('✅  Ping OK — Launching Puppeteer');

    /* Step-2: Puppeteer (固定 Debian-Chromium 路徑) */
    const browser = await puppeteer.launch({
      headless       : 'new',
      executablePath: '/usr/bin/chromium',   // ← 這才是可執行檔
      args           : ['--no-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120_000 });
    await browser.close();

    console.log('🎉  Trigger 完成');
    res.send('✅ Streamlit page triggered successfully');
  } catch (err) {
    console.error('❌ Trigger failed:', err);
    res.status(500).send('❌ Failed — see logs');
  }
});

/* ─── Start server ─────────────────────────── */
app.listen(PORT, () => console.log(`🚀  Server listening on ${PORT}`));
