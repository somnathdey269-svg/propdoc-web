import React from 'react';

interface PortalPriceMatrixProps {
  theme?: 'dark' | 'light';
}

export const PortalPriceMatrix: React.FC<PortalPriceMatrixProps> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';
  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-3xl border transition-all ${isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-md'}`}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight">4-Portal Price Sync & Discrepancy Matrix</h2>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Compare prices across GujRERA, 99acres, MagicBricks, SquareYards, and BaankNet.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800/80">
          <table className="w-full text-left text-xs">
            <thead className={`uppercase text-[10px] font-black tracking-wider border-b ${isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
              <tr>
                <th className="p-4">Project Name</th>
                <th className="p-4">GujRERA Reg</th>
                <th className="p-4">99acres Price</th>
                <th className="p-4">MagicBricks</th>
                <th className="p-4">SquareYards</th>
                <th className="p-4 text-right">Variance</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800/60 bg-slate-900/40 text-slate-200' : 'divide-slate-200 bg-white text-slate-800'}`}>
              <tr className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                <td className="p-4 font-bold text-slate-100">Adani Shantigram Water Lily</td>
                <td className="p-4 font-mono text-amber-400">PR/GJ/AHM/109/2021</td>
                <td className="p-4 font-bold text-emerald-400">₹ 1.25 Cr</td>
                <td className="p-4 font-bold text-emerald-400">₹ 1.28 Cr</td>
                <td className="p-4 font-bold text-emerald-400">₹ 1.24 Cr</td>
                <td className="p-4 text-right font-bold text-cyan-400">± 1.5% Sync</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PortalPriceMatrix;
