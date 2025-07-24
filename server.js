const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');  // ★ 讀取雲端版 Chromium

const app  = express();
const port = process.env.PORT || 3000;

app.get('/trigger', async (_req, res) => {
  try {
    console.log('🚀  Launching bundled Chromium...');
    const browser = await puppeteer.launch({
      executablePath: await chromium.executablePath(), // ★ 指定內建執行檔
      headless      : chromium.headless,               // 雲端友善的 headless 參數
      args          : chromium.args,                   // 必要啟動參數
      defaultViewport: chromium.defaultViewport,
    });

    const page = await browser.newPage();
    console.log('🌐  Hitting Streamlit …');
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

app.listen(port, () => console.log(`🚀  Server listening on ${port}`));
