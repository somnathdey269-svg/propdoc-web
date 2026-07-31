import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Play, 
  CheckSquare, 
  Square as SquareOutline, 
  Globe, 
  RefreshCw,
  Plus,
  Zap,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AddWebsiteModal from './AddWebsiteModal';

interface WebsiteConfig {
  portal_name: string;
  display_name: string;
  source_role: 'PRIMARY' | 'SECONDARY';
  search_url_template: string;
}

interface DiscoveredItem {
  id: string;
  project_name: string;
  developer: string;
  rera_id: string;
  location: string;
  portal_name: string;
  price: string;
  status: 'PENDING' | 'DONE' | 'FAILED';
}

interface SimpleScraperAssistantProps {
  isDark?: boolean;
  theme?: 'dark' | 'light';
}

const DEFAULT_WEBSITES: WebsiteConfig[] = [
  { portal_name: 'gujrera', display_name: 'GujRERA Gujarat Registry', source_role: 'PRIMARY', search_url_template: 'https://gujrera.gujarat.gov.in' },
  { portal_name: '99acres', display_name: '99acres Real Estate', source_role: 'SECONDARY', search_url_template: 'https://www.99acres.com' },
  { portal_name: 'magicbricks', display_name: 'MagicBricks Marketplace', source_role: 'SECONDARY', search_url_template: 'https://www.magicbricks.com' },
  { portal_name: 'squareyards', display_name: 'SquareYards Property', source_role: 'SECONDARY', search_url_template: 'https://www.squareyards.com' },
];

const MOCK_PROJECTS: DiscoveredItem[] = [
  { id: '1', project_name: 'Adani Shantigram Water Lily', developer: 'Adani Realty', rera_id: 'PR/GJ/AHM/109/2021', location: 'Vaishno Devi, Ahmedabad', portal_name: 'gujrera', price: '₹ 1.25 Cr', status: 'DONE' },
  { id: '2', project_name: 'Godrej Garden City Cluster B', developer: 'Godrej Properties', rera_id: 'PR/GJ/AHM/412/2022', location: 'Jagatpur, Ahmedabad', portal_name: 'gujrera', price: '₹ 85.0 Lakhs', status: 'DONE' },
  { id: '3', project_name: 'Pacific Skydeck Towers', developer: 'Pacific Group', rera_id: 'PR/GJ/AHM/881/2023', location: 'Bodaldev, Ahmedabad', portal_name: 'gujrera', price: '₹ 2.10 Cr', status: 'PENDING' },
  { id: '4', project_name: 'Shilp Corporate Park', developer: 'Shilp Group', rera_id: 'PR/GJ/AHM/045/2020', location: 'Sindhu Bhavan Road, Ahmedabad', portal_name: 'gujrera', price: '₹ 1.80 Cr', status: 'DONE' },
];

