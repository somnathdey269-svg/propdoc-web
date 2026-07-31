import React, { useState, useRef } from 'react';
import { 
  X, 
  Play, 
  Square, 
  MapPin, 
  Layers, 
  Zap, 
  Terminal, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Sparkles,
  Sliders
} from 'lucide-react';
import { runScraperTask } from '../../../scripts/scraper-microservice/scraperEngine';

interface ScraperWizardModalProps {
  portalName: 'gujrera' | '99acres' | 'magicbricks' | 'squareyards' | 'all';
  portalDisplayName: string;
  onClose: () => void;
  onJobComplete?: () => void;
}

export const ScraperWizardModal: React.FC<ScraperWizardModalProps> = ({
  portalName,
  portalDisplayName,
  onClose,
  onJobComplete,
}) => {
  // Config Form State
  const [targetCities, setTargetCities] = useState<string[]>(['Ahmedabad', 'Gandhinagar']);
  const [category, setCategory] = useState<'all' | 'residential' | 'commercial' | 'auction'>('all');
  const [scrapeMode, setScrapeMode] = useState<'full' | 'delta' | 'single'>('full');
  const [maxPages, setMaxPages] = useState<number>(10);
  const [delayMs, setDelayMs] = useState<number>(400);
  const [singleProjectQuery, setSingleProjectQuery] = useState<string>('');

  // Execution & Live Stream State
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isCancelled, setIsCancelled] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentItem, setCurrentItem] = useState<{
    name: string;
    locality?: string;
    rera_id?: string;
    price?: number;
    matchScore: number;
    status: string;
    current: number;
    total: number;
  } | null>(null);

  const [liveLogs, setLiveLogs] = useState<{ id: string; message: string; type: 'info' | 'success' | 'warn' | 'error' }[]>([]);
  
  // Ref for cancellation signal
  const cancelSignalRef = useRef<boolean>(false);

  const handleCityToggle = (city: string) => {
    if (targetCities.includes(city)) {
      if (targetCities.length > 1) {
        setTargetCities(targetCities.filter((c) => c !== city));
      }
    } else {
      setTargetCities([...targetCities, city]);
    }
  };

  const handleStartCrawl = async () => {
    setIsExecuting(true);
    setIsCancelled(false);
    cancelSignalRef.current = false;
    setProgress(5);

    setLiveLogs([
      { id: Date.now().toString(), message: `🚀 Launching ${portalDisplayName} crawler (${scrapeMode.toUpperCase()} mode)...`, type: 'info' },
      { id: (Date.now() + 1).toString(), message: `Scope locked to: ${targetCities.join(', ')} | Category: ${category.toUpperCase()}`, type: 'info' },
    ]);

    try {
      await runScraperTask({
        portalName,
        targetCities,
        category,
        scrapeMode,
        maxPages,
        delayMs,
        singleProjectQuery,
        shouldStop: () => cancelSignalRef.current,
        onItemScraped: (item) => {
          setCurrentItem(item);
          const pct = Math.round((item.current / item.total) * 100);
          setProgress(pct);

          setLiveLogs((prev) => [
            {
              id: Date.now().toString(),
              message: `[${item.current}/${item.total}] ${item.name} (${item.locality}) | Price: ₹ ${(item.price ? item.price / 100000 : 0).toFixed(2)} Lacs | ${item.status}`,
              type: item.matchScore >= 85 ? 'success' : item.matchScore >= 60 ? 'warn' : 'info',
            },
            ...prev,
          ]);
        },
      });

      if (!cancelSignalRef.current) {
        setProgress(100);
        setLiveLogs((prev) => [
          { id: Date.now().toString(), message: `🎉 Scrape task for ${portalDisplayName} completed cleanly!`, type: 'success' },
          ...prev,
        ]);
        if (onJobComplete) onJobComplete();
      }
    } catch (e: any) {
      setLiveLogs((prev) => [
        { id: Date.now().toString(), message: `Execution Error: ${e.message}`, type: 'error' },
        ...prev,
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleStopCrawl = () => {
    cancelSignalRef.current = true;
    setIsCancelled(true);
    setIsExecuting(false);
    setLiveLogs((prev) => [
      { id: Date.now().toString(), message: `🛑 [STOP REQUESTED] User aborted scraper task! Stopping immediately...`, type: 'error' },
      ...prev,
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-6 my-auto">
        {/* Ambient Glow Header */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-2xl text-white shadow-md">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{portalDisplayName}</h2>
                <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Interactive Wizard
                </span>
              </div>
              <p className="text-xs text-slate-400">Configure target locations, scrape modes, and page limits before launching.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* IF NOT EXECUTING -> SHOW INTERACTIVE CONFIGURATION FORM */}
        {!isExecuting && progress !== 100 && (
          <div className="space-y-6">
            {/* 1. Target Cities / Scope Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" /> 1. Select Target Cities & Districts
              </label>
              <div className="flex flex-wrap gap-2">
                {['Ahmedabad', 'Gandhinagar', 'GIFT City', 'Vadodara', 'Surat'].map((city) => (
                  <button
                    key={city}
                    onClick={() => handleCityToggle(city)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      targetCities.includes(city)
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Category & Scrape Execution Mode Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" /> 2. Property Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Categories (Residential + Commercial)</option>
                  <option value="residential">Residential Apartments & Villas Only</option>
                  <option value="commercial">Commercial Offices & Shops Only</option>
                  <option value="auction">Bank Auctions & Special Distress Deals</option>
                </select>
              </div>

              {/* Scrape Execution Mode */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" /> 3. Scrape Execution Mode
                </label>
                <select
                  value={scrapeMode}
                  onChange={(e) => setScrapeMode(e.target.value as any)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="full">Full Registry Crawl (Pages 1 to N)</option>
                  <option value="delta">Delta Crawl (Registered in last 30 days)</option>
                  <option value="single">Single Project Lookup / RERA ID</option>
                </select>
              </div>
            </div>

            {/* Single Project Search Query Input (If Single Mode Selected) */}
            {scrapeMode === 'single' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Enter Project Name or RERA Registration Number
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={singleProjectQuery}
                    onChange={(e) => setSingleProjectQuery(e.target.value)}
                    placeholder="e.g. Verona Elegance or PR/GJ/AHMEDABAD/..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* 3. Crawl Depth & Polite Delay Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Max Pages to Crawl
                </label>
                <select
                  value={maxPages}
                  onChange={(e) => setMaxPages(parseInt(e.target.value))}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                >
                  <option value={5}>5 Pages (Quick Scan)</option>
                  <option value={10}>10 Pages (Standard)</option>
                  <option value={25}>25 Pages (Deep Scan)</option>
                  <option value={100}>100 Pages (Full Crawl)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Request Delay (Anti-Bot Protection)
                </label>
                <select
                  value={delayMs}
                  onChange={(e) => setDelayMs(parseInt(e.target.value))}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                >
                  <option value={200}>200ms (Fast)</option>
                  <option value={400}>400ms (Polite Default)</option>
                  <option value={1000}>1.0 sec (High Anti-Bot Safe)</option>
                  <option value={2000}>2.0 sec (Stealth Mode)</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-4 py-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleStartCrawl}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:opacity-95 rounded-xl text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
              >
                <Play className="w-4 h-4 fill-current" /> 🚀 Launch Customized Scrape Job
              </button>
            </div>
          </div>
        )}

        {/* REAL-TIME LIVE MONITORING STREAM (WHILE EXECUTING OR FINISHED) */}
        {(isExecuting || progress > 0) && (
          <div className="space-y-6">
            {/* Live Progress Bar & Control Buttons */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-2 text-indigo-300">
                  {isExecuting ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  {isExecuting
                    ? `Scraping ${portalDisplayName}... Processing items`
                    : isCancelled
                    ? '🛑 Scraper Aborted by Admin'
                    : '🎉 Job Execution Completed!'}
                </span>
                <span className="text-cyan-400">{progress}%</span>
              </div>

              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* STOP / ABORT SCRAPER BUTTON */}
              {isExecuting && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleStopCrawl}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all animate-pulse"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" /> 🛑 STOP / ABORT SCRAPER
                  </button>
                </div>
              )}
            </div>

            {/* REAL-TIME CARD SHOWING EXACT ITEM BEING SCRAPED RIGHT NOW */}
            {currentItem && (
              <div className="p-5 bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-500/40 rounded-2xl space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded font-bold uppercase tracking-wider">
                    Scraping Item #{currentItem.current} of {currentItem.total}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold">
                    {currentItem.status}
                  </span>
                </div>

                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-400" /> {currentItem.name}
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Locality</span>
                    <span className="text-slate-200 font-semibold">{currentItem.locality || 'Ahmedabad'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">RERA Number</span>
                    <span className="text-amber-400 font-mono font-bold text-[11px]">
                      {currentItem.rera_id || 'GujRERA Verified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Extracted Price</span>
                    <span className="text-emerald-400 font-bold font-mono">
                      ₹ {(currentItem.price ? currentItem.price / 100000 : 0).toFixed(2)} Lacs
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* LIVE REAL-TIME TERMINAL STREAM */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs max-h-56 overflow-y-auto space-y-2">
              <div className="text-[10px] text-slate-500 font-sans border-b border-slate-800 pb-1 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" /> Real-time Streaming Extraction Stream
                </span>
                <span>Live Feed</span>
              </div>

              {liveLogs.map((l) => (
                <div key={l.id} className="leading-relaxed flex items-start gap-2">
                  {l.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />}
                  {l.type === 'warn' && <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />}
                  {l.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />}
                  {l.type === 'info' && <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />}
                  <span
                    className={
                      l.type === 'success' ? 'text-emerald-300' :
                      l.type === 'warn' ? 'text-amber-300' :
                      l.type === 'error' ? 'text-rose-400 font-bold' :
                      'text-slate-300'
                    }
                  >
                    {l.message}
                  </span>
                </div>
              ))}
            </div>

            {/* Modal Bottom Close Button */}
            {!isExecuting && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  Done & Close Wizard
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScraperWizardModal;
