/* ─── Dependencies ─────────────────────────── */
const express   = require('express');
const puppeteer = require('puppeteer-core');
const fs        = require('fs');
const { execSync } = require('child_process');

/* Node ≥18 內建 fetch */
const fetch = globalThis.fetch;

/* ─── Basic Config ─────────────────────────── */
const app  = express();
const PORT = process.env.PORT || 8080;
const URL  = 'https://value-investment-analysis-website.streamlit.app/';

/* ─── Helper: 找到可執行的 Chrome/Chromium ─── */
function detectChrome() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    '/usr/lib/chromium/chromium',
    '/usr/lib/chromium',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/opt/google/chrome/chrome'
  ].filter(Boolean);

  console.log('🔎  Scanning Chrome candidates ……');
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      console.log(`   ✔ Found: ${p}`);
      return p;
    }
    console.log(`   ✘ Not found: ${p}`);
  }

  /* 最後保險：用 which chromium */
  try {
    const which = execSync('which chromium || true').toString().trim();
    if (which) {
      console.log(`   ✔ which chromium → ${which}`);
      return which;
    }
  } catch { /* 無 */ }

  console.log('   ⚠  No local binary detected, will fall back to channel:"chrome"');
  return null; // 讓 puppeteer 使用 channel
}

/* ─── Root (health check) ──────────────────── */
app.get('/', (_req, res) => res.send('🟢 Service OK — hit /trigger'));

/* ─── Main trigger ─────────────────────────── */
app.get('/trigger', async (_req, res) => {
  try {
    console.log('\n====== Trigger start', new Date().toISOString(), '======');

    /* Step-1: HEAD ping 叫醒 Streamlit */
    console.log('🔔  Pinging Streamlit (HEAD)…');
    await fetch(URL, { method: 'HEAD', redirect: 'manual', cache: 'no-store', timeout: 60_000 });
    console.log('✅  Ping OK — Launching Puppeteer');

    /* Step-2: Launch Puppeteer */
    const executablePath = detectChrome();
    const launchOpts = executablePath
      ? { headless: 'new', executablePath, args: ['--no-sandbox', '--disable-dev-shm-usage'] }
      : { headless: 'new', channel: 'chrome' };

    console.log('🚀  Launch opts:', launchOpts);

    const browser = await puppeteer.launch(launchOpts);
    const page    = await browser.newPage();
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120_000 });
    await browser.close();

    console.log('🎉  Trigger success');
    res.send('✅ Streamlit page triggered successfully');
  } catch (err) {
    const detail = err?.stack || err?.message || String(err);
    console.error('❌ Trigger failed:\n', detail);
    res.status(500).type('text').send(`❌ Trigger failed:\n\n${detail}`);
  }
});

/* ─── Start server ─────────────────────────── */
app.listen(PORT, () => console.log(`🚀  Server listening on ${PORT}`));

/* ─── Global error handlers ─────────────────── */
process.on('unhandledRejection', (reason) =>
  console.error('UNHANDLED REJECTION:', reason));
process.on('uncaughtException',  (err)   =>
  console.error('UNCAUGHT EXCEPTION:', err));
