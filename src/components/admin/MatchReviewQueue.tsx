import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface MatchReviewQueueProps {
  theme?: 'dark' | 'light';
}

export const MatchReviewQueue: React.FC<MatchReviewQueueProps> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';
  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-3xl border transition-all ${isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-md'}`}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight">AI Property Deduplication Queue</h2>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Review high-confidence fuzzy name & locality matches across multi-portal listings.
            </p>
          </div>
          <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-400 font-bold text-xs border border-amber-500/40">
            3 Matches Pending Review
          </span>
        </div>

        <div className="space-y-4">
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-cyan-400">GujRERA vs 99acres (96% Confidence Match)</span>
              <span className="text-[10px] text-slate-500 font-mono">ID: MAT-88412</span>
            </div>
            <h4 className="font-extrabold text-base mb-1">Godrej Garden City — Cluster B</h4>
            <p className="text-xs text-slate-400 mb-4">Jagatpur, SG Highway, Ahmedabad</p>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30 hover:bg-emerald-500/30">
                <CheckCircle className="w-4 h-4 inline mr-1" /> Approve Linkage
              </button>
              <button className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-400 font-bold text-xs border border-rose-500/30 hover:bg-rose-500/30">
                <XCircle className="w-4 h-4 inline mr-1" /> Reject Match
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchReviewQueue;
