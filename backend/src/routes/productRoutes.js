const express = require('express');
const router = express.Router();
const dbAdapter = require('../config/supabase');
const { searchStoreCatalog } = require('../services/storeService');
const { scrapeProduct } = require('../scraper/engine');
const { runHeadedScrape } = require('../scraper/headedRunner');

// 1. Search INE Hosted Mock Store Catalog
router.get('/store/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const result = await searchStoreCatalog(query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get All Tracked Products
router.get('/tracked', async (req, res) => {
  try {
    const products = await dbAdapter.getTrackedProducts();
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Add / Track a Product
router.post('/tracked', async (req, res) => {
  try {
    const { product_id, title, brand, category, image_url, description } = req.body;
    if (!product_id) {
      return res.status(400).json({ error: 'product_id is required' });
    }

    // Insert into tracked_products table
    const product = await dbAdapter.addTrackedProduct({
      product_id: String(product_id),
      title: title || `Product ${product_id}`,
      brand: brand || 'INE Store',
      category: category || 'General',
      image_url: image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      description: description || '',
      current_price: null,
      current_stock: null,
      last_scrape_status: 'pending'
    });

    // Trigger initial scrape asynchronously
    scrapeProduct(String(product_id), { mode: 'manual' }).catch(err => {
      console.error(`Initial scrape error for ${product_id}:`, err.message);
    });

    res.status(201).json({ success: true, message: 'Product added to tracking. Scrape triggered.', product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Delete / Untrack Product
router.delete('/tracked/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    await dbAdapter.deleteTrackedProduct(productId);
    res.json({ success: true, message: `Product ${productId} untracked` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Get Price History for Product
router.get('/tracked/:productId/history', async (req, res) => {
  try {
    const { productId } = req.params;
    const history = await dbAdapter.getPriceHistory(productId);
    res.json({ success: true, count: history.length, history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Get Per-Product Scrape Logs (Honest Logs)
router.get('/tracked/:productId/logs', async (req, res) => {
  try {
    const { productId } = req.params;
    const logs = await dbAdapter.getScrapeLogs(productId);
    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Manual Instant Scrape Trigger
router.post('/scrape/now/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await scrapeProduct(productId, { mode: 'manual' });
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Observable Headed Scrape Run Trigger
router.post('/scrape/headed/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await runHeadedScrape(productId);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. External Cron Job Trigger Endpoint (for cron-job.org or Vercel Cron)
router.get('/scrape/cron', async (req, res) => {
  try {
    const cronSecret = process.env.CRON_SECRET || 'ine-secret-cron-key-2026';
    const reqSecret = req.headers['x-cron-secret'] || req.query.secret;

    if (reqSecret !== cronSecret && process.env.NODE_ENV === 'production') {
      return res.status(401).json({ error: 'Unauthorized cron request. Secret mismatch.' });
    }

    console.log('[Cron Job] ⏰ 2-Hour Scheduled Scrape Execution Triggered');
    const products = await dbAdapter.getTrackedProducts();

    if (products.length === 0) {
      return res.json({ success: true, message: 'No products currently tracked.', scrapedCount: 0 });
    }

    const scrapeResults = [];
    for (const prod of products) {
      const result = await scrapeProduct(prod.product_id, { mode: 'scheduled' });
      scrapeResults.push(result);
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      totalTracked: products.length,
      scrapedCount: scrapeResults.length,
      results: scrapeResults
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Get Alerts & Price Notifications
router.get('/alerts', async (req, res) => {
  try {
    const alerts = await dbAdapter.getAlerts();
    res.json({ success: true, count: alerts.length, alerts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
