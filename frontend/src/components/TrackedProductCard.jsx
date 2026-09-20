import React from 'react';
import { RefreshCw, Video, LineChart, FileText, Trash2, Clock, CheckCircle, AlertTriangle, XCircle, TrendingDown, ExternalLink, Sparkles } from 'lucide-react';

export default function TrackedProductCard({
  product,
  onScrapeNow,
  onRunHeaded,
  onViewHistory,
  onViewLogs,
  onUntrack,
  isScraping
}) {
  const formatPrice = (val) => {
    if (!val) return '—';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: product.currency || 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const calculateDiscount = () => {
    if (product.mrp && product.current_price && product.mrp > product.current_price) {
      return Math.round(((product.mrp - product.current_price) / product.mrp) * 100);
    }
    return null;
  };

  const discount = calculateDiscount();

  const getStatusBadge = () => {
    const status = product.last_scrape_status;
    if (status === 'success') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
          <CheckCircle className="w-3 h-3 text-emerald-400" />
          SUCCESS
        </span>
      );
    }
    if (status === 'retried') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          RETRIED (RECOVERED)
        </span>
      );
    }
    if (status === 'failed') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full animate-pulse">
          <XCircle className="w-3 h-3 text-rose-400" />
          FAILED
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-200/60 bg-burgundy-900/60 border border-gold-500/20 px-2 py-0.5 rounded-full">
        PENDING INITIAL SCRAPE
      </span>
    );
  };

  return (
    <div className="glass-card glass-card-hover rounded-2xl overflow-hidden border border-gold-500/25 flex flex-col group relative">
      
      {/* Top Banner Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-burgundy-950">
        <img
          src={product.image_url}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-burgundy-950 via-burgundy-950/30 to-transparent" />
        
        {/* Category & Status Overlay Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gold-300 bg-burgundy-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-gold-500/30">
            {product.category || 'General'}
          </span>
          {getStatusBadge()}
        </div>

        {/* Discount Badge if available */}
        {discount && (
          <div className="absolute bottom-3 left-3 bg-rose-600/90 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg backdrop-blur-sm border border-rose-400/40">
            <TrendingDown className="w-3 h-3" />
            {discount}% OFF
          </div>
        )}

        {/* Product ID Badge */}
        <div className="absolute bottom-3 right-3 text-[10px] font-mono text-amber-200/80 bg-burgundy-950/80 backdrop-blur-sm px-2 py-0.5 rounded border border-gold-500/20">
          ID: {product.product_id}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gold-400 font-medium tracking-wide">
              {product.brand}
            </span>
            <a
              href={`https://demo.inelabteamdev.com/product/${product.product_id}`}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-amber-200/50 hover:text-gold-300 flex items-center gap-1 transition-colors"
            >
              <span>Mock Store Page</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <h3 className="font-serif text-lg font-bold text-amber-100 mt-1 line-clamp-1 group-hover:text-gold-300 transition-colors">
            {product.title}
          </h3>
        </div>

        {/* Price & Stock Display Box */}
        <div className="p-3.5 rounded-xl bg-burgundy-900/60 border border-gold-500/20 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-medium text-amber-200/50">Current Price</div>
            <div className="text-2xl font-serif font-bold text-gold-300 flex items-baseline gap-2">
              <span>{formatPrice(product.current_price)}</span>
              {product.mrp && product.mrp > product.current_price && (
                <span className="text-xs font-sans text-amber-200/40 line-through font-normal">
                  {formatPrice(product.mrp)}
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] uppercase font-medium text-amber-200/50">Availability</div>
            <div className="text-xs font-semibold text-emerald-400 mt-0.5">
              {product.stock_status || (product.current_stock ? `${product.current_stock} in stock` : 'In Stock')}
            </div>
          </div>
        </div>

        {/* Timestamp of Last Scrape */}
        <div className="flex items-center justify-between text-[11px] text-amber-200/50 px-1">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gold-400/70" />
            <span>
              Last Scraped:{' '}
              <strong className="text-amber-200/80 font-normal">
                {product.last_scraped_at ? new Date(product.last_scraped_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
              </strong>
            </span>
          </div>

          <button
            onClick={() => onUntrack(product.product_id)}
            className="text-amber-200/40 hover:text-rose-400 transition-colors p-1"
            title="Untrack product"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Controls Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gold-500/15">
          
          {/* Instant Manual Scrape */}
          <button
            onClick={() => onScrapeNow(product.product_id)}
            disabled={isScraping}
            className="btn-burgundy-outline flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium"
            title="Trigger instant manual scrape"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gold-400 ${isScraping ? 'animate-spin' : ''}`} />
            <span>{isScraping ? 'Scraping...' : 'Scrape Now'}</span>
          </button>

          {/* Observable Headed Run Demo */}
          <button
            onClick={() => onRunHeaded(product.product_id)}
            className="bg-purple-900/60 border border-purple-400/40 hover:bg-purple-800/70 text-purple-200 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all"
            title="Launch Playwright in headed mode with video recording"
          >
            <Video className="w-3.5 h-3.5 text-purple-300" />
            <span>Headed Demo</span>
          </button>

          {/* Price History Chart */}
          <button
            onClick={() => onViewHistory(product)}
            className="btn-burgundy-outline flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium"
            title="View price history chart"
          >
            <LineChart className="w-3.5 h-3.5 text-gold-400" />
            <span>History</span>
          </button>

          {/* Honest Scrape Logs */}
          <button
            onClick={() => onViewLogs(product)}
            className="btn-burgundy-outline flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium"
            title="View honest scrape attempt logs"
          >
            <FileText className="w-3.5 h-3.5 text-gold-400" />
            <span>Logs</span>
          </button>

        </div>

      </div>

    </div>
  );
}
