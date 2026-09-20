const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const dbAdapter = require('./config/supabase');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static recordings for headed demo videos
app.use('/recordings', express.static(path.join(__dirname, '../public/recordings')));

// API Routes
app.use('/api', productRoutes);

// Root & Health Check Endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'INE Product Price Tracker API',
    database: dbAdapter.isMockDb ? 'Local Fallback Storage' : 'Supabase PostgreSQL',
    time: new Date().toISOString(),
    endpoints: {
      search: '/api/store/search?q=phone',
      trackedProducts: '/api/tracked',
      cronTrigger: '/api/scrape/cron?secret=ine-secret-cron-key-2026'
    }
  });
});

// Seed Initial Sample Data if DB is empty
async function seedInitialData() {
  try {
    const existing = await dbAdapter.getTrackedProducts();
    if (existing.length === 0) {
      console.log('🌱 Seeding initial luxury products and price history for demonstration...');
      
      const seedProducts = [
        {
          product_id: '648',
          title: 'Helix Receiver S',
          brand: 'Bright Harbour',
          category: 'Audio',
          image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
          description: 'Studio reference audio receiver with spatial audio technology.',
          current_price: 29908,
          mrp: 46107,
          currency: 'INR',
          current_stock: 189,
          stock_status: 'Hurry, just 189 left',
          last_scraped_at: new Date(Date.now() - 3600000).toISOString(),
          last_scrape_status: 'success'
        },
        {
          product_id: 'p-1',
          title: 'Acoustic SoundPro Headset',
          brand: 'Acoustic Labs',
          category: 'Audio',
          image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
          description: 'High fidelity active noise cancelling wireless headphones.',
          current_price: 14999,
          mrp: 19999,
          currency: 'INR',
          current_stock: 42,
          stock_status: 'In stock · 42 left',
          last_scraped_at: new Date(Date.now() - 7200000).toISOString(),
          last_scrape_status: 'success'
        },
        {
          product_id: 'p-3',
          title: 'Vortex Sapphire Smartwatch',
          brand: 'Vortex Luxe',
          category: 'Wearables',
          image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
          description: 'Aerospace grade titanium smartwatch with sapphire crystal display.',
          current_price: 34500,
          mrp: 42000,
          currency: 'INR',
          current_stock: 12,
          stock_status: 'Only 12 left',
          last_scraped_at: new Date(Date.now() - 10800000).toISOString(),
          last_scrape_status: 'retried'
        }
      ];

      for (const p of seedProducts) {
        await dbAdapter.addTrackedProduct(p);

        // Seed 5 historical price points per product to populate charts
        const now = Date.now();
        const basePrice = p.current_price;
        const prices = [
          basePrice * 1.12,
          basePrice * 1.08,
          basePrice * 1.05,
          basePrice * 1.02,
          basePrice
        ];

        for (let i = 0; i < prices.length; i++) {
          const time = new Date(now - (5 - i) * 7200000).toISOString();
          await dbAdapter.addPriceHistoryRecord({
            product_id: p.product_id,
            price: Math.round(prices[i]),
            mrp: p.mrp,
            stock: p.current_stock + (5 - i) * 3,
            currency: p.currency,
            scraped_at: time
          });

          // Seed sample scrape log entries
          await dbAdapter.addScrapeLog({
            product_id: p.product_id,
            timestamp: time,
            status: i === 2 ? 'retried' : 'success',
            attempt_count: i === 2 ? 3 : 1,
            duration_ms: i === 2 ? 2450 : 1120,
            price_extracted: Math.round(prices[i]),
            stock_extracted: p.current_stock + (5 - i) * 3,
            http_status: 200,
            error_message: i === 2 ? '429 Rate Limit Exceeded - Recovered on attempt 3' : null,
            mode: 'scheduled'
          });
        }
      }

      console.log('✅ Initial seed data populated successfully!');
    }
  } catch (err) {
    console.warn('Seed initialization error:', err.message);
  }
}

app.listen(PORT, async () => {
  console.log(`🚀 INE Product Price Tracker Express Server running on port ${PORT}`);
  await seedInitialData();
});
