const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 3000;

app.get('/trigger', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    console.log('🚀 Navigating to Streamlit page...');
    await page.goto('https://value-investment-analysis-website.streamlit.app/', {
      waitUntil: 'networkidle2',
      timeout: 120000, // 調高 timeout 到 2 分鐘
    });

    console.log('✅ Streamlit page visited successfully');

    await browser.close();
    res.send('✅ Streamlit page triggered successfully');
  } catch (err) {
    console.error('❌ Error occurred while triggering Streamlit:', err);
    res.status(500).send('❌ Failed to trigger Streamlit. See logs for details.');
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
