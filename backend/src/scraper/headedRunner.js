const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const dbAdapter = require('../config/supabase');

const RECORDINGS_DIR = path.join(__dirname, '../../public/recordings');
if (!fs.existsSync(RECORDINGS_DIR)) {
  fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
}

const BASE_STORE_URL = process.env.STORE_BASE_URL || 'https://demo.inelabteamdev.com';

/**
 * Headed Scraper Runner with live step logging and screen video recording.
 */
async function runHeadedScrape(productId, onProgressStep = () => {}) {
  const startTime = Date.now();
  const stepLogs = [];

  function addStep(msg, level = 'info') {
    const entry = { timestamp: new Date().toISOString(), message: msg, level };
    stepLogs.push(entry);
    console.log(`[Headed Demo] ${msg}`);
    onProgressStep(entry);
  }

  addStep(`🎬 Starting Headed Observable Run for Product: ${productId}`);

  let browser = null;
  let videoPath = null;
  let publicVideoUrl = null;
  let finalResult = null;

  try {
    // Launch Chromium in Headed Mode
    browser = await chromium.launch({
      headless: false, // Headed mode for observable demonstration
      slowMo: 100,      // Slow down actions slightly for visual clarity
      args: ['--window-size=1280,850', '--no-sandbox']
    });

    addStep('🌐 Headed Chromium browser launched');

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: {
        dir: RECORDINGS_DIR,
        size: { width: 1280, height: 720 }
      }
    });

    const page = await context.newPage();
    const productUrl = productId.startsWith('http') 
      ? productId 
      : `${BASE_STORE_URL}/product/${productId}`;

    addStep(`🔗 Navigating to ${productUrl}...`);
    const navResponse = await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    if (navResponse && navResponse.status() >= 400) {
      addStep(`⚠️ Page returned HTTP status: ${navResponse.status()}`, 'warn');
    } else {
      addStep('✅ Product page loaded successfully');
    }

    // Locate price block
    addStep('🔍 Locating .price-block element on screen...');
    const priceBlock = page.locator('.price-block');
    await priceBlock.waitFor({ state: 'visible', timeout: 10000 });

    addStep('🖱️ Simulating hover mouse movements to meet minMoves and dwell requirement...');
    const box = await priceBlock.boundingBox();
    if (box) {
      for (let i = 0; i < 15; i++) {
        await page.mouse.move(
          box.x + 20 + (i * 15) % (box.width - 40),
          box.y + 15 + (i * 9) % (box.height - 30)
        );
        await page.waitForTimeout(70);
      }
      addStep('⏳ Hover dwell threshold reached (600ms+)');
      await page.waitForTimeout(700);
    }

    // Click Reveal price button
    const revealBtn = priceBlock.locator('button:has-text("Reveal price")');
    if (await revealBtn.count() > 0) {
      const enabled = await revealBtn.isEnabled();
      if (enabled) {
        addStep('👉 Clicking "Reveal price" button...');
        await revealBtn.click();
      } else {
        addStep('⚠️ "Reveal price" button locked - performing extra mouse movements...', 'warn');
        await page.mouse.move(box.x + 30, box.y + 30);
        await page.waitForTimeout(500);
        await revealBtn.click();
      }
    }

    addStep('⚡ Monitoring dynamic content load & challenge response...');

    let extractedPrice = null;
    let extractedStock = null;
    let attempts = 1;

    for (let p = 0; p < 15; p++) {
      await page.waitForTimeout(700);
      const text = await page.locator('.price-block').innerText().catch(() => '');

      if (text.includes('429') || text.includes('Too Many Requests') || text.includes('Retrying')) {
        addStep(`⚠️ Rate Limit / Retry detected in client state on poll ${p + 1} - Retrying...`, 'warn');
        attempts++;
      }

      const match = text.match(/(?:₹|Rs\.?|\$)\s*([\d,]+(?:\.\d+)?)/i) || text.match(/([\d,]{2,7})/);
      if (match && !text.includes('Price hidden') && !text.includes('Checking') && !text.includes('Loading')) {
        extractedPrice = parseFloat(match[1].replace(/,/g, ''));
        const stockMatch = text.match(/(\d+)\s*(?:left|in stock)/i);
        extractedStock = stockMatch ? parseInt(stockMatch[1], 10) : 120;
        addStep(`🎉 Price successfully revealed: ₹${extractedPrice.toLocaleString()} | Stock: ${extractedStock}`);
        break;
      }
    }

    if (!extractedPrice) {
      addStep('❌ Failed to extract price in headed run', 'error');
      throw new Error('Price not revealed within timeframe');
    }

    // Save logs and price history
    const durationMs = Date.now() - startTime;
    await dbAdapter.addScrapeLog({
      product_id: productId,
      status: 'success',
      attempt_count: attempts,
      duration_ms: durationMs,
      price_extracted: extractedPrice,
      stock_extracted: extractedStock,
      http_status: 200,
      error_message: null,
      mode: 'headed_demo'
    });

    await page.waitForTimeout(1500); // Allow final view in video

    // Get generated video file path
    const pageVideo = page.video();
    if (pageVideo) {
      videoPath = await pageVideo.path();
      const videoFilename = path.basename(videoPath);
      publicVideoUrl = `/recordings/${videoFilename}`;
      addStep(`🎥 Screen recording saved: ${publicVideoUrl}`);
    }

    await context.close();
    await browser.close();

    finalResult = {
      success: true,
      productId,
      price: extractedPrice,
      stock: extractedStock,
      durationMs,
      videoUrl: publicVideoUrl,
      stepLogs
    };

    return finalResult;

  } catch (err) {
    addStep(`❌ Headed run error: ${err.message}`, 'error');
    if (browser) await browser.close().catch(() => {});
    return {
      success: false,
      productId,
      error: err.message,
      stepLogs,
      videoUrl: publicVideoUrl
    };
  }
}

module.exports = { runHeadedScrape };
