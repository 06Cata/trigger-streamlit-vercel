const fs        = require('fs');
const path      = require('path');
const express   = require('express');
const puppeteer = require('puppeteer-core');
const chromium  = require('@sparticuz/chromium');

const isLinux = process.platform === 'linux';
const app  = express();
const port = process.env.PORT || 3000;

// 取得真正可執行檔路徑（Linux 才需要）
async function getChromePath() {
  if (!isLinux) return undefined;

  const src = await chromium.executablePath();
  const dst = '/tmp/chrome';                 // 可寫入且 no-exec lock

  if (!fs.existsSync(dst)) {
    fs.copyFileSync(src, dst);
    fs.chmodSync(dst, 0o755);                // 確保有執行權限
  }
  return dst;
}

app.get('/trigger', async (_req, res) => {
  try {
    const browser = await puppeteer.launch({
      executablePath: await getChromePath(), // mac/Win 會傳 undefined → puppeteer 自動尋找
      headless      : isLinux ? chromium.headless : 'new',
      args          : isLinux ? chromium.args     : ['--no-sandbox'],
      defaultViewport: chromium.defaultViewport,
    });

    const page = await browser.newPage();
    await page.goto(
      'https://value-investment-analysis-website.streamlit.app/',
      { waitUntil: 'networkidle2', timeout: 120_000 },
    );
    await browser.close();
    res.send('✅ Streamlit page triggered successfully');
  } catch (err) {
    console.error('❌ Trigger failed:', err);
    res.status(500).send('❌ Failed – see logs');
  }
});

app.listen(port, () => console.log(`🚀  Server on ${port}`));
