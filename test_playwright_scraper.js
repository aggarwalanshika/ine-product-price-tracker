const { chromium } = require('playwright');

async function testScrapeProduct(productId = 'p-1') {
  console.log(`Starting test scrape for product: ${productId}`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const url = `https://demo.inelabteamdev.com/product/${productId}`;
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for price block
    const priceBlock = page.locator('.price-block');
    await priceBlock.waitFor({ state: 'visible', timeout: 10000 });

    console.log('Price block found. Hovering to satisfy dwell time and mouse moves...');
    
    // Simulate mouse movements over the price block
    const box = await priceBlock.boundingBox();
    if (box) {
      for (let i = 0; i < 15; i++) {
        await page.mouse.move(box.x + 10 + i * 5, box.y + 10 + (i % 3) * 5);
        await page.waitForTimeout(50);
      }
      await page.waitForTimeout(700); // Dwell time > 600ms
    }

    // Check if Reveal price button is enabled
    const revealBtn = priceBlock.locator('button:has-text("Reveal price")');
    if (await revealBtn.count() > 0) {
      const isEnabled = await revealBtn.isEnabled();
      console.log(`Reveal price button enabled: ${isEnabled}`);
      if (isEnabled) {
        await revealBtn.click();
      }
    }

    // Now wait for price or stock or success state
    console.log('Waiting for price response...');
    // The price element or text will render after the API call completes
    let retries = 0;
    let priceText = '';
    let stockText = '';

    while (retries < 15) {
      await page.waitForTimeout(1000);
      const content = await page.content();
      
      // Look for price pattern or text inside price block
      const text = await priceBlock.innerText();
      console.log(`[Attempt ${retries + 1}] Price block innerText:\n${text}`);

      if (!text.includes('Price hidden') && !text.includes('Checking') && !text.includes('Loading')) {
        priceText = text;
        break;
      }
      retries++;
    }

    console.log('Final price block output:', priceText);

  } catch (err) {
    console.error('Error during scrape:', err);
  } finally {
    await browser.close();
  }
}

// Wait for chromium install task before running if needed
setTimeout(() => testScrapeProduct('p-1'), 2000);
