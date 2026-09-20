const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;
let isMockDb = false;

if (SUPABASE_URL && SUPABASE_KEY && SUPABASE_URL !== 'https://your-supabase-url.supabase.co') {
  console.log('✅ Connected to Supabase PostgreSQL Database');
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
  console.log('⚠️ Supabase credentials not found/placeholder. Initializing Local Fallback Database.');
  isMockDb = true;
}

// Local File Database Fallback Implementation
const LOCAL_DB_PATH = path.join(__dirname, '../../local_db.json');

function loadLocalDb() {
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    const initialData = {
      tracked_products: [],
      price_history: [],
      scrape_logs: [],
      alerts: []
    };
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  try {
    return JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf-8'));
  } catch (e) {
    return { tracked_products: [], price_history: [], scrape_logs: [], alerts: [] };
  }
}

function saveLocalDb(data) {
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
}

// Unified Database Adapter Interface
const dbAdapter = {
  isMockDb,
  
  // Tracked Products
  async getTrackedProducts() {
    if (supabase) {
      const { data, error } = await supabase
        .from('tracked_products')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) return data;
      console.error('Supabase error getTrackedProducts:', error);
    }
    const local = loadLocalDb();
    return local.tracked_products;
  },

  async addTrackedProduct(product) {
    if (supabase) {
      const { data, error } = await supabase
        .from('tracked_products')
        .upsert(product, { onConflict: 'product_id' })
        .select()
        .single();
      if (!error) return data;
      console.error('Supabase error addTrackedProduct:', error);
    }
    const local = loadLocalDb();
    const idx = local.tracked_products.findIndex(p => p.product_id === product.product_id);
    const now = new Date().toISOString();
    const item = { ...product, updated_at: now, created_at: product.created_at || now };
    if (idx >= 0) {
      local.tracked_products[idx] = { ...local.tracked_products[idx], ...item };
    } else {
      local.tracked_products.unshift(item);
    }
    saveLocalDb(local);
    return item;
  },

  async updateTrackedProduct(productId, updates) {
    if (supabase) {
      const { data, error } = await supabase
        .from('tracked_products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('product_id', productId)
        .select()
        .single();
      if (!error) return data;
      console.error('Supabase error updateTrackedProduct:', error);
    }
    const local = loadLocalDb();
    const idx = local.tracked_products.findIndex(p => p.product_id === productId);
    if (idx >= 0) {
      local.tracked_products[idx] = {
        ...local.tracked_products[idx],
        ...updates,
        updated_at: new Date().toISOString()
      };
      saveLocalDb(local);
      return local.tracked_products[idx];
    }
    return null;
  },

  async deleteTrackedProduct(productId) {
    if (supabase) {
      const { error } = await supabase
        .from('tracked_products')
        .delete()
        .eq('product_id', productId);
      if (!error) return true;
      console.error('Supabase error deleteTrackedProduct:', error);
    }
    const local = loadLocalDb();
    local.tracked_products = local.tracked_products.filter(p => p.product_id !== productId);
    local.price_history = local.price_history.filter(h => h.product_id !== productId);
    local.scrape_logs = local.scrape_logs.filter(l => l.product_id !== productId);
    local.alerts = local.alerts.filter(a => a.product_id !== productId);
    saveLocalDb(local);
    return true;
  },

  // Price History
  async addPriceHistoryRecord(record) {
    const entry = { id: record.id || `ph-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, ...record, scraped_at: record.scraped_at || new Date().toISOString() };
    if (supabase) {
      const { data, error } = await supabase
        .from('price_history')
        .insert(entry)
        .select()
        .single();
      if (!error) return data;
      console.error('Supabase error addPriceHistoryRecord:', error);
    }
    const local = loadLocalDb();
    local.price_history.unshift(entry);
    saveLocalDb(local);
    return entry;
  },

  async getPriceHistory(productId) {
    if (supabase) {
      const { data, error } = await supabase
        .from('price_history')
        .select('*')
        .eq('product_id', productId)
        .order('scraped_at', { ascending: true });
      if (!error) return data;
      console.error('Supabase error getPriceHistory:', error);
    }
    const local = loadLocalDb();
    return local.price_history
      .filter(h => h.product_id === productId)
      .sort((a, b) => new Date(a.scraped_at) - new Date(b.scraped_at));
  },

  // Scrape Logs
  async addScrapeLog(log) {
    const entry = { id: log.id || `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, ...log, timestamp: log.timestamp || new Date().toISOString() };
    if (supabase) {
      const { data, error } = await supabase
        .from('scrape_logs')
        .insert(entry)
        .select()
        .single();
      if (!error) return data;
      console.error('Supabase error addScrapeLog:', error);
    }
    const local = loadLocalDb();
    local.scrape_logs.unshift(entry);
    saveLocalDb(local);
    return entry;
  },

  async getScrapeLogs(productId) {
    if (supabase) {
      const { data, error } = await supabase
        .from('scrape_logs')
        .select('*')
        .eq('product_id', productId)
        .order('timestamp', { ascending: false });
      if (!error) return data;
      console.error('Supabase error getScrapeLogs:', error);
    }
    const local = loadLocalDb();
    return local.scrape_logs
      .filter(l => l.product_id === productId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  // Alerts
  async addAlert(alert) {
    const entry = { id: alert.id || `alert-${Date.now()}`, ...alert, created_at: new Date().toISOString(), is_read: false };
    if (supabase) {
      const { data, error } = await supabase
        .from('alerts')
        .insert(entry)
        .select()
        .single();
      if (!error) return data;
    }
    const local = loadLocalDb();
    local.alerts.unshift(entry);
    saveLocalDb(local);
    return entry;
  },

  async getAlerts() {
    if (supabase) {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) return data;
    }
    const local = loadLocalDb();
    return local.alerts;
  }
};

module.exports = dbAdapter;