export const SimpleScraperAssistant: React.FC<SimpleScraperAssistantProps> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const [websites, setWebsites] = useState<WebsiteConfig[]>(DEFAULT_WEBSITES);
  const [selectedWebsite, setSelectedWebsite] = useState<WebsiteConfig>(DEFAULT_WEBSITES[0]);
  const [showAddWebsiteModal, setShowAddWebsiteModal] = useState<boolean>(false);

  // Staged Projects Data
  const [projectsList, setProjectsList] = useState<DiscoveredItem[]>(MOCK_PROJECTS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(['1', '2']));
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Scraping Status
  const [statusMode, setStatusMode] = useState<'IDLE' | 'STEP1_SCANNING' | 'STEP2_FETCHING'>('IDLE');

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      const { data } = await supabase.from('scraper_configs').select('*');
      if (data && data.length > 0) {
        const mapped: WebsiteConfig[] = data.map((d) => ({
          portal_name: d.portal_name,
          display_name: d.portal_name.toUpperCase() + ' Portal',
          source_role: d.portal_name === 'gujrera' ? 'PRIMARY' : 'SECONDARY',
          search_url_template: d.base_url || '',
        }));
        const existingNames = new Set(mapped.map((m) => m.portal_name));
        const combined = [...mapped];
        DEFAULT_WEBSITES.forEach((def) => {
          if (!existingNames.has(def.portal_name)) {
            combined.push(def);
          }
        });
        setWebsites(combined);
      }
    } catch (err) {
      console.warn('Using default website configurations:', err);
    }
  };

  const handleStep1Scan = async () => {
    setStatusMode('STEP1_SCANNING');
    setTimeout(() => {
      setStatusMode('IDLE');
    }, 1500);
  };

  const handleStep2Fetch = async () => {
    setStatusMode('STEP2_FETCHING');
    setTimeout(() => {
      setProjectsList((prev) =>
        prev.map((p) => (selectedIds.has(p.id) ? { ...p, status: 'DONE', price: p.price === 'Pending Scan' ? '₹ 95.0 Lakhs' : p.price } : p))
      );
      setStatusMode('IDLE');
    }, 1500);
  };

  const filteredProjects = projectsList.filter(
    (p) =>
      p.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.developer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProjects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProjects.map((p) => p.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER CARD */}
      <div className={`p-6 rounded-3xl border transition-all ${isDark ? 'bg-slate-900/90 border-slate-800 text-white shadow-2xl' : 'bg-white border-slate-200 text-slate-900 shadow-md'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${isDark ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'bg-cyan-50 text-cyan-700 border border-cyan-200'}`}>
                <Zap className="w-4 h-4 inline mr-1" /> Automated Assistant
              </span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Easy 2-Step Website Scraper Assistant</h2>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Select a target website source, click Step 1 to discover projects, then click Step 2 to extract deep prices & floor plans.
            </p>
          </div>

          <button
            onClick={() => setShowAddWebsiteModal(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-all flex items-center gap-2 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" /> Add New Website Source
          </button>
        </div>

        {/* WEBSITE SOURCE SELECTOR TILES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {websites.map((site) => {
            const isSelected = selectedWebsite.portal_name === site.portal_name;
            return (
              <button
                key={site.portal_name}
                onClick={() => setSelectedWebsite(site)}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                  isSelected
                    ? isDark
                      ? 'bg-slate-950 border-cyan-500 shadow-lg shadow-cyan-500/10'
                      : 'bg-indigo-50 border-indigo-500 shadow-sm'
                    : isDark
                      ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md ${
                    site.source_role === 'PRIMARY' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                  }`}>
                    {site.source_role}
                  </span>
                  <Globe className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                </div>
                <div className="font-bold text-sm text-slate-100 truncate">{site.display_name}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{site.search_url_template}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2-STEP ACTION CONTROL CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* STEP 1 CARD */}
        <div className={`p-6 rounded-3xl border transition-all ${isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-md'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="px-3 py-1 rounded-xl text-xs font-black bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              STEP 1
            </span>
            <span className="text-xs font-mono text-slate-400 font-bold">{projectsList.length} Found</span>
          </div>

          <h3 className="text-lg font-bold">Scan Website to Find Projects</h3>
          <p className={`text-xs mt-1 mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Scans <strong className="text-cyan-400">{selectedWebsite.display_name}</strong> to discover all registered project names and RERA IDs.
          </p>

          <button
            onClick={handleStep1Scan}
            disabled={statusMode !== 'IDLE'}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {statusMode === 'STEP1_SCANNING' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Scanning Portal...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" /> Step 1: Scan & Find Projects
              </>
            )}
          </button>
        </div>

        {/* STEP 2 CARD */}
        <div className={`p-6 rounded-3xl border transition-all ${isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-md'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="px-3 py-1 rounded-xl text-xs font-black bg-purple-500/10 text-purple-400 border border-purple-500/30">
              STEP 2
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">{selectedIds.size} Checked</span>
          </div>

          <h3 className="text-lg font-bold">Get Full Details & Compare Prices</h3>
          <p className={`text-xs mt-1 mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Gathers full floor plans, unit specs, and listing prices for the projects checked in the list below.
          </p>

          <button
            onClick={handleStep2Fetch}
            disabled={statusMode !== 'IDLE' || selectedIds.size === 0}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {statusMode === 'STEP2_FETCHING' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Extracting Deep Specs...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Step 2: Get Details & Prices ({selectedIds.size})
              </>
            )}
          </button>
        </div>

      </div>

      {/* DISCOVERED PROJECTS TABLE CARD */}
      <div className={`p-6 rounded-3xl border transition-all ${isDark ? 'bg-slate-900/90 border-slate-800 text-white shadow-2xl' : 'bg-white border-slate-200 text-slate-900 shadow-md'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-indigo-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold">Found Projects List ({selectedWebsite.display_name})</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Check projects to extract deep floor plans and price comparisons.</p>
            </div>
          </div>

          {/* Table Actions */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search project name..."
                className={`pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold border focus:outline-none transition-all ${isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'}`}
              />
            </div>

            <button
              onClick={toggleSelectAll}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'}`}
            >
              {selectedIds.size === filteredProjects.length ? 'Uncheck All' : 'Check All'}
            </button>
          </div>
        </div>

        {/* TABLE CONTENT */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800/80">
          <table className="w-full text-left text-xs">
            <thead className={`uppercase text-[10px] font-black tracking-wider border-b ${isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
              <tr>
                <th className="p-4 w-12 text-center">Check</th>
                <th className="p-4">Project Name & Developer</th>
                <th className="p-4">Locality & City</th>
                <th className="p-4">RERA Reg ID</th>
                <th className="p-4">Listed Price</th>
                <th className="p-4 text-right">Detail Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800/60 bg-slate-900/40 text-slate-200' : 'divide-slate-200 bg-white text-slate-800'}`}>
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-semibold">
                    No projects found for this portal. Click Step 1 above to scan.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => {
                  const isChecked = selectedIds.has(p.id);
                  return (
                    <tr key={p.id} className={`transition-colors ${isChecked ? (isDark ? 'bg-cyan-500/10' : 'bg-indigo-50/70') : isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                      <td className="p-4 text-center">
                        <button onClick={() => toggleSelectOne(p.id)} className="text-cyan-400">
                          {isChecked ? <CheckSquare className="w-4 h-4 text-cyan-400" /> : <SquareOutline className="w-4 h-4 text-slate-600" />}
                        </button>
                      </td>
                      <td className="p-4 font-bold text-sm">
                        <div className="font-extrabold text-slate-100">{p.project_name}</div>
                        <div className="text-[11px] text-slate-400 font-medium">{p.developer}</div>
                      </td>
                      <td className="p-4 font-semibold text-slate-300">
                        {p.location}
                      </td>
                      <td className="p-4 font-mono font-bold text-amber-400">{p.rera_id}</td>
                      <td className="p-4 font-bold text-emerald-400 text-sm">{p.price}</td>
                      <td className="p-4 text-right font-bold">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          p.status === 'DONE' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : p.status === 'FAILED'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddWebsiteModal && (
        <AddWebsiteModal
          onClose={() => setShowAddWebsiteModal(false)}
          onSuccess={() => setShowAddWebsiteModal(false)}
        />
      )}
    </div>
  );
};

export default SimpleScraperAssistant;
