import React, { useState } from 'react';
import type { PropertyProject, Lead } from '../types';
import { INITIAL_PROJECTS, INITIAL_LEADS } from '../data/ahmedabadData';
import { 
  Building2, ShieldCheck, Layers, Users, 
  ArrowLeft, CheckCircle2, MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BuilderPortalProps {
  onNavigateToUser: () => void;
}

export const BuilderPortal: React.FC<BuilderPortalProps> = ({ onNavigateToUser }) => {
  const [activeTab, setActiveTab] = useState<'claim' | 'inventory' | 'leads'>('claim');
  const [projects, setProjects] = useState<PropertyProject[]>(INITIAL_PROJECTS);
  const [leads] = useState<Lead[]>(INITIAL_LEADS);

  // Claim Form State
  const [projectName, setProjectName] = useState('');
  const [reraNumber, setReraNumber] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [claimedSubdomain, setClaimedSubdomain] = useState<string | null>(null);

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName || !reraNumber) return;

    const subdomain = projectName.toLowerCase().replace(/\s+/g, '-') + '.urbanx.in';
    setClaimedSubdomain(subdomain);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.5 }
    });
  };

  const toggleUnitStatus = (projId: string, unitId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projId) return p;
      return {
        ...p,
        unitsStack: p.unitsStack.map(u => {
          if (u.id !== unitId) return u;
          const nextStatus = u.status === 'AVAILABLE' ? 'HOLD' : u.status === 'HOLD' ? 'SOLD' : 'AVAILABLE';
          return { ...u, status: nextStatus };
        })
      };
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      {/* Top Builder Portal Header Bar */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToUser}
            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center gap-2 text-xs font-semibold transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" /> Back to Buyer Discovery Map (URL: /)
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Building2 className="w-4 h-4" />
            <span>BUILDER & DEVELOPER PORTAL (URL: /builder)</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-white/15 text-xs">
          <button
            onClick={() => setActiveTab('claim')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'claim' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Claim RERA Project
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'inventory' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" /> Inventory Stack Matrix
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'leads' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> Buyer Lead CRM
          </button>
        </div>
      </header>

      {/* Main Workspace Content */}
      <main className="max-w-7xl mx-auto pt-8">
        {/* TAB 1: CLAIM RERA PROJECT */}
        {activeTab === 'claim' && (
          <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-slate-900 border border-white/15 shadow-2xl space-y-6">
            {!claimedSubdomain ? (
              <form onSubmit={handleClaimSubmit} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <ShieldCheck className="w-8 h-8 text-amber-400" />
                  <div>
                    <h2 className="text-lg font-bold text-white">Statutory GujRERA Project Claiming</h2>
                    <p className="text-xs text-slate-400">Verify your official builder ownership to unlock your custom 3D microsite domain</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Ahmedabad Project Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Titanium World Tower or Goyal Riviera"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/15 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">GujRERA Registration Number</label>
                  <input
                    type="text"
                    required
                    placeholder="PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/RAA08921/180821"
                    value={reraNumber}
                    onChange={(e) => setReraNumber(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/15 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Authorized Contact Person</label>
                    <input
                      type="text"
                      required
                      placeholder="Vikram Goyal"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/15 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Registered Phone (OTP)</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98250 XXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/15 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs shadow-lg hover:scale-105 transition-all"
                >
                  Verify & Claim Project Microsite Domain
                </button>
              </form>
            ) : (
              <div className="text-center space-y-4 py-6">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
                <h3 className="text-xl font-bold text-white">Project Verified & Claimed Successfully!</h3>
                <p className="text-xs text-slate-300">
                  Your custom 3D microsite domain is active at <strong className="text-cyan-400">{claimedSubdomain}</strong>
                </p>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className="px-6 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-lg hover:bg-cyan-400 transition-all"
                >
                  Manage Live Unit Stack Matrix
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INVENTORY STACK MATRIX */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Real-Time Building Unit Stack Matrix</h2>
                <p className="text-xs text-slate-400">Click any unit to toggle availability: AVAILABLE → HOLD → SOLD</p>
              </div>
            </div>

            {projects.slice(0, 3).map((project) => (
              <div key={project.id} className="p-6 rounded-3xl bg-slate-900 border border-white/15 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">{project.name} • {project.locality}</h3>
                  <span className="text-xs font-mono text-cyan-400">RERA: {project.reraNumber}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {project.unitsStack.map((unit) => (
                    <div
                      key={unit.id}
                      onClick={() => toggleUnitStatus(project.id, unit.id)}
                      className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all space-y-1 ${
                        unit.status === 'AVAILABLE'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                          : unit.status === 'HOLD'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-300 opacity-60'
                      }`}
                    >
                      <div className="font-bold flex justify-between">
                        <span>Unit #{unit.unitNumber}</span>
                        <span className="text-[9px] uppercase font-mono">{unit.status}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Floor {unit.floorNumber} • {unit.bhk}</div>
                      <div className="font-mono text-white font-bold">₹{(unit.priceInr / 10000000).toFixed(2)} Cr</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: BUYER LEAD CRM */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">High-Intent Buyer Lead Inquiries</h2>
            <div className="rounded-3xl border border-white/15 overflow-hidden bg-slate-900">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-slate-300">
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Mobile Contact</th>
                    <th className="p-4">Project</th>
                    <th className="p-4">Preferred BHK</th>
                    <th className="p-4">Intent Score</th>
                    <th className="p-4">Direct Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-slate-300">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-white/5">
                      <td className="p-4 font-bold text-white">{lead.customerName}</td>
                      <td className="p-4 font-mono text-cyan-400">{lead.customerPhone}</td>
                      <td className="p-4">{lead.projectName}</td>
                      <td className="p-4">{lead.preferredBhk}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                          {lead.intentScore}% High Intent
                        </span>
                      </td>
                      <td className="p-4">
                        <a
                          href={`https://wa.me/${lead.customerPhone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold inline-flex items-center gap-1 hover:scale-105 transition-all"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Lead
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
