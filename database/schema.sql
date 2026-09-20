-- INE Product Price Tracker Database Schema (Supabase PostgreSQL)

-- 1. Tracked Products Table
CREATE TABLE IF NOT EXISTS tracked_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    category VARCHAR(100),
    image_url TEXT,
    description TEXT,
    target_price NUMERIC(10, 2),
    current_price NUMERIC(10, 2),
    mrp NUMERIC(10, 2),
    currency VARCHAR(10) DEFAULT 'INR',
    current_stock INTEGER,
    stock_status VARCHAR(100),
    rating NUMERIC(3, 2),
    seller VARCHAR(100),
    last_scraped_at TIMESTAMPTZ,
    last_scrape_status VARCHAR(50) DEFAULT 'pending', -- 'success', 'retried', 'failed'
    scrape_interval_hours INTEGER DEFAULT 2,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Price History Table
CREATE TABLE IF NOT EXISTS price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id VARCHAR(100) NOT NULL REFERENCES tracked_products(product_id) ON DELETE CASCADE,
    price NUMERIC(10, 2) NOT NULL,
    mrp NUMERIC(10, 2),
    stock INTEGER,
    currency VARCHAR(10) DEFAULT 'INR',
    scraped_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast time-series queries
CREATE INDEX IF NOT EXISTS idx_price_history_product_time ON price_history(product_id, scraped_at DESC);

-- 3. Scrape Logs Table (Honest logging of every attempt)
CREATE TABLE IF NOT EXISTS scrape_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id VARCHAR(100) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) NOT NULL, -- 'success', 'retried', 'failed'
    attempt_count INTEGER NOT NULL DEFAULT 1,
    duration_ms INTEGER NOT NULL,
    price_extracted NUMERIC(10, 2),
    stock_extracted INTEGER,
    http_status INTEGER,
    error_message TEXT,
    mode VARCHAR(50) DEFAULT 'scheduled' -- 'scheduled', 'manual', 'headed_demo'
);

-- Index for fast log retrieval per product
CREATE INDEX IF NOT EXISTS idx_scrape_logs_product_time ON scrape_logs(product_id, timestamp DESC);

-- 4. Alerts Table (Price drops & back-in-stock notifications)
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id VARCHAR(100) NOT NULL REFERENCES tracked_products(product_id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'price_drop', 'back_in_stock', 'structure_change'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    old_value VARCHAR(100),
    new_value VARCHAR(100),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
