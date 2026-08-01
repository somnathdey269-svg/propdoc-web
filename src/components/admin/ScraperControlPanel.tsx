import React, { useState } from 'react';
import { Play, Activity, ShieldCheck, Database, CheckCircle2, RefreshCw } from 'lucide-react';

interface UD_DAPControlPanelProps {
  theme?: 'dark' | 'light';
}

export const ScraperControlPanel: React.FC<UD_DAPControlPanelProps> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const [healthScore] = useState<number>(98.5);

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-3xl border transition-all ${isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-md'}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black tracking-tight">UD-DAP Execution Center & Live Stream</h2>
              <span className="px-2.5 py-0.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold rounded-full uppercase">
                Universal Command Bus Active
              </span>
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Monitor real-time OpenTelemetry trace streams, worker thread pools, and health scorecards.
            </p>
          </div>

          <button className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-rose-500/20 hover:scale-[1.02] transition-all flex items-center gap-2">
            <Play className="w-4 h-4 fill-white" /> Trigger Universal Acquisition Run
          </button>
        </div>

        {/* 7-DIMENSION HEALTH SCORECARD */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Overall Readiness Health</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">{healthScore}%</div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${healthScore}%` }} />
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>SIM Selector Stability</span>
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-cyan-400">100.0%</div>
            <div className="text-[10px] text-slate-500 mt-1">Tier 1 ARIA & Data Attributes active</div>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Data Quality Engine Pass Rate</span>
              <Database className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-indigo-400">99.2%</div>
            <div className="text-[10px] text-slate-500 mt-1">0 PK null errors across last run</div>
          </div>
        </div>

        {/* UNIVERSAL COMMAND BUS STREAM LOG */}
        <div className={`p-5 rounded-2xl border font-mono text-xs space-y-2 ${isDark ? 'bg-slate-950 border-slate-800 text-cyan-400' : 'bg-slate-900 border-slate-800 text-cyan-300'}`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 text-slate-400">
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400 animate-pulse" /> Universal Command Bus Event Stream [Worker #1]
            </span>
            <span className="text-emerald-400 flex items-center gap-1 font-sans text-[11px]">
              <RefreshCw className="w-3 h-3 animate-spin" /> LIVE CONNECTED
            </span>
          </div>
          <div>[19:30:15] [CMD_OPEN_URL] Initializing Playwright stealth browser context.</div>
          <div>[19:30:18] [CMD_EXTRACT_FIELDS] Node 'SEARCH_GRID' executed cleanly. 14 items detected.</div>
          <div>[19:30:22] [CMD_SAVE_RECORD] DQE Quality Check score: 98.5%. Persisted to Extracted Records Vault.</div>
          <div>[19:30:25] [CMD_CHECKPOINT] Checkpoint snapshot saved to acquisition_run_checkpoints.</div>
        </div>
      </div>
    </div>
  );
};

export default ScraperControlPanel;
