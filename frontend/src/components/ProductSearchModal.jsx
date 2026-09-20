import React, { useState, useEffect } from 'react';
import { Search, X, PlusCircle, CheckCircle2, Loader2, ExternalLink, Tag, ShieldAlert } from 'lucide-react';

export default function ProductSearchModal({ isOpen, onClose, onTrackProduct, trackedProductIds = [] }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      handleSearch('');
    }
  }, [isOpen]);

  const handleSearch = async (searchTerm) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/store/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.items || []);
      }
    } catch (err) {
      console.error('Search Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleTrack = async (product) => {
    setAddingId(product.product_id);
    await onTrackProduct(product);
    setAddingId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-burgundy-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl max-h-[85vh] glass-card rounded-2xl border border-gold-500/30 overflow-hidden flex flex-col shadow-2xl animate-slide-up">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-gold-500/20 flex items-center justify-between bg-burgundy-900/60">
          <div>
            <h2 className="font-serif text-xl font-bold gold-gradient-text">Search INE Hosted Mock Store</h2>
            <p className="text-xs text-amber-200/60">
              Type product name or SKU to browse items on <span className="text-gold-300">https://demo.inelabteamdev.com</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-amber-200/60 hover:text-gold-300 hover:bg-burgundy-800/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-6 pb-4">
          <form onSubmit={handleFormSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              placeholder="Search by full or partial product name (e.g. 'Helix', 'Audio', 'Headset', 'p-1')..."
              className="w-full pl-12 pr-28 py-3.5 rounded-xl bg-burgundy-900/90 border border-gold-500/30 text-amber-50 placeholder-amber-200/40 focus:outline-none focus:border-gold-400 text-sm shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 btn-gold px-4 py-2 rounded-lg text-xs font-semibold"
            >
              Search
            </button>
          </form>
        </div>

        {/* Catalog Search Results Grid */}
        <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-4">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-gold-400 animate-spin mx-auto" />
              <p className="text-xs text-amber-200/60">Querying INE store catalog...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-burgundy-900/20 rounded-xl border border-gold-500/10">
              <ShieldAlert className="w-8 h-8 text-gold-400/60 mx-auto" />
              <p className="text-sm font-medium text-amber-200/80">No matching products found</p>
              <p className="text-xs text-amber-200/50">Try searching for 'Audio', 'Helix', or leave query blank to browse all items.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((item) => {
                const isTracked = trackedProductIds.includes(item.product_id);
                const isAdding = addingId === item.product_id;

                return (
                  <div
                    key={item.product_id}
                    className="p-4 rounded-xl bg-burgundy-900/50 border border-gold-500/20 flex gap-4 hover:border-gold-500/50 transition-all glass-card-hover group"
                  >
                    {/* Item Image */}
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-burgundy-950 border border-gold-500/20 flex-shrink-0 relative">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded border border-gold-500/20">
                            {item.category}
                          </span>
                          <span className="text-[10px] text-amber-200/50 font-mono">
                            ID: {item.product_id}
                          </span>
                        </div>
                        <h3 className="text-sm font-serif font-semibold text-amber-100 truncate group-hover:text-gold-300 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs text-amber-200/60 font-light line-clamp-2 mt-0.5">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gold-500/10">
                        <span className="text-[11px] text-amber-200/50">
                          Brand: <strong className="text-amber-200">{item.brand}</strong>
                        </span>

                        {isTracked ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Tracked
                          </span>
                        ) : (
                          <button
                            onClick={() => handleTrack(item)}
                            disabled={isAdding}
                            className="btn-gold flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow"
                          >
                            {isAdding ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <PlusCircle className="w-3.5 h-3.5 text-burgundy-950" />
                            )}
                            <span>{isAdding ? 'Adding...' : 'Track Product'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
