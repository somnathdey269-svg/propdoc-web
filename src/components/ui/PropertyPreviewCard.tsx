import React from 'react';
import { ExternalLink, X, Tag } from 'lucide-react';
import type { PropertyProject } from '../../types';

interface PropertyPreviewCardProps {
  project: PropertyProject;
  onClose: () => void;
  onOpenDetails: (project: PropertyProject) => void;
}

export const PropertyPreviewCard: React.FC<PropertyPreviewCardProps> = ({
  project,
  onClose,
  onOpenDetails,
}) => {
  const lowestSource = project.multiSourcePricing.lowestPriceSource;
  const lowestPriceCr = (project.multiSourcePricing.lowestPriceInr / 10000000).toFixed(2);

  const getValuationBadge = () => {
    if (project.isBankAuction || project.valuationTier === 'bank-auction') {
      return { label: 'Bank Auction Deal', color: 'bg-amber-400 text-slate-950 font-extrabold' };
    }
    if (project.valuationTier === 'below-avg') {
      return { label: 'Below Market Avg (Bargain)', color: 'bg-emerald-400 text-slate-950 font-extrabold' };
    }
    if (project.valuationTier === 'above-avg') {
      return { label: 'Above Market Avg (Luxury)', color: 'bg-purple-500 text-white font-extrabold' };
    }
    return { label: 'Fair Market Value', color: 'bg-cyan-400 text-slate-950 font-extrabold' };
  };

  const badge = getValuationBadge();

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-xl p-3.5 rounded-3xl bg-slate-950/98 backdrop-blur-3xl border border-cyan-500/40 text-slate-100 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
      <div className="relative flex items-center gap-3.5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 p-1.5 rounded-full bg-slate-900 border border-white/20 text-slate-400 hover:text-white transition-all shadow-md z-10"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Cover Photo */}
        <div
          onClick={() => onOpenDetails(project)}
          className="relative w-28 h-24 rounded-2xl overflow-hidden shrink-0 cursor-pointer border border-white/10 group"
        >
          <img src={project.coverImage} alt={project.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[9px] font-bold text-cyan-300">
            {project.category}
          </span>
        </div>

        {/* Details & 5-Portal Cross Pricing */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-full text-[9px] ${badge.color}`}>
              {badge.label}
            </span>
            <span className="text-[10px] text-slate-400 truncate">{project.locality}</span>
          </div>

          <h3
            onClick={() => onOpenDetails(project)}
            className="text-sm font-bold text-white truncate cursor-pointer hover:text-cyan-300 transition-colors font-outfit"
          >
            {project.name}
          </h3>

          <p className="text-[11px] text-slate-300 font-mono flex items-center gap-2">
            <span>Start: <strong className="text-emerald-400 font-bold">₹{lowestPriceCr} Cr</strong></span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">₹{project.pricePerSqFt}/sq.ft</span>
          </p>

          {/* 5-Portal Cross Listing Sources Pills */}
          <div className="flex flex-wrap items-center gap-1 pt-0.5">
            <span className="text-[9px] font-bold text-slate-400 flex items-center gap-0.5">
              <Tag className="w-2.5 h-2.5 text-cyan-400" /> 5 Portals:
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${lowestSource === 'SquareYards' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-white/5 text-slate-400'}`}>
              SquareYards
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/5 text-slate-400">
              GujRERA
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/5 text-slate-400">
              99acres
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/5 text-slate-400">
              MagicBricks
            </span>
            {project.isBankAuction && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-400 text-slate-950">
                BaankNet Auction
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onOpenDetails(project)}
          className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-extrabold text-xs shadow-lg flex items-center gap-1 shrink-0 transition-all hover:scale-105"
        >
          <span>Showcase</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
