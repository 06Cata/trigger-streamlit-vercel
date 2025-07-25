/* ─── Dependencies ─────────────────────────── */
const fs   = require('fs');
const { execSync } = require('child_process');
const express   = require('express');
const puppeteer = require('puppeteer-core');

/* ─── Basic Config ─────────────────────────── */
const app  = express();
const PORT = process.env.PORT || 8080;
const URL  = 'https://value-investment-analysis-website.streamlit.app/';

/* ─── Helper: 找出可執行的瀏覽器 ───────────── */
function findChrome() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/lib/chromium/chromium',
  ].filter(Boolean);

  for (const p of candidates) {
    try {
      fs.accessSync(p, fs.constants.X_OK);
      console.log(`🔍  Found executable: ${p}`);
      return p;
    } catch { /* not executable */ }
  }
  console.log('🛑  No local Chrome found, will fall back to channel:"chrome"');
  return null;
}

/* ─── Health check ─────────────────────────── */
app.get('/', (_req, res) => res.send('🟢 Service OK — hit /trigger'));

/* ─── Main trigger ─────────────────────────── */
app.get('/trigger', async (_req, res) => {
  try {
    console.log('🔔  Pinging Streamlit (HEAD)…');
    await fetch(URL, { method: 'HEAD', redirect: 'manual', cache: 'no-store', timeout: 60_000 });
    console.log('✅  Ping OK — Launching Puppeteer');

    const exePath = findChrome();
    const launchOpts = exePath
      ? { headless: 'new', executablePath: exePath,
          args: ['--no-sandbox', '--disable-dev-shm-usage'] }
      : { headless: 'new', channel: 'chrome' };

    const browser = await puppeteer.launch(launchOpts);
    const page    = await browser.newPage();
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120_000 });
    await browser.close();

    console.log('🎉  Trigger success');
    res.send('✅ Streamlit page triggered successfully');
  } catch (err) {
    console.error('❌ Trigger failed:\n', err);
    try {
      console.log('📂  /usr/bin listing (grep chrom):');
      console.log(execSync('ls -l /usr/bin | grep chrom || true').toString());
    } catch {}
    res.status(500).send('❌ Failed — see logs');
  }
});

/* ─── Start server ─────────────────────────── */
app.listen(PORT, () => console.log(`🚀  Server listening on ${PORT}`));
