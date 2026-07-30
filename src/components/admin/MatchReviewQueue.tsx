import React, { useState } from 'react';
import { GitMerge, Check, X, ShieldCheck, Building2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PendingMatch {
  id: string;
  project_name: string;
  developer: string;
  locality: string;
  portal_name: string;
  candidate_name: string;
  candidate_price_inr: number;
  confidence_score: number;
}

const MOCK_PENDING_MATCHES: PendingMatch[] = [
  {
    id: 'm-1',
    project_name: 'Verona Elegance',
    developer: 'Verona Group',
    locality: 'Gota, Ahmedabad',
    portal_name: '99acres',
    candidate_name: 'Verona Elegance Homes Gota',
    candidate_price_inr: 7800000,
    confidence_score: 82.5,
  },
  {
    id: 'm-2',
    project_name: 'GIFT One Towers',
    developer: 'IL&FS Township',
    locality: 'GIFT City, Gandhinagar',
    portal_name: 'magicbricks',
    candidate_name: 'Gift 1 Commercial Tower Gandhinagar',
    candidate_price_inr: 12500000,
    confidence_score: 76.0,
  },
  {
    id: 'm-3',
    project_name: 'Shilp Stellar',
    developer: 'Shilp Group',
    locality: 'Bodakdev, Ahmedabad',
    portal_name: 'squareyards',
    candidate_name: 'Shilp Stellar Bodakdev Luxury 4BHK',
    candidate_price_inr: 21000000,
    confidence_score: 79.2,
  },
];

export const MatchReviewQueue: React.FC = () => {
  const [queue, setQueue] = useState<PendingMatch[]>(MOCK_PENDING_MATCHES);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleApprove = async (match: PendingMatch) => {
    setQueue((prev) => prev.filter((item) => item.id !== match.id));
    setActionSuccess(`Approved match for "${match.project_name}" on ${match.portal_name.toUpperCase()}!`);

    try {
      await supabase
        .from('match_review_queue')
        .update({ status: 'APPROVED' })
        .eq('id', match.id);
    } catch (e) {
      // Handled locally
    }

    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleReject = async (match: PendingMatch) => {
    setQueue((prev) => prev.filter((item) => item.id !== match.id));
    setActionSuccess(`Rejected match candidate for "${match.project_name}".`);

    try {
      await supabase
        .from('match_review_queue')
        .update({ status: 'REJECTED' })
        .eq('id', match.id);
    } catch (e) {
      // Handled locally
    }

    setTimeout(() => setActionSuccess(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <GitMerge className="w-5 h-5 text-indigo-400" /> Pending Match Review Queue
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Human-In-The-Loop Approval: Candidate listings matched via fuzzy logic (60% - 84% confidence) awaiting your 1-click verification.
            </p>
          </div>

          <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-semibold self-start md:self-auto">
            {queue.length} Matches Pending
          </span>
        </div>

        {actionSuccess && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" /> {actionSuccess}
          </div>
        )}
      </div>

      {/* Queue List */}
      {queue.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-80" />
          <h3 className="text-base font-bold text-white">Queue Empty!</h3>
          <p className="text-xs text-slate-400 mt-1">All fuzzy portal candidate matches have been reviewed & verified.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 backdrop-blur-xl transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              {/* GujRERA Project Details */}
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-md text-[10px] font-bold">
                    GujRERA Registered
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{item.locality}</span>
                </div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-400" /> {item.project_name}
                </h3>
                <p className="text-xs text-slate-400">Developer: {item.developer}</p>
              </div>

              {/* Match Candidate Details */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex-1 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold uppercase tracking-wider text-indigo-400">{item.portal_name} Listing</span>
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md font-bold">
                    {item.confidence_score}% Match
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-200">{item.candidate_name}</p>
                <p className="text-sm font-bold text-emerald-400">
                  ₹ {(item.candidate_price_inr / 100000).toFixed(2)} Lacs
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 self-end lg:self-center">
                <button
                  onClick={() => handleReject(item)}
                  className="px-4 py-2.5 bg-slate-950 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-300 flex items-center gap-1.5 transition-all"
                >
                  <X className="w-4 h-4" /> Reject
                </button>
                <button
                  onClick={() => handleApprove(item)}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <Check className="w-4 h-4" /> Approve & Link
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchReviewQueue;
