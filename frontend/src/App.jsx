import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TrackedProductCard from './components/TrackedProductCard';
import ProductSearchModal from './components/ProductSearchModal';
import PriceHistoryModal from './components/PriceHistoryModal';
import ScrapeLogModal from './components/ScrapeLogModal';
import HeadedRunModal from './components/HeadedRunModal';
import AlertsDrawer from './components/AlertsDrawer';

import { Sparkles, ShieldCheck, RefreshCw, Plus, LineChart, Cpu, Layers, AlertCircle, CheckCircle2, Video } from 'lucide-react';

export default function App() {
  const [trackedProducts, setTrackedProducts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Drawers state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [selectedHistoryProduct, setSelectedHistoryProduct] = useState(null);
  const [selectedLogsProduct, setSelectedLogsProduct] = useState(null);

  // Headed Run state
  const [isHeadedModalOpen, setIsHeadedModalOpen] = useState(false);
  const [headedProduct, setHeadedProduct] = useState(null);
  const [isHeadedRunning, setIsHeadedRunning] = useState(false);
  const [headedRunData, setHeadedRunData] = useState(null);

  // Scraping in-progress state map { [productId]: boolean }
  const [scrapingMap, setScrapingMap] = useState({});
  const [isCronLoading, setIsCronLoading] = useState(false);

  useEffect(() => {
    fetchTrackedProducts();
    fetchAlerts();
  }, []);

  const fetchTrackedProducts = async () => {
    try {
      const res = await fetch('/api/tracked');
      const data = await res.json();
      if (data.success) {
        setTrackedProducts(data.products || []);
      }
    } catch (err) {
      console.error('Fetch tracked products error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/alerts');
      const data = await res.json();
      if (data.success) {
        setAlerts(data.alerts || []);
      }
    } catch (err) {
      console.error('Fetch alerts error:', err);
    }
  };

  const handleTrackProduct = async (storeProduct) => {
    try {
      const res = await fetch('/api/tracked', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeProduct)
      });
      const data = await res.json();
      if (data.success) {
        await fetchTrackedProducts();
        setIsSearchOpen(false);
      }
    } catch (err) {
      console.error('Track product error:', err);
    }
  };

  const handleUntrackProduct = async (productId) => {
    if (!confirm('Are you sure you want to stop tracking this product?')) return;
    try {
      const res = await fetch(`/api/tracked/${productId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTrackedProducts(prev => prev.filter(p => p.product_id !== productId));
      }
    } catch (err) {
      console.error('Untrack product error:', err);
    }
  };

  const handleScrapeNow = async (productId) => {
    setScrapingMap(prev => ({ ...prev, [productId]: true }));
    try {
      const res = await fetch(`/api/scrape/now/${productId}`, { method: 'POST' });
      const data = await res.json();
      await fetchTrackedProducts();
      await fetchAlerts();
    } catch (err) {
      console.error('Scrape now error:', err);
    } finally {
      setScrapingMap(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleRunHeaded = async (productId) => {
    const prod = trackedProducts.find(p => p.product_id === productId);
    setHeadedProduct(prod);
    setIsHeadedModalOpen(true);
    setIsHeadedRunning(true);
    setHeadedRunData(null);

    try {
      const res = await fetch(`/api/scrape/headed/${productId}`, { method: 'POST' });
      const data = await res.json();
      setHeadedRunData(data);
      await fetchTrackedProducts();
    } catch (err) {
      console.error('Headed run error:', err);
      setHeadedRunData({ success: false, error: err.message });
    } finally {
      setIsHeadedRunning(false);
    }
  };

  const handleTriggerCron = async () => {
    setIsCronLoading(true);
    try {
      const res = await fetch('/api/scrape/cron?secret=ine-secret-cron-key-2026');
      const data = await res.json();
      await fetchTrackedProducts();
      await fetchAlerts();
      alert(`✅ Scheduled 2-Hour Scrape Run Completed!\nTotal Products Scraped: ${data.scrapedCount || 0}`);
    } catch (err) {
      console.error('Trigger cron error:', err);
      alert(`⚠️ Scrape run error: ${err.message}`);
    } finally {
      setIsCronLoading(false);
    }
  };

  // Stats summary calculations
  const totalTracked = trackedProducts.length;
  const successfulScrapes = trackedProducts.filter(p => p.last_scrape_status === 'success' || p.last_scrape_status === 'retried').length;
  const successRate = totalTracked ? Math.round((successfulScrapes / totalTracked) * 100) : 100;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      
      {/* Header Bar */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        onTriggerCron={handleTriggerCron}
        isCronLoading={isCronLoading}
        alertsCount={alerts.length}
        onOpenAlerts={() => setIsAlertsOpen(true)}
      />

      {/* Main Dashboard Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        
        {/* Luxury Hero Banner & Intelligence Bar */}
        <div className="glass-card rounded-3xl p-6 lg:p-8 border border-gold-500/30 relative overflow-hidden bg-gradient-to-r from-burgundy-900/60 via-burgundy-950/80 to-burgundy-900/60 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-xs font-semibold text-gold-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>INE Hosted Mock Store Scraper • Unattended Reliability</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold gold-gradient-text">
                Product Price & Stock Tracker
              </h2>
              <p className="text-sm text-amber-200/70 font-light leading-relaxed">
                Automated Playwright engine with hover physics, rate-limit retries (429 recovery), 2-hour cron triggers, honest logging, and observable headed run video recording.
              </p>
            </div>

            {/* Quick Add Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="btn-gold flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-bold shadow-xl flex-shrink-0"
            >
              <Plus className="w-5 h-5 text-burgundy-950" />
              <span>Track New Product</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gold-500/20">
            <div>
              <div className="text-[10px] uppercase font-semibold tracking-wider text-amber-200/50">Tracked Items</div>
              <div className="text-2xl font-serif font-bold text-gold-300 mt-0.5">{totalTracked}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold tracking-wider text-amber-200/50">Scrape Schedule</div>
              <div className="text-2xl font-serif font-bold text-amber-100 mt-0.5">Every 2 Hours</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold tracking-wider text-amber-200/50">Scrape Reliability</div>
              <div className="text-2xl font-serif font-bold text-emerald-400 mt-0.5">{successRate}%</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold tracking-wider text-amber-200/50">Target Store</div>
              <div className="text-sm font-mono font-medium text-amber-200/80 mt-1 truncate">demo.inelabteamdev.com</div>
            </div>
          </div>
        </div>

        {/* Tracked Products Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-amber-100 flex items-center gap-2">
              <span>Tracked Products Portfolio</span>
              <span className="text-xs font-sans text-gold-400 bg-gold-500/10 border border-gold-500/20 px-2.5 py-0.5 rounded-full font-medium">
                {totalTracked} Active
              </span>
            </h3>

            <button
              onClick={fetchTrackedProducts}
              className="text-xs text-amber-200/60 hover:text-gold-300 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Dashboard</span>
            </button>
          </div>

          {isLoading ? (
            <div className="py-24 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-gold-400 animate-spin mx-auto" />
              <p className="text-xs text-amber-200/60">Loading tracked products from Supabase database...</p>
            </div>
          ) : trackedProducts.length === 0 ? (
            <div className="py-20 text-center glass-card rounded-2xl border border-gold-500/20 space-y-4">
              <Layers className="w-10 h-10 text-gold-400/50 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-serif text-lg font-bold text-amber-100">No Tracked Products Yet</h4>
                <p className="text-xs text-amber-200/60 max-w-sm mx-auto">
                  Click 'Track New Product' to search INE's hosted mock store and start monitoring price fluctuations.
                </p>
              </div>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="btn-gold inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold shadow"
              >
                <Plus className="w-4 h-4 text-burgundy-950" />
                <span>Search Store Items</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trackedProducts.map((product) => (
                <TrackedProductCard
                  key={product.product_id}
                  product={product}
                  onScrapeNow={handleScrapeNow}
                  onRunHeaded={handleRunHeaded}
                  onViewHistory={(p) => setSelectedHistoryProduct(p)}
                  onViewLogs={(p) => setSelectedLogsProduct(p)}
                  onUntrack={handleUntrackProduct}
                  isScraping={Boolean(scrapingMap[product.product_id])}
                />
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-gold-500/20 bg-burgundy-950/90 py-6 px-4 lg:px-8 mt-12 text-center text-xs text-amber-200/50">
        <p className="font-serif gold-gradient-text text-sm font-semibold">INE Software Engineer Intern Assignment — Product Price Tracker</p>
        <p className="mt-1 font-light">Target Store: https://demo.inelabteamdev.com | Stack: React + Node.js (Express) + Playwright + Supabase PostgreSQL</p>
      </footer>

      {/* Modals & Drawers */}
      <ProductSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onTrackProduct={handleTrackProduct}
        trackedProductIds={trackedProducts.map(p => p.product_id)}
      />

      <PriceHistoryModal
        isOpen={Boolean(selectedHistoryProduct)}
        onClose={() => setSelectedHistoryProduct(null)}
        product={selectedHistoryProduct}
      />

      <ScrapeLogModal
        isOpen={Boolean(selectedLogsProduct)}
        onClose={() => setSelectedLogsProduct(null)}
        product={selectedLogsProduct}
      />

      <HeadedRunModal
        isOpen={isHeadedModalOpen}
        onClose={() => setIsHeadedModalOpen(false)}
        isRunning={isHeadedRunning}
        runData={headedRunData}
        product={headedProduct}
      />

      <AlertsDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={alerts}
      />

    </div>
  );
}
