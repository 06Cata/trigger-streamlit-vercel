const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 3000;

app.get('/trigger', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true, // ✅ 更穩定的 headless 模式
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto('https://value-investment-analysis-website.streamlit.app/', {
      waitUntil: 'networkidle2',
      timeout: 120000, // ✅ 拉長 timeout
    });

    await browser.close();
    res.send('✅ Streamlit page triggered successfully');
  } catch (err) {
    console.error('❌ Trigger Error:', err); // ✅ 印出錯誤細節
    res.status(500).send('❌ Failed to trigger Streamlit');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
