const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 3000;

app.get('/trigger', async (req, res) => {
  try {
    console.log('🚀 Launching browser...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: puppeteer.executablePath(), // 正確路徑
    });

    const page = await browser.newPage();
    console.log('🌐 Visiting Streamlit page...');
    await page.goto('https://value-investment-analysis-website.streamlit.app/', {
      waitUntil: 'networkidle2',
      timeout: 120000,
    });

    await browser.close();
    console.log('✅ Successfully triggered Streamlit');
    res.send('✅ Streamlit page triggered successfully');
  } catch (err) {
    console.error('❌ Error launching Puppeteer:', err.message);
    console.error(err.stack);
    res.status(500).send('❌ Failed to trigger Streamlit. Check server logs for details.');
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
