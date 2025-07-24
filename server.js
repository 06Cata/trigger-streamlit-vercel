/* ─── Dependencies ────────────────────────────── */
const fs        = require('fs');               // only for exec path detection
const express   = require('express');
const puppeteer = require('puppeteer-core');   // lightweight puppeteer

/* Node ≥18 has global fetch */
const fetch = globalThis.fetch;

/* ─── Basic Config ─────────────────────────── */
const app  = express();
const port = process.env.PORT || 3000;         // Render sets PORT=8080
const URL  = 'https://value-investment-analysis-website.streamlit.app/';

/* ─── Helper: detect a usable Chrome/Chromium binary ─ */
function detectChrome() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,     // honour env first
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/opt/chrome/chrome',
    '/opt/google/chrome/chrome',
  ].filter(Boolean);

  for (const path of candidates) {
    try {
      fs.accessSync(path, fs.constants.X_OK);
      return path;                             // first executable found
    } catch { /* not executable – keep looking */ }
  }
  return null;                                 // fall back to Chrome channel
}

/* ─── Root route (health check) ────────────── */
app.get('/', (_req, res) => res.send('🟢 Service OK — hit /trigger'));

/* ─── Main trigger ─────────────────────────── */
app.get('/trigger', async (_req, res) => {
  try {
    /* Step‑1: HEAD ping to wake Streamlit */
    console.log('🔔  Pinging Streamlit (HEAD)…');
    await fetch(URL, { method: 'HEAD', redirect: 'manual', cache: 'no-store', timeout: 60_000 });
    console.log('✅  Ping OK — Launching Puppeteer');

    /* Step‑2: Launch Puppeteer */
    const executablePath = detectChrome();
    const launchOpts = executablePath
      ? { headless: 'new', executablePath, args: ['--no-sandbox', '--disable-dev-shm-usage'] }
      : { headless: 'new', channel: 'chrome' };    // local dev

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

/* ─── Start server ─────────────────────────── */
app.listen(port, () => console.log(`🚀  Server listening on ${port}`));
