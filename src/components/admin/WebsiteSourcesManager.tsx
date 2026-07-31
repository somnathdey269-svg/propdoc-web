import React, { useState } from 'react';
import { Plus, Edit3, CheckCircle2 } from 'lucide-react';

interface WebsiteSourcesManagerProps {
  theme?: 'dark' | 'light';
}

export const WebsiteSourcesManager: React.FC<WebsiteSourcesManagerProps> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const [sources] = useState([
    { id: '1', name: 'GujRERA Gujarat Registry', portal: 'gujrera', role: 'PRIMARY', url: 'https://gujrera.gujarat.gov.in', status: 'ACTIVE' },
    { id: '2', name: '99acres Real Estate', portal: '99acres', role: 'SECONDARY', url: 'https://www.99acres.com', status: 'ACTIVE' },
    { id: '3', name: 'MagicBricks Marketplace', portal: 'magicbricks', role: 'SECONDARY', url: 'https://www.magicbricks.com', status: 'ACTIVE' },
    { id: '4', name: 'SquareYards Property', portal: 'squareyards', role: 'SECONDARY', url: 'https://www.squareyards.com', status: 'ACTIVE' },
  ]);

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-3xl border transition-all ${isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-md'}`}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Manage Target Website Sources</h2>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Configure primary government registry sources and secondary marketplace portals.
            </p>
          </div>
          <button className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Source Portal
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sources.map((src) => (
            <div key={src.id} className={`p-5 rounded-2xl border transition-all ${isDark ? 'bg-slate-950/60 border-slate-800/80 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg ${src.role === 'PRIMARY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-purple-500/20 text-purple-400 border border-purple-500/40'}`}>
                  {src.role} SOURCE
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {src.status}
                </span>
              </div>
              <h3 className="font-extrabold text-base mb-1">{src.name}</h3>
              <p className="font-mono text-xs text-slate-400 truncate mb-4">{src.url}</p>
              <div className="flex items-center justify-end gap-2 border-t pt-3 border-slate-800/60">
                <button className="px-3 py-1.5 rounded-xl border text-xs font-bold transition-all border-slate-700 hover:bg-slate-800 text-slate-300">
                  <Edit3 className="w-3.5 h-3.5 inline mr-1" /> Edit Selectors
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WebsiteSourcesManager;
