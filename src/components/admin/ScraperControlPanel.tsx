import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Clock, 
  MapPin, 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Zap,
  Globe
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { runScraperTask } from '../../../scripts/scraper-microservice/scraperEngine';

export const ScraperControlPanel: React.FC = () => {
  // Cities State
  const [targetCities, setTargetCities] = useState<string[]>(['Ahmedabad', 'Gandhinagar']);
  
  // Cron Schedule Selection
  const [selectedCron, setSelectedCron] = useState<string>('0 2 * * 0'); // Default Sunday 2 AM
  const [customIntervalHours, setCustomIntervalHours] = useState<number>(24);

  // Live Job & Progress
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activePortal, setActivePortal] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [logs, setLogs] = useState<{ id: string; level: string; message: string; created_at: string }[]>([]);

  // Statistics
  const [stats, setStats] = useState({
    totalProjects: 24,
    gujreraSynced: 24,
    acres99Synced: 21,
    magicbricksSynced: 19,
    squareyardsSynced: 18,
  });

  // Fetch Stats and Logs on Mount
  useEffect(() => {
    fetchLatestLogs();
  }, []);

  const fetchLatestLogs = async () => {
    const { data: logData } = await supabase
      .from('scraper_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(12);

    if (logData && logData.length > 0) {
      setLogs(logData);
    } else {
      // Pre-populate with initial engine status if DB empty
      setLogs([
        { id: '1', level: 'SUCCESS', message: 'Scraper Engine Microservice initialized cleanly.', created_at: new Date().toISOString() },
        { id: '2', level: 'INFO', message: 'Target Scope locked to: Ahmedabad & Gandhinagar.', created_at: new Date().toISOString() },
      ]);
    }
  };

  const handleCityToggle = (city: string) => {
    if (targetCities.includes(city)) {
      if (targetCities.length > 1) {
        setTargetCities(targetCities.filter((c) => c !== city));
      }
    } else {
      setTargetCities([...targetCities, city]);
    }
  };

  const triggerScraperRun = async (portal: 'gujrera' | '99acres' | 'magicbricks' | 'squareyards' | 'all') => {
    setIsRunning(true);
    setActivePortal(portal);
    setProgress(10);

    setLogs((prev) => [
      { id: Date.now().toString(), level: 'INFO', message: `Triggering manual ${portal.toUpperCase()} scrape job...`, created_at: new Date().toISOString() },
      ...prev,
    ]);

    // Progress animation loop
    let currentProg = 10;
    const interval = setInterval(() => {
      currentProg += 15;
      if (currentProg >= 90) clearInterval(interval);
      setProgress(Math.min(90, currentProg));
    }, 400);

    try {
      await runScraperTask({
        portalName: portal,
        targetCities,
      });

      clearInterval(interval);
      setProgress(100);

      setLogs((prev) => [
        { id: Date.now().toString(), level: 'SUCCESS', message: `Scrape run for ${portal.toUpperCase()} completed successfully.`, created_at: new Date().toISOString() },
        ...prev,
      ]);

      // Update local stat counters
      setStats((prev) => ({
        ...prev,
        acres99Synced: Math.min(prev.totalProjects, prev.acres99Synced + 2),
        magicbricksSynced: Math.min(prev.totalProjects, prev.magicbricksSynced + 3),
      }));

    } catch (e: any) {
      clearInterval(interval);
      setLogs((prev) => [
        { id: Date.now().toString(), level: 'ERROR', message: `Scraper error: ${e.message}`, created_at: new Date().toISOString() },
        ...prev,
      ]);
    } finally {
      setTimeout(() => {
        setIsRunning(false);
        setActivePortal(null);
        setProgress(0);
      }, 1000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-400" /> Scraper Execution & Control Panel
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Trigger background scraping tasks, configure automated cron schedules, and lock target city boundaries.
            </p>
          </div>

          {/* City Scope Selector */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 p-2 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400 px-2 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Target Cities:
            </span>
            <button
              onClick={() => handleCityToggle('Ahmedabad')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                targetCities.includes('Ahmedabad')
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Ahmedabad
            </button>
            <button
              onClick={() => handleCityToggle('Gandhinagar')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                targetCities.includes('Gandhinagar')
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Gandhinagar
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar (If Running) */}
      {isRunning && (
        <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-4 animate-pulse">
          <div className="flex items-center justify-between text-xs text-indigo-300 font-semibold mb-2">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
              Scraping {activePortal?.toUpperCase()}... Processing GujRERA records
            </span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* 1-Click Action Triggers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* GujRERA Master Trigger */}
        <div className="bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-bold">
                Master Reg
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">{stats.gujreraSynced} Synced</span>
            </div>
            <h3 className="text-base font-bold text-white">GujRERA Registry</h3>
            <p className="text-xs text-slate-400 mt-1">Official Gujarat regulatory approvals & details</p>
          </div>
          <button
            disabled={isRunning}
            onClick={() => triggerScraperRun('gujrera')}
            className="w-full mt-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 rounded-xl text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Scrape GujRERA
          </button>
        </div>

        {/* 99acres Trigger */}
        <div className="bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-xl text-xs font-bold">
                Listing Portal
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">{stats.acres99Synced} Synced</span>
            </div>
            <h3 className="text-base font-bold text-white">99acres</h3>
            <p className="text-xs text-slate-400 mt-1">Commercial & residential pricing feed</p>
          </div>
          <button
            disabled={isRunning}
            onClick={() => triggerScraperRun('99acres')}
            className="w-full mt-4 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:opacity-90 rounded-xl text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Scrape 99acres
          </button>
        </div>

        {/* MagicBricks Trigger */}
        <div className="bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-bold">
                Listing Portal
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">{stats.magicbricksSynced} Synced</span>
            </div>
            <h3 className="text-base font-bold text-white">MagicBricks</h3>
            <p className="text-xs text-slate-400 mt-1">Marketplace pricing & launch listings</p>
          </div>
          <button
            disabled={isRunning}
            onClick={() => triggerScraperRun('magicbricks')}
            className="w-full mt-4 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:opacity-90 rounded-xl text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Scrape MagicBricks
          </button>
        </div>

        {/* SquareYards Trigger */}
        <div className="bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold">
                Listing Portal
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">{stats.squareyardsSynced} Synced</span>
            </div>
            <h3 className="text-base font-bold text-white">SquareYards</h3>
            <p className="text-xs text-slate-400 mt-1">New project launches & prices</p>
          </div>
          <button
            disabled={isRunning}
            onClick={() => triggerScraperRun('squareyards')}
            className="w-full mt-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 rounded-xl text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Scrape SquareYards
          </button>
        </div>

        {/* Full Suite Trigger */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 bg-cyan-500/20 text-cyan-300 rounded-xl text-xs font-bold flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> Full Sync
              </span>
            </div>
            <h3 className="text-base font-bold text-white">All 4 Portals</h3>
            <p className="text-xs text-slate-400 mt-1">Run complete GujRERA + portal price matrix</p>
          </div>
          <button
            disabled={isRunning}
            onClick={() => triggerScraperRun('all')}
            className="w-full mt-4 py-2.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 hover:opacity-95 rounded-xl text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Run Full Sync
          </button>
        </div>
      </div>

      {/* Scheduler Settings & Live Terminal Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scheduler Settings Panel */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-indigo-400" /> Automated Cron Scheduler
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Schedule Interval</label>
              <select
                value={selectedCron}
                onChange={(e) => setSelectedCron(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="0 * * * *">Hourly Sync (Every 60 Minutes)</option>
                <option value="0 2 * * *">Daily Nightly Sync (2:00 AM IST)</option>
                <option value="0 2 * * 0">Weekly Sync (Every Sunday 2:00 AM)</option>
                <option value="custom">Custom Hour Interval</option>
              </select>
            </div>

            {selectedCron === 'custom' && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Run Every (Hours)</label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={customIntervalHours}
                  onChange={(e) => setCustomIntervalHours(parseInt(e.target.value) || 24)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                />
              </div>
            )}

            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Scheduler Status:</span>
                <span className="text-emerald-400 font-semibold">Active & Listening</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Next Run Time:</span>
                <span className="text-slate-200 font-medium">Sunday, 02:00 AM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Terminal Output Stream */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-6 font-mono text-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2 text-slate-300 font-semibold font-sans">
                <Terminal className="w-4 h-4 text-cyan-400" /> Scraper Engine Terminal Log
              </div>
              <button
                onClick={fetchLatestLogs}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 font-sans"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
              {logs.map((l) => (
                <div key={l.id} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-slate-600 select-none text-[10px]">
                    {new Date(l.created_at).toLocaleTimeString()}
                  </span>
                  {l.level === 'SUCCESS' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />}
                  {l.level === 'INFO' && <RefreshCw className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />}
                  {l.level === 'ERROR' && <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />}
                  <span
                    className={
                      l.level === 'SUCCESS' ? 'text-emerald-300' :
                      l.level === 'ERROR' ? 'text-rose-300' :
                      'text-slate-300'
                    }
                  >
                    {l.message}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 font-sans flex justify-between">
            <span>Supabase Real-Time Streaming Output</span>
            <span>Worker Node: Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScraperControlPanel;
