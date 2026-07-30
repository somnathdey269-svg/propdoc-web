import React, { useState } from 'react';
import type { Lead, PropertyProject, UnitStatus } from '../../types';
import { 
  Layers, Users, MessageSquare, X, ExternalLink, Zap
} from 'lucide-react';

interface BuilderDashboardModalProps {
  leads: Lead[];
  projects: PropertyProject[];
  onClose: () => void;
  onUpdateUnitStatus: (projectId: string, unitId: string, status: UnitStatus) => void;
}

export const BuilderDashboardModal: React.FC<BuilderDashboardModalProps> = ({
  leads,
  projects,
  onClose,
  onUpdateUnitStatus
}) => {
  const [activeTab, setActiveTab] = useState<'leads' | 'inventory' | 'microsite'>('leads');
  const selectedProject = projects[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-6 bg-slate-950/85 backdrop-blur-2xl overflow-y-auto">
      <div className="relative w-full max-w-6xl rounded-3xl bg-slate-900 border border-white/15 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white font-outfit">Builder Command Center & CRM</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  Goyal & Co. (Verified)
                </span>
              </div>
              <p className="text-xs text-slate-400">Manage high-intent buyer leads & live 3D inventory stack</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-white/10 bg-slate-950/70 overflow-x-auto">
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'leads'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>High-Intent Leads ({leads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'inventory'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>3D Unit Stack Inventory</span>
          </button>

          <button
            onClick={() => setActiveTab('microsite')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'microsite'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            <span>Microsite Analytics</span>
          </button>
        </div>

        {/* Scrollable Main Panel */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: Leads Feed */}
          {activeTab === 'leads' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-xs text-slate-400">Total Leads Received</span>
                  <span className="text-2xl font-extrabold text-white block mt-1">42</span>
                  <span className="text-[10px] text-emerald-400 mt-1 block">↑ +18% this week</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-xs text-slate-400">Avg AI Intent Score</span>
                  <span className="text-2xl font-extrabold text-cyan-400 block mt-1">89%</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">High 3D Engagement</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-xs text-slate-400">Site Visits Scheduled</span>
                  <span className="text-2xl font-extrabold text-emerald-400 block mt-1">12</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Conversion Rate 28.5%</span>
                </div>
              </div>

              {/* Leads Table */}
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/60">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-slate-400 uppercase text-[10px]">
                      <th className="p-3">Customer Name</th>
                      <th className="p-3">Project Interested</th>
                      <th className="p-3">AI Intent Score</th>
                      <th className="p-3">Contact Info</th>
                      <th className="p-3">Behavior Summary</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 font-bold text-white">{lead.customerName}</td>
                        <td className="p-3">{lead.projectName}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                            {lead.intentScore}%
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px]">
                          <div>{lead.customerPhone}</div>
                          <div className="text-slate-500">{lead.customerEmail}</div>
                        </td>
                        <td className="p-3 text-[11px] max-w-xs truncate text-slate-400">
                          {lead.behaviorSummary}
                        </td>
                        <td className="p-3">
                          <a
                            href={`https://wa.me/${lead.customerPhone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold border border-emerald-500/30 text-[10px] inline-flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Live 3D Inventory Manager */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Live Unit Status Matrix for {selectedProject.name}
                </h3>
                <span className="text-xs text-slate-400">Changes reflect live on public 3D map</span>
              </div>

              {selectedProject.unitsStack && selectedProject.unitsStack.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedProject.unitsStack.map((unit) => (
                    <div key={unit.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">
                          Floor {unit.floorNumber} • Unit #{unit.unitNumber}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {unit.bhk} ({unit.carpetAreaSqFt} sq.ft) — ₹{(unit.priceInr / 10000000).toFixed(2)} Cr
                        </span>
                      </div>

                      {/* Status Toggle Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onUpdateUnitStatus(selectedProject.id, unit.id, 'AVAILABLE')}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${
                            unit.status === 'AVAILABLE'
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                              : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                          }`}
                        >
                          AVAILABLE
                        </button>
                        <button
                          onClick={() => onUpdateUnitStatus(selectedProject.id, unit.id, 'HOLD')}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${
                            unit.status === 'HOLD'
                              ? 'bg-amber-500 text-slate-950 border-amber-400'
                              : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                          }`}
                        >
                          HOLD
                        </button>
                        <button
                          onClick={() => onUpdateUnitStatus(selectedProject.id, unit.id, 'SOLD')}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${
                            unit.status === 'SOLD'
                              ? 'bg-rose-500 text-slate-950 border-rose-400'
                              : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                          }`}
                        >
                          SOLD
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 bg-white/5 rounded-2xl">
                  No inventory units uploaded for this project yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Microsite Analytics */}
          {activeTab === 'microsite' && (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 text-center">
              <Zap className="w-8 h-8 text-cyan-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Official Microsite: {selectedProject.builder.micrositeSubdomain || 'titanium-world'}.urbanx.in</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Your project automatically receives an ultra-fast 3D landing page generated directly from RERA data with zero hosting fee.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
