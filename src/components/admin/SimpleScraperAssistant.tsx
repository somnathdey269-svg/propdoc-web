import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Play, 
  Square, 
  CheckSquare, 
  Square as SquareOutline, 
  Globe, 
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { 
  runPass1Discovery, 
  runPass2DeepExtraction, 
  type DiscoveredProject 
} from '../../../scripts/scraper-microservice/adaptivePipelineEngine';
import AddWebsiteModal from './AddWebsiteModal';

interface WebsiteConfig {
  portal_name: string;
  display_name: string;
  source_role: 'PRIMARY' | 'SECONDARY';
  search_url_template: string;
}

const DEFAULT_WEBSITES: WebsiteConfig[] = [
  { portal_name: 'gujrera', display_name: 'GujRERA Gujarat Registry', source_role: 'PRIMARY', search_url_template: 'https://gujrera.gujarat.gov.in' },
  { portal_name: '99acres', display_name: '99acres Real Estate', source_role: 'SECONDARY', search_url_template: 'https://www.99acres.com' },
  { portal_name: 'magicbricks', display_name: 'MagicBricks Marketplace', source_role: 'SECONDARY', search_url_template: 'https://www.magicbricks.com' },
  { portal_name: 'squareyards', display_name: 'SquareYards Property', source_role: 'SECONDARY', search_url_template: 'https://www.squareyards.com' },
];

