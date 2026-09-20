import React, { useState, useEffect } from 'react';
import { X, LineChart, TrendingDown, TrendingUp, DollarSign, Calendar, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PriceHistoryModal({ isOpen, onClose, product }) {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      fetchHistory();
    }
  }, [isOpen, product]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tracked/${product.product_id}/history`);
      const data = await res.json();
      if (data.success) {
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error('History Fetch Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  // Transform data for Recharts
  const chartData = history.map(item => ({
    time: new Date(item.scraped_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    price: item.price,
    mrp: item.mrp || item.price * 1.25,
    stock: item.stock
  }));

  const prices = history.map(h => h.price);
  const minPrice = prices.length ? Math.min(...prices) : product.current_price;
  const maxPrice = prices.length ? Math.max(...prices) : product.current_price;
  const latestPrice = prices.length ? prices[prices.length - 1] : product.current_price;
  const firstPrice = prices.length ? prices[0] : product.current_price;
  const priceChange = firstPrice ? Math.round(((latestPrice - firstPrice) / firstPrice) * 100) : 0;

  const formatCurrency = (val) => {
    if (!val) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: product.currency || 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-burgundy-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] glass-card rounded-2xl border border-gold-500/30 overflow-hidden flex flex-col shadow-2xl animate-slide-up">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-gold-500/20 flex items-center justify-between bg-burgundy-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400">
              <LineChart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold gold-gradient-text">Price & Stock History</h2>
              <p className="text-xs text-amber-200/60">
                Product: <strong className="text-gold-300 font-normal">{product.title}</strong> (ID: {product.product_id})
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

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Key Metric Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            <div className="p-4 rounded-xl bg-burgundy-900/50 border border-gold-500/20">
              <div className="text-[10px] uppercase font-semibold text-amber-200/50">Current Price</div>
              <div className="text-xl font-serif font-bold text-gold-300 mt-1">
                {formatCurrency(latestPrice)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-burgundy-900/50 border border-gold-500/20">
              <div className="text-[10px] uppercase font-semibold text-amber-200/50">Lowest Recorded</div>
              <div className="text-xl font-serif font-bold text-emerald-400 mt-1">
                {formatCurrency(minPrice)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-burgundy-900/50 border border-gold-500/20">
              <div className="text-[10px] uppercase font-semibold text-amber-200/50">Highest Recorded</div>
              <div className="text-xl font-serif font-bold text-amber-200 mt-1">
                {formatCurrency(maxPrice)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-burgundy-900/50 border border-gold-500/20">
              <div className="text-[10px] uppercase font-semibold text-amber-200/50">Net Price Trend</div>
              <div className={`text-xl font-serif font-bold mt-1 flex items-center gap-1 ${priceChange <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {priceChange <= 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                <span>{priceChange > 0 ? `+${priceChange}%` : `${priceChange}%`}</span>
              </div>
            </div>

          </div>

          {/* Recharts Area Chart Container */}
          <div className="p-6 rounded-2xl bg-burgundy-900/40 border border-gold-500/20 space-y-4">
            <h3 className="text-sm font-serif font-semibold text-amber-100 flex items-center gap-2">
              <span>Price Trend Over Time</span>
              <span className="text-[10px] text-amber-200/40 font-mono">({chartData.length} data points)</span>
            </h3>

            {isLoading ? (
              <div className="h-64 flex items-center justify-center space-y-2">
                <Loader2 className="w-8 h-8 text-gold-400 animate-spin mx-auto" />
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-amber-200/50">
                No historical price records collected yet. Click 'Scrape Now' to capture initial data points.
              </div>
            ) : (
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#d4af37" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 175, 55, 0.1)" />
                    <XAxis dataKey="time" stroke="rgba(243, 229, 171, 0.5)" tick={{ fontSize: 10 }} />
                    <YAxis stroke="rgba(243, 229, 171, 0.5)" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1b061f',
                        borderColor: 'rgba(212, 175, 55, 0.4)',
                        borderRadius: '0.75rem',
                        color: '#f3e5ab',
                        fontSize: '12px'
                      }}
                      formatter={(val) => [formatCurrency(val), 'Price']}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#d4af37"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#goldGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
