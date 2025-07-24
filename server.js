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
    await page.goto('https://value-investment-analysis-website.streamlit.app/', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });
    await browser.close();

    res.send('✅ Streamlit page triggered successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to trigger Streamlit');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
