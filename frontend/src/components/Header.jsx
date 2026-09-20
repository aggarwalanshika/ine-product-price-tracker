import React from 'react';
import { Search, RefreshCw, Clock, Sparkles, Bell, ShieldCheck, Play } from 'lucide-react';

export default function Header({ onOpenSearch, onTriggerCron, isCronLoading, alertsCount, onOpenAlerts }) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-burgundy-950/80 border-b border-gold-500/20 px-4 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Emblem */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-300 via-gold-500 to-amber-700 flex items-center justify-center shadow-lg shadow-gold-500/20 border border-gold-300/40">
            <Sparkles className="w-5 h-5 text-burgundy-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold tracking-tight gold-gradient-text">INE LUXE</h1>
              <span className="text-[10px] uppercase tracking-widest font-semibold bg-gold-500/10 text-gold-300 border border-gold-500/30 px-2 py-0.5 rounded-full">
                Price Tracker
              </span>
            </div>
            <p className="text-xs text-amber-200/60 font-light">
              Automated Scraping & Intelligence Dashboard • Target: <span className="text-gold-300 font-medium">demo.inelabteamdev.com</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-3">
          
          {/* Cron 2-Hour Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-burgundy-900/60 border border-gold-500/20 text-xs text-amber-100/80">
            <Clock className="w-3.5 h-3.5 text-gold-400" />
            <span>Schedule: <strong className="text-gold-300">Every 2 Hours</strong></span>
          </div>

          {/* Alert Notification Button */}
          <button
            onClick={onOpenAlerts}
            className="relative p-2 rounded-lg bg-burgundy-900/80 border border-gold-500/30 text-amber-200 hover:text-gold-300 transition-all hover:bg-burgundy-800/80"
            title="Price Drop Alerts"
          >
            <Bell className="w-4 h-4" />
            {alertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {alertsCount}
              </span>
            )}
          </button>

          {/* Trigger Cron Job Now */}
          <button
            onClick={onTriggerCron}
            disabled={isCronLoading}
            className="btn-burgundy-outline flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium"
            title="Trigger scheduled 2-hour scrape endpoint"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gold-400 ${isCronLoading ? 'animate-spin' : ''}`} />
            <span>{isCronLoading ? 'Scraping All...' : 'Run Scheduled Scrape'}</span>
          </button>

          {/* Search Store Modal Trigger */}
          <button
            onClick={onOpenSearch}
            className="btn-gold flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-lg"
          >
            <Search className="w-4 h-4 text-burgundy-950" />
            <span>Search INE Store</span>
          </button>

        </div>

      </div>
    </header>
  );
}