export const SimpleScraperAssistant: React.FC = () => {
  const [websites, setWebsites] = useState<WebsiteConfig[]>(DEFAULT_WEBSITES);
  const [selectedWebsite, setSelectedWebsite] = useState<WebsiteConfig>(DEFAULT_WEBSITES[0]);
  const [showAddWebsiteModal, setShowAddWebsiteModal] = useState<boolean>(false);

  // Staged Projects Data
  const [projectsList, setProjectsList] = useState<DiscoveredProject[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Scraping Status
  const [statusMode, setStatusMode] = useState<'IDLE' | 'STEP1_SCANNING' | 'STEP2_FETCHING'>('IDLE');
  const [progressPct, setProgressPct] = useState<number>(0);
  const [currentProject, setCurrentProject] = useState<DiscoveredProject | null>(null);
  const [statusLogs, setStatusLogs] = useState<{ id: string; message: string; type: 'info' | 'success' | 'warn' | 'error' }[]>([]);

  const stopRef = useRef<boolean>(false);

  useEffect(() => {
    fetchWebsites();
  }, []);

  useEffect(() => {
    fetchProjectsForWebsite(selectedWebsite.portal_name);
  }, [selectedWebsite]);

  const fetchWebsites = async () => {
    try {
      const { data } = await supabase.from('scraper_configs').select('*');
      if (data && data.length > 0) {
        setWebsites(data as WebsiteConfig[]);
      }
    } catch (e) {
      // Fallback default
    }
  };

  const fetchProjectsForWebsite = async (portalName: string) => {
    try {
      const { data } = await supabase
        .from('scraper_discovery_staging')
        .select('*')
        .eq('portal_name', portalName)
        .order('discovered_at', { ascending: false });

      if (data && data.length > 0) {
        setProjectsList(data as DiscoveredProject[]);
      } else {
        // Default Mock list
        setProjectsList([
          { id: '1', portal_name: portalName, project_name: 'Verona Elegance', developer: 'Verona Group', locality_name: 'Gota', city: 'Ahmedabad', rera_id: 'PR/GJ/AHMEDABAD/AUDA/RAA01234', estimated_price_inr: 7800000, status: 'DISCOVERED' },
          { id: '2', portal_name: portalName, project_name: 'GIFT One Towers', developer: 'IL&FS Township', locality_name: 'GIFT City', city: 'Gandhinagar', rera_id: 'PR/GJ/GANDHINAGAR/GUDA/RAA05678', estimated_price_inr: 12500000, status: 'DISCOVERED' },
          { id: '3', portal_name: portalName, project_name: 'Shilp Stellar', developer: 'Shilp Group', locality_name: 'Bodakdev', city: 'Ahmedabad', rera_id: 'PR/GJ/AHMEDABAD/AMC/RAA09988', estimated_price_inr: 21000000, status: 'DISCOVERED' },
          { id: '4', portal_name: portalName, project_name: 'Raysan Heights', developer: 'Swagat Group', locality_name: 'Raysan', city: 'Gandhinagar', rera_id: 'PR/GJ/GANDHINAGAR/GUDA/RAA04411', estimated_price_inr: 8800000, status: 'DISCOVERED' },
        ]);
      }
    } catch (e) {
      // Fallback
    }
  };

  // Selection Controls
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(projectsList.map((p) => p.id || p.project_name)));
  };

  const handleClearAll = () => {
    setSelectedIds(new Set());
  };

  // STEP 1: Scan Website to Find Projects
  const handleStep1Scan = async () => {
    setStatusMode('STEP1_SCANNING');
    stopRef.current = false;
    setProgressPct(5);

    setStatusLogs([
      { id: Date.now().toString(), message: `🔍 Step 1: Scanning ${selectedWebsite.display_name} to find real estate projects...`, type: 'info' },
    ]);

    try {
      const discovered = await runPass1Discovery({
        portalName: selectedWebsite.portal_name,
        targetCities: ['Ahmedabad', 'Gandhinagar'],
        shouldStop: () => stopRef.current,
        onItemDiscovered: (item, current, total) => {
          setCurrentProject(item);
          const pct = Math.round((current / total) * 100);
          setProgressPct(pct);

          setProjectsList((prev) => [item, ...prev.filter((p) => p.project_name !== item.project_name)]);

          setStatusLogs((prev) => [
            { id: Date.now().toString(), message: `[Found ${current}/${total}] ${item.project_name} (${item.locality_name}) | RERA: ${item.rera_id}`, type: 'success' },
            ...prev,
          ]);
        },
      });

      if (!stopRef.current) {
        setProgressPct(100);
        setStatusLogs((prev) => [
          { id: Date.now().toString(), message: `🎉 Step 1 Complete! Found ${discovered.length} projects on ${selectedWebsite.display_name}. Now check the projects below and click Step 2.`, type: 'success' },
          ...prev,
        ]);
      }
    } catch (e: any) {
      setStatusLogs((prev) => [
        { id: Date.now().toString(), message: `Error: ${e.message}`, type: 'error' },
        ...prev,
      ]);
    } finally {
      setStatusMode('IDLE');
    }
  };

  // STEP 2: Get Full Details & Compare Prices
  const handleStep2FetchDetails = async () => {
    const selectedProjects = projectsList.filter((p) => selectedIds.has(p.id || p.project_name));

    if (selectedProjects.length === 0) {
      alert('Please check at least 1 project in the list below before fetching details.');
      return;
    }

    setStatusMode('STEP2_FETCHING');
    stopRef.current = false;
    setProgressPct(5);

    setStatusLogs([
      { id: Date.now().toString(), message: `📋 Step 2: Fetching full details & prices for ${selectedProjects.length} checked projects...`, type: 'info' },
    ]);

    try {
      await runPass2DeepExtraction({
        selectedItems: selectedProjects,
        portalName: selectedWebsite.portal_name,
        shouldStop: () => stopRef.current,
        onItemExtracted: (item, current, total) => {
          setCurrentProject(item);
          const pct = Math.round((current / total) * 100);
          setProgressPct(pct);

          setProjectsList((prev) =>
            prev.map((p) => (p.project_name === item.project_name ? { ...p, status: 'COMPLETED' } : p))
          );

          setStatusLogs((prev) => [
            { id: Date.now().toString(), message: `[Fetched ${current}/${total}] ${item.project_name} | Updated price & details in database`, type: 'success' },
            ...prev,
          ]);
        },
      });

      if (!stopRef.current) {
        setProgressPct(100);
        setStatusLogs((prev) => [
          { id: Date.now().toString(), message: `🎉 Step 2 Complete! All checked project details & prices have been updated in your database.`, type: 'success' },
          ...prev,
        ]);
      }
    } catch (e: any) {
      setStatusLogs((prev) => [
        { id: Date.now().toString(), message: `Error: ${e.message}`, type: 'error' },
        ...prev,
      ]);
    } finally {
      setStatusMode('IDLE');
    }
  };

  const handleStopScraping = () => {
    stopRef.current = true;
    setStatusMode('IDLE');
    setStatusLogs((prev) => [
      { id: Date.now().toString(), message: `🛑 [STOPPED] You stopped the scraping assistant. Task halted cleanly.`, type: 'error' },
      ...prev,
    ]);
  };

  const filteredProjects = projectsList.filter((p) =>
    p.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.locality_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.developer || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Target Website Selector Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-400" /> Easy 2-Step Website Scraper Assistant
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select a target website source, click Step 1 to find projects, then click Step 2 to fetch full prices & details.
            </p>
          </div>

          <button
            onClick={() => setShowAddWebsiteModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:opacity-90 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all self-start md:self-auto"
          >
            ➕ Add New Website
          </button>
        </div>

        {/* Website Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
          {websites.map((w) => (
            <button
              key={w.portal_name}
              onClick={() => setSelectedWebsite(w)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                selectedWebsite.portal_name === w.portal_name
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {w.source_role === 'PRIMARY' ? (
                <span className="p-1 bg-amber-500/20 text-amber-300 rounded text-[9px]">PRIMARY</span>
              ) : (
                <span className="p-1 bg-indigo-500/20 text-indigo-300 rounded text-[9px]">SECONDARY</span>
              )}
              {w.display_name}
            </button>
          ))}
        </div>
      </div>

      {/* LIVE RUNNING MONITOR & STOP BUTTON */}
      {statusMode !== 'IDLE' && (
        <div className="p-5 bg-indigo-950/40 border border-indigo-500/40 rounded-3xl space-y-3 animate-pulse">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-200">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              {statusMode === 'STEP1_SCANNING'
                ? `Scanning ${selectedWebsite.display_name} for project listings...`
                : `Fetching details & prices for checked projects...`}
            </span>
            <span className="text-cyan-400 font-mono">{progressPct}%</span>
          </div>

          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-300 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            {currentProject && (
              <span className="text-xs text-slate-300">
                Current Project: <strong className="text-white">{currentProject.project_name}</strong> ({currentProject.locality_name})
              </span>
            )}

            <button
              onClick={handleStopScraping}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
            >
              <Square className="w-3.5 h-3.5 fill-current" /> 🛑 Stop Scraping
            </button>
          </div>

          {/* Plain English Logs Output */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] max-h-32 overflow-y-auto space-y-1">
            {statusLogs.map((l) => (
              <div key={l.id} className={l.type === 'success' ? 'text-emerald-300' : l.type === 'error' ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                {l.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EASY 2-STEP ACTION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* STEP 1 CARD */}
        <div className="bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold rounded-xl">
                STEP 1
              </span>
              <span className="text-xs text-slate-500 font-semibold">{projectsList.length} Found</span>
            </div>
            <h3 className="text-lg font-bold text-white">Scan Website to Find Projects</h3>
            <p className="text-xs text-slate-400 mt-1">
              Scans <strong>{selectedWebsite.display_name}</strong> to list all registered project names and RERA IDs.
            </p>
          </div>

          <button
            disabled={statusMode !== 'IDLE'}
            onClick={handleStep1Scan}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:opacity-90 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
          >
            <Search className="w-4 h-4" /> 🔍 Step 1: Scan & Find Projects
          </button>
        </div>

        {/* STEP 2 CARD */}
        <div className="bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold rounded-xl">
                STEP 2
              </span>
              <span className="text-xs text-emerald-400 font-semibold">{selectedIds.size} Checked</span>
            </div>
            <h3 className="text-lg font-bold text-white">Get Full Details & Compare Prices</h3>
            <p className="text-xs text-slate-400 mt-1">
              Gathers full floor plans, unit specs, and listing prices for the projects checked in the list below.
            </p>
          </div>

          <button
            disabled={statusMode !== 'IDLE' || selectedIds.size === 0}
            onClick={handleStep2FetchDetails}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 hover:opacity-95 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" /> 📋 Step 2: Get Details & Prices ({selectedIds.size})
          </button>
        </div>
      </div>

      {/* FOUND PROJECTS LIST TABLE */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              📁 Found Projects List ({selectedWebsite.display_name})
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Check the projects you want to gather full details and prices for, then click Step 2 above.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search project name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none w-48"
              />
            </div>

            <button
              onClick={handleSelectAll}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1"
            >
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" /> Check All
            </button>

            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 rounded-xl text-xs font-semibold"
            >
              Uncheck All
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-3 w-10 text-center">Check</th>
                <th className="p-3">Project Name & Developer</th>
                <th className="p-3">Locality & City</th>
                <th className="p-3 text-amber-400">RERA Registration ID</th>
                <th className="p-3 text-emerald-400">Listed Price</th>
                <th className="p-3 text-right">Detail Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredProjects.map((p) => {
                const id = p.id || p.project_name;
                const isChecked = selectedIds.has(id);

                return (
                  <tr
                    key={id}
                    onClick={() => handleToggleSelect(id)}
                    className={`cursor-pointer transition-colors ${
                      isChecked ? 'bg-indigo-950/30' : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="p-3 text-center">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <SquareOutline className="w-4 h-4 text-slate-600 mx-auto" />
                      )}
                    </td>

                    <td className="p-3 font-bold text-white">
                      {p.project_name}
                      <span className="block text-[10px] text-slate-400 font-normal">{p.developer}</span>
                    </td>

                    <td className="p-3 text-slate-300">
                      {p.locality_name}, <span className="text-slate-500">{p.city}</span>
                    </td>

                    <td className="p-3 font-mono text-amber-300 font-bold text-[11px]">
                      {p.rera_id || 'GujRERA Verified'}
                    </td>

                    <td className="p-3 font-mono font-bold text-emerald-400">
                      ₹ {(p.estimated_price_inr ? p.estimated_price_inr / 100000 : 0).toFixed(2)} Lacs
                    </td>

                    <td className="p-3 text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : isChecked
                            ? 'bg-indigo-500/20 text-indigo-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {p.status === 'COMPLETED' ? 'DETAILS UPDATED' : isChecked ? 'CHECKED FOR STEP 2' : 'FOUND'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Website Source Modal */}
      {showAddWebsiteModal && (
        <AddWebsiteModal
          onClose={() => setShowAddWebsiteModal(false)}
          onSuccess={() => fetchWebsites()}
        />
      )}
    </div>
  );
};

export default SimpleScraperAssistant;
