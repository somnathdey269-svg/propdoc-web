import React from 'react';

interface AdaptivePipelineManagerProps {
  theme?: 'dark' | 'light';
}

export const AdaptivePipelineManager: React.FC<AdaptivePipelineManagerProps> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';
  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-3xl border transition-all ${isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-md'}`}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Adaptive Pipelines & Auto-Healing Fallbacks</h2>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Resilient multi-layer DOM selector fallbacks and automatic anti-bot healing engine.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <h4 className="font-extrabold text-base mb-1 text-cyan-400">GujRERA Dynamic Selector Hierarchy</h4>
            <p className="text-xs text-slate-400 mb-3">Primary: JSON-LD Structured Data Schema | Secondary: XPath DOM Fallback</p>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase border border-emerald-500/30">
              100% Resilience Score
            </span>
          </div>

          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <h4 className="font-extrabold text-base mb-1 text-purple-400">99acres Anti-Bot Headless Bypass</h4>
            <p className="text-xs text-slate-400 mb-3">Stealth Plugin + Rotating Residential Proxies</p>
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 font-bold text-[10px] uppercase border border-purple-500/30">
              Bypass Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdaptivePipelineManager;
