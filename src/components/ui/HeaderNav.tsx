import React, { useState } from 'react';
import { Search, Filter, Check, Palette, Layers, Zap, X, MapPin, ExternalLink } from 'lucide-react';
import { AHMEDABAD_LOCALITIES } from '../../data/ahmedabadData';
import type { PropertyProject, SearchFilters, TimeOfDay } from '../../types';

export type HeaderTheme = 'midnight' | 'emerald' | 'amber' | 'royal';

interface HeaderNavProps {
  projects: PropertyProject[];
  onSelectProject: (project: PropertyProject) => void;
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  totalResults: number;
  timeOfDay: TimeOfDay;
  onTimeOfDayChange: (time: TimeOfDay) => void;
  onResetCamera: () => void;
  headerTheme: HeaderTheme;
  setHeaderTheme: (theme: HeaderTheme) => void;
  mapType: 'roadmap' | 'hybrid' | 'terrain';
  onMapTypeChange: (type: 'roadmap' | 'hybrid' | 'terrain') => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  projects,
  onSelectProject,
  filters,
  onFilterChange,
  headerTheme,
  setHeaderTheme,
  mapType,
  onMapTypeChange,
}) => {
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter Localities
  const filteredLocalities = AHMEDABAD_LOCALITIES.filter((loc) =>
    loc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter Matching Projects by Name or Locality
  const matchingProjects = searchQuery.trim().length >= 1
    ? projects.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.builder.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 10)
    : [];

  const getThemeStyles = () => {
    switch (headerTheme) {
      case 'emerald':
        return {
          container: 'bg-emerald-950/95 border-emerald-500/40 shadow-emerald-950/90',
          logoBg: 'from-emerald-400 via-teal-300 to-cyan-400',
          searchIcon: 'text-emerald-400',
          activeBtn: 'bg-emerald-400 text-slate-950 font-bold shadow-md',
        };
      case 'amber':
        return {
          container: 'bg-stone-950/95 border-amber-500/40 shadow-amber-950/90',
          logoBg: 'from-amber-400 via-yellow-300 to-orange-400',
          searchIcon: 'text-amber-400',
          activeBtn: 'bg-amber-400 text-slate-950 font-bold shadow-md',
        };
      case 'royal':
        return {
          container: 'bg-indigo-950/95 border-indigo-500/40 shadow-indigo-950/90',
          logoBg: 'from-indigo-400 via-purple-300 to-pink-400',
          searchIcon: 'text-indigo-400',
          activeBtn: 'bg-indigo-400 text-slate-950 font-bold shadow-md',
        };
      default: // midnight
        return {
          container: 'bg-slate-950/98 border-cyan-500/40 shadow-slate-950/90',
          logoBg: 'from-cyan-400 via-teal-300 to-emerald-400',
          searchIcon: 'text-cyan-400',
          activeBtn: 'bg-cyan-400 text-slate-950 font-bold shadow-md',
        };
    }
  };

  const theme = getThemeStyles();

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. EXTREME LEFT CAPSULE (LOGO, HYBRID PROPERTY / LOCALITY SEARCH, PRICE SWITCHER) */}
      {/* ========================================================================= */}
      <div className="fixed top-4 left-5 z-50 flex items-center pointer-events-auto">
        <div className={`flex items-center gap-2.5 p-2 rounded-full backdrop-blur-3xl border shadow-2xl transition-all duration-300 ${theme.container}`}>
          
          {/* Logo */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 shrink-0">
            <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${theme.logoBg} flex items-center justify-center font-black text-slate-950 text-xs shadow-md`}>
              PD
            </div>
            <span className="text-xs font-extrabold text-white tracking-wider font-outfit">
              PropDoc
            </span>
          </div>

          {/* Search Property / Localities Input */}
          <div className="relative">
            <div
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 cursor-pointer transition-all max-w-[240px] sm:max-w-xs"
            >
              <Search className={`w-3.5 h-3.5 shrink-0 ${theme.searchIcon}`} />
              <span className="truncate flex-1 font-medium text-[11px]">
                {filters.query ? filters.query : `Search Property / Localities...`}
              </span>
              <Filter className="w-3 h-3 text-slate-400 shrink-0" />
            </div>

            {/* HYBRID LOCALITY & PROPERTY SEARCH POPOVER DRAWER */}
            {showFilterDrawer && (
              <div className="absolute top-12 left-0 w-96 p-4 rounded-3xl bg-slate-950/98 backdrop-blur-3xl border border-cyan-500/40 shadow-2xl space-y-3 text-xs animate-in fade-in slide-in-from-top-2 z-50">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-bold text-white uppercase tracking-wider text-[11px]">Search Property / Localities:</span>
                  <button
                    onClick={() => setShowFilterDrawer(false)}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* SEARCH INPUT BOX */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
                  <input
                    type="text"
                    placeholder="Type project or locality e.g. Sun South Park, Bodakdev..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      onFilterChange({ ...filters, query: e.target.value });
                    }}
                    className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-all font-medium"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        onFilterChange({ ...filters, query: '' });
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* SECTION 1: MATCHING SPECIFIC PROPERTY PROJECTS */}
                {matchingProjects.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Matching Properties:</span>
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                      {matchingProjects.map((proj) => (
                        <div
                          key={proj.id}
                          onClick={() => {
                            onSelectProject(proj);
                            setShowFilterDrawer(false);
                          }}
                          className="p-2 rounded-xl bg-slate-900/90 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/50 cursor-pointer flex items-center justify-between gap-2 transition-all group"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <img src={proj.coverImage} alt={proj.name} className="w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0" />
                            <div className="truncate">
                              <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan-300 font-outfit">{proj.name}</h4>
                              <p className="text-[10px] text-slate-400 truncate">{proj.locality} • {proj.category}</p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-emerald-400 font-mono block">
                              ₹{(proj.priceRangeMinInr / 10000000).toFixed(2)} Cr
                            </span>
                            <span className="text-[9px] text-cyan-300 flex items-center gap-0.5 justify-end">
                              <span>Open</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION 2: MATCHING LOCALITIES CHIPS */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Micro-Market Localities:</span>
                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                    {filteredLocalities.map((loc) => {
                      const isActive = (filters.locality === '' && loc === 'All Localities') || filters.locality === loc;
                      return (
                        <button
                          key={loc}
                          onClick={() => {
                            onFilterChange({ ...filters, locality: loc === 'All Localities' ? '' : loc });
                            setShowFilterDrawer(false);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                            isActive
                              ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 font-bold shadow-md scale-105'
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
              </div>
            )}
          </div>

          {/* Price Metric Switcher (Total | ₹/Sq.Ft | ₹/Sq.Yd) */}
          <div className="hidden sm:flex items-center p-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] shrink-0">
            <button
              onClick={() => onFilterChange({ ...filters, priceMetric: 'total' })}
              className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                filters.priceMetric === 'total' ? theme.activeBtn : 'text-slate-400 hover:text-white'
              }`}
            >
              Total
            </button>
            <button
              onClick={() => onFilterChange({ ...filters, priceMetric: 'sqft' })}
              className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                filters.priceMetric === 'sqft' ? theme.activeBtn : 'text-slate-400 hover:text-white'
              }`}
            >
              ₹/Sq.Ft
            </button>
            <button
              onClick={() => onFilterChange({ ...filters, priceMetric: 'sqyd' })}
              className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                filters.priceMetric === 'sqyd' ? theme.activeBtn : 'text-slate-400 hover:text-white'
              }`}
            >
              ₹/Sq.Yd
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. EXTREME RIGHT CAPSULE (3D SATELLITE, FAST VECTOR, TERRAIN TOPO, COLOR PALETTE) */}
      {/* ========================================================================= */}
      <div className="fixed top-4 right-5 z-50 flex items-center pointer-events-auto">
        <div className={`flex items-center gap-2 p-2 rounded-full backdrop-blur-3xl border shadow-2xl transition-all duration-300 ${theme.container}`}>
          
          {/* Map Type Switcher Buttons */}
          <div className="flex items-center p-0.5 rounded-full bg-white/5 border border-white/10 text-[11px]">
            <button
              onClick={() => onMapTypeChange('hybrid')}
              className={`px-3 py-1 rounded-full font-bold transition-all flex items-center gap-1 ${
                mapType === 'hybrid' ? theme.activeBtn : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>3D Satellite</span>
            </button>
            <button
              onClick={() => onMapTypeChange('roadmap')}
              className={`px-3 py-1 rounded-full font-bold transition-all flex items-center gap-1 ${
                mapType === 'roadmap' ? theme.activeBtn : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Fast Vector</span>
            </button>
            <button
              onClick={() => onMapTypeChange('terrain')}
              className={`px-3 py-1 rounded-full font-bold transition-all flex items-center gap-1 ${
                mapType === 'terrain' ? theme.activeBtn : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>Terrain Topo</span>
            </button>
          </div>

          {/* Theme Color Customizer */}
          <div className="relative">
            <button
              onClick={() => setShowThemePicker(!showThemePicker)}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
              title="Customize Theme Color"
            >
              <Palette className="w-4 h-4 text-cyan-400" />
            </button>

            {showThemePicker && (
              <div className="absolute top-12 right-0 p-3 rounded-2xl bg-slate-950/95 backdrop-blur-2xl border border-white/20 shadow-2xl flex items-center gap-2 z-50">
                {(['midnight', 'emerald', 'amber', 'royal'] as HeaderTheme[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setHeaderTheme(t); setShowThemePicker(false); }}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      headerTheme === t ? 'scale-125 border-white ring-2 ring-cyan-400' : 'border-transparent opacity-70 hover:opacity-100'
                    } ${
                      t === 'midnight' ? 'bg-cyan-500' : t === 'emerald' ? 'bg-emerald-500' : t === 'amber' ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
