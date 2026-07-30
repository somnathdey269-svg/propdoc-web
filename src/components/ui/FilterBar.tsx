import React, { useState } from 'react';
import type { SearchFilters, PropertyCategory } from '../../types';
import { AHMEDABAD_LOCALITIES } from '../../data/ahmedabadData';
import { Filter, AlertCircle, ChevronDown, ChevronUp, Check, Tag, Key } from 'lucide-react';

interface FilterBarProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  totalResults: number;
}

const CATEGORIES: PropertyCategory[] = [
  'Luxury',
  'Residential',
  'Commercial',
  'Villa',
  'Penthouse',
  'Bank Auction'
];

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, totalResults }) => {
  const [isOpen, setIsOpen] = useState(false);

  const activeLocality = filters.locality || 'All Localities';
  const activeCategory = filters.category || 'All Categories';

  return (
    <div className="fixed top-20 left-4 md:left-8 z-30 flex flex-col items-start gap-2 max-w-full">
      <div className="flex items-center gap-2">
        {/* BUY VS RENT COMPACT TOGGLE PILLS */}
        <div className="p-1 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/20 shadow-2xl flex items-center gap-1 text-xs">
          <button
            onClick={() => onFilterChange({ ...filters, listingType: filters.listingType === 'Sale' ? 'All' : 'Sale' })}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              filters.listingType === 'Sale'
                ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Buy (Sale)</span>
          </button>

          <button
            onClick={() => onFilterChange({ ...filters, listingType: filters.listingType === 'Rent' ? 'All' : 'Rent' })}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              filters.listingType === 'Rent'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Rent (Lease)</span>
          </button>
        </div>

        {/* Smart Collapsible Filter Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-2xl border border-white/15 shadow-2xl text-xs text-white font-semibold flex items-center gap-3 hover:border-cyan-500/40 transition-all group"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>Filters: <strong className="text-cyan-300">{activeLocality}</strong> • <strong className="text-emerald-300">{activeCategory}</strong></span>
          </div>

          <div className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-bold border border-cyan-500/30">
            {totalResults} Projects
          </div>

          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>
      </div>

      {/* Expanded Smart Filter Drawer */}
      {isOpen && (
        <div className="p-4 rounded-3xl bg-slate-900/95 backdrop-blur-3xl border border-white/15 shadow-2xl space-y-3 max-w-2xl w-full text-xs animate-in fade-in slide-in-from-top-2">
          {/* Localities Horizontal Scroll */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Ahmedabad Micro-Markets:</span>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto no-scrollbar">
              {AHMEDABAD_LOCALITIES.map((loc) => {
                const isActive = (filters.locality === '' && loc === 'All Localities') || filters.locality === loc;
                return (
                  <button
                    key={loc}
                    onClick={() => onFilterChange({ ...filters, locality: loc === 'All Localities' ? '' : loc })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                    }`}
                  >
                    {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                    <span>{loc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="space-y-1.5 pt-2 border-t border-white/10">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Property Category:</span>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => {
                const isActive = filters.category === cat;
                let activeStyle = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
                if (cat === 'Bank Auction') activeStyle = 'bg-rose-500/20 text-rose-300 border-rose-500/40';

                return (
                  <button
                    key={cat}
                    onClick={() => onFilterChange({ ...filters, category: isActive ? '' : cat })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      isActive
                        ? `${activeStyle} font-bold shadow-md`
                        : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/10'
                    }`}
                  >
                    {cat === 'Bank Auction' && <AlertCircle className="w-3 h-3 inline mr-1 text-rose-400" />}
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
