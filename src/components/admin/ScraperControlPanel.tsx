import React from 'react';
import { Play } from 'lucide-react';

interface ScraperControlPanelProps {
  theme?: 'dark' | 'light';
}

export const ScraperControlPanel: React.FC<ScraperControlPanelProps> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';
  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-3xl border transition-all ${isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-md'}`}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Execution Center & Live SSE Stream</h2>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Monitor live job runs, Quartz cron triggers, and server-sent event worker logs.
            </p>
          </div>
          <button className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-rose-500/20 hover:scale-[1.02] transition-all flex items-center gap-2">
            <Play className="w-4 h-4 fill-white" /> Run Instant Extraction Job
          </button>
        </div>

        <div className={`p-5 rounded-2xl border font-mono text-xs space-y-2 ${isDark ? 'bg-slate-950 border-slate-800 text-cyan-400' : 'bg-slate-900 border-slate-800 text-cyan-300'}`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 text-slate-400">
            <span>[Worker #1] Server-Sent Events Log Stream</span>
            <span className="text-emerald-400">● LIVE CONNECTED</span>
          </div>
          <div>[19:30:15] [INFO] Quartz Scheduler initialized.</div>
          <div>[19:30:18] [SUCCESS] GujRERA API returned 4,821 active projects.</div>
          <div>[19:30:22] [INFO] 99acres Price Sync completed for Ahmedabad & Gandhinagar.</div>
        </div>
      </div>
    </div>
  );
};

export default ScraperControlPanel;
