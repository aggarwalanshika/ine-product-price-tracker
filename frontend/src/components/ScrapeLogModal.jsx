import React, { useState, useEffect } from 'react';
import { X, FileText, CheckCircle, AlertTriangle, XCircle, Clock, ShieldAlert, Filter, Loader2 } from 'lucide-react';

export default function ScrapeLogModal({ isOpen, onClose, product }) {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      fetchLogs();
    }
  }, [isOpen, product]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tracked/${product.product_id}/logs`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Logs Fetch Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  const filteredLogs = logs.filter(log => {
    if (filter === 'ALL') return true;
    return log.status.toUpperCase() === filter;
  });

  const formatPrice = (val) => {
    if (!val) return '—';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: product.currency || 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const getStatusPill = (status) => {
    const s = status.toLowerCase();
    if (s === 'success') {
      return (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
          <CheckCircle className="w-3 h-3 text-emerald-400" />
          SUCCESS
        </span>
      );
    }
    if (s === 'retried') {
      return (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          RETRIED (RECOVERED)
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/30 px-2.5 py-0.5 rounded-full animate-pulse">
        <XCircle className="w-3 h-3 text-rose-400" />
        FAILED
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-burgundy-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl max-h-[90vh] glass-card rounded-2xl border border-gold-500/30 overflow-hidden flex flex-col shadow-2xl animate-slide-up">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-gold-500/20 flex items-center justify-between bg-burgundy-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold gold-gradient-text">Honest Scrape Logs & Attempt History</h2>
              <p className="text-xs text-amber-200/60">
                Per-attempt audit log for <strong className="text-gold-300 font-normal">{product.title}</strong> (ID: {product.product_id})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-amber-200/60 hover:text-gold-300 hover:bg-burgundy-800/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="px-6 py-4 border-b border-gold-500/15 flex items-center justify-between bg-burgundy-900/30">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gold-400" />
            <span className="text-xs text-amber-200/70 font-medium">Filter Outcome:</span>
            {['ALL', 'SUCCESS', 'RETRIED', 'FAILED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  filter === tab
                    ? 'bg-gold-500 text-burgundy-950 shadow'
                    : 'bg-burgundy-900/60 text-amber-200/60 hover:text-amber-100 hover:bg-burgundy-800/60 border border-gold-500/20'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <span className="text-xs text-amber-200/50 font-mono">
            Total Log Entries: {filteredLogs.length}
          </span>
        </div>

        {/* Log Table Body */}
        <div className="flex-1 overflow-y-auto p-6 pt-2">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-gold-400 animate-spin mx-auto" />
              <p className="text-xs text-amber-200/60">Loading honest scrape audit log...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-16 text-center space-y-2 bg-burgundy-900/20 rounded-xl border border-gold-500/10">
              <ShieldAlert className="w-8 h-8 text-gold-400/60 mx-auto" />
              <p className="text-sm font-medium text-amber-200/80">No scrape log entries match filter</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-amber-100/90 border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-[11px] font-semibold text-gold-300 uppercase tracking-wider">
                    <th className="pb-2 px-3">Timestamp</th>
                    <th className="pb-2 px-3">Outcome</th>
                    <th className="pb-2 px-3">Attempts</th>
                    <th className="pb-2 px-3">Duration</th>
                    <th className="pb-2 px-3">Extracted Price</th>
                    <th className="pb-2 px-3">Stock</th>
                    <th className="pb-2 px-3">HTTP Status</th>
                    <th className="pb-2 px-3">Details / Error Log</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="bg-burgundy-900/40 border border-gold-500/15 rounded-xl hover:bg-burgundy-900/80 transition-colors"
                    >
                      <td className="py-3 px-3 rounded-l-xl font-mono text-[11px] text-amber-200/80">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        {getStatusPill(log.status)}
                      </td>
                      <td className="py-3 px-3 font-semibold text-amber-200">
                        {log.attempt_count} / 5
                      </td>
                      <td className="py-3 px-3 font-mono text-amber-200/80">
                        {log.duration_ms} ms
                      </td>
                      <td className="py-3 px-3 font-serif font-bold text-gold-300">
                        {formatPrice(log.price_extracted)}
                      </td>
                      <td className="py-3 px-3 text-amber-200/90">
                        {log.stock_extracted !== null ? `${log.stock_extracted} units` : '—'}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.http_status === 200 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                          {log.http_status || 200}
                        </span>
                      </td>
                      <td className="py-3 px-3 rounded-r-xl text-amber-200/70 font-mono text-[11px] max-w-xs truncate">
                        {log.error_message ? (
                          <span className="text-rose-300" title={log.error_message}>
                            ⚠️ {log.error_message}
                          </span>
                        ) : (
                          <span className="text-emerald-400/80">
                            Clean extraction via Playwright
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
