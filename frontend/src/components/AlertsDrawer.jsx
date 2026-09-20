import React from 'react';
import { X, Bell, TrendingDown, PackageCheck, ShieldAlert } from 'lucide-react';

export default function AlertsDrawer({ isOpen, onClose, alerts = [] }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-burgundy-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md h-full glass-card border-l border-gold-500/30 flex flex-col shadow-2xl animate-slide-up">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-gold-500/20 flex items-center justify-between bg-burgundy-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gold-500/10 text-gold-400 border border-gold-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold gold-gradient-text">Price & Stock Alerts</h2>
              <p className="text-xs text-amber-200/60">Automated price-drop & back-in-stock alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-amber-200/60 hover:text-gold-300 hover:bg-burgundy-800/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {alerts.length === 0 ? (
            <div className="py-20 text-center space-y-3 bg-burgundy-900/20 rounded-xl border border-gold-500/10">
              <Bell className="w-8 h-8 text-gold-400/40 mx-auto" />
              <p className="text-sm font-medium text-amber-200/80">No price alerts yet</p>
              <p className="text-xs text-amber-200/50 max-w-xs mx-auto">
                Alerts will automatically trigger when a tracked product drops in price or comes back in stock.
              </p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-xl bg-burgundy-900/50 border border-gold-500/20 space-y-2 hover:border-gold-500/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-gold-300">
                    {alert.type === 'price_drop' ? (
                      <TrendingDown className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <PackageCheck className="w-4 h-4 text-gold-400" />
                    )}
                    {alert.title}
                  </span>
                  <span className="text-[10px] text-amber-200/40 font-mono">
                    {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-amber-100/90 font-light">
                  {alert.message}
                </p>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
