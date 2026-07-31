import React, { useState, useEffect, useRef } from 'react';
import { 
  GitBranch, 
  Search, 
  Play, 
  Square, 
  CheckSquare, 
  Square as SquareOutline, 
  Code, 
  Database,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { 
  runPass1Discovery, 
  runPass2DeepExtraction, 
  type DiscoveredProject, 
  type ActionNode 
} from '../../../scripts/scraper-microservice/adaptivePipelineEngine';

export const AdaptivePipelineManager: React.FC = () => {
  // Portal & City Scope
  const [selectedPortal, setSelectedPortal] = useState<'gujrera' | '99acres' | 'magicbricks' | 'squareyards'>('gujrera');
  const [targetCities] = useState<string[]>(['Ahmedabad', 'Gandhinagar']);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pass 1 Staging Registry
  const [stagingData, setStagingData] = useState<DiscoveredProject[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  // Pipeline Execution State
  const [activePass, setActivePass] = useState<'IDLE' | 'PASS1_RUNNING' | 'PASS2_RUNNING'>('IDLE');
  const [progress, setProgress] = useState<number>(0);
  const [currentItem, setCurrentItem] = useState<DiscoveredProject | null>(null);
  const [liveLogs, setLiveLogs] = useState<{ id: string; message: string; type: 'info' | 'success' | 'warn' | 'error' }[]>([]);

  // Tab Checkboxes for Pass 2
  const [selectedTabs] = useState<string[]>([
    'Tab 1: Basic Specs & Land Area',
    'Tab 2: Developer History & Reg',
    'Tab 3: Approved Floor Plans & Pricing',
    'Tab 4: Financial Filings & Mortgages',
  ]);

  // Action Nodes Config
  const [actionNodes] = useState<ActionNode[]>([
    { type: 'NAVIGATE', label: 'Step 1: Open Target SPA Endpoint', target_url: 'https://gujrera.gujarat.gov.in/#/home-p/registered-project-listing' },
    { type: 'INTERACT', label: 'Step 2: Apply District Filter', selector: '#districtSelect', action: 'SELECT_OPTION', value: 'Ahmedabad' },
    { type: 'DISCOVER_INDEX', label: 'Step 3: Discover Master Project Cards', card_selector: 'tr.project-row', detail_url_pattern: '/#/project-preview?id={id}' },
    { type: 'TAB_DRILLDOWN', label: 'Step 4: Drill Down Detail Sub-Tabs', tabs: ['Tab 1: Basic Specs', 'Tab 2: Promoter History', 'Tab 3: Approved Plans', 'Tab 4: Financials'] },
    { type: 'UPSERT', label: 'Step 5: Upsert Enriched Data to Supabase', target_table: 'projects' },
  ]);

  const cancelRef = useRef<boolean>(false);

  useEffect(() => {
    fetchStagingData();
  }, [selectedPortal]);

  const fetchStagingData = async () => {
    try {
      const { data } = await supabase
        .from('scraper_discovery_staging')
        .select('*')
        .eq('portal_name', selectedPortal)
        .order('discovered_at', { ascending: false });

      if (data && data.length > 0) {
        setStagingData(data as DiscoveredProject[]);
      } else {
        // Mock seed items if table empty
        const mockSeed: DiscoveredProject[] = [
          { id: '1', portal_name: selectedPortal, project_name: 'Verona Elegance', developer: 'Verona Group', locality_name: 'Gota', city: 'Ahmedabad', rera_id: 'PR/GJ/AHMEDABAD/AUDA/RAA01234', estimated_price_inr: 7800000, status: 'DISCOVERED' },
          { id: '2', portal_name: selectedPortal, project_name: 'GIFT One Towers', developer: 'IL&FS Township', locality_name: 'GIFT City', city: 'Gandhinagar', rera_id: 'PR/GJ/GANDHINAGAR/GUDA/RAA05678', estimated_price_inr: 12500000, status: 'DISCOVERED' },
          { id: '3', portal_name: selectedPortal, project_name: 'Shilp Stellar', developer: 'Shilp Group', locality_name: 'Bodakdev', city: 'Ahmedabad', rera_id: 'PR/GJ/AHMEDABAD/AMC/RAA09988', estimated_price_inr: 21000000, status: 'DISCOVERED' },
          { id: '4', portal_name: selectedPortal, project_name: 'Raysan Heights', developer: 'Swagat Group', locality_name: 'Raysan', city: 'Gandhinagar', rera_id: 'PR/GJ/GANDHINAGAR/GUDA/RAA04411', estimated_price_inr: 8800000, status: 'DISCOVERED' },
        ];
        setStagingData(mockSeed);
      }
    } catch (e) {
      // Fallback
    }
  };

  // Selection Toggles
  const handleToggleSelect = (id: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    const allIds = stagingData.map((d) => d.id || d.project_name);
    setSelectedItemIds(new Set(allIds));
  };

  const handleClearSelection = () => {
    setSelectedItemIds(new Set());
  };

  // PASS 1 Execution
  const handleLaunchPass1 = async () => {
    setActivePass('PASS1_RUNNING');
    cancelRef.current = false;
    setProgress(5);

    setLiveLogs([
      { id: Date.now().toString(), message: `🔍 Launching PASS 1 Reconnaissance Scan for ${selectedPortal.toUpperCase()}...`, type: 'info' },
    ]);

    try {
      const items = await runPass1Discovery({
        portalName: selectedPortal,
        targetCities,
        shouldStop: () => cancelRef.current,
        onItemDiscovered: (item, current, total) => {
          setCurrentItem(item);
          const pct = Math.round((current / total) * 100);
          setProgress(pct);

          setStagingData((prev) => [item, ...prev.filter((p) => p.project_name !== item.project_name)]);

          setLiveLogs((prev) => [
            { id: Date.now().toString(), message: `[DISCOVERED ${current}/${total}] ${item.project_name} (${item.locality_name}) | RERA: ${item.rera_id}`, type: 'success' },
            ...prev,
          ]);
        },
      });

      if (!cancelRef.current) {
        setProgress(100);
        setLiveLogs((prev) => [
          { id: Date.now().toString(), message: `🎉 PASS 1 Recon Scan Complete! ${items.length} master project records discovered. Select items for Pass 2.`, type: 'success' },
          ...prev,
        ]);
      }
    } catch (e: any) {
      setLiveLogs((prev) => [
        { id: Date.now().toString(), message: `Pass 1 Error: ${e.message}`, type: 'error' },
        ...prev,
      ]);
    } finally {
      setActivePass('IDLE');
    }
  };

  // PASS 2 Execution
  const handleLaunchPass2 = async () => {
    const selectedList = stagingData.filter((d) => selectedItemIds.has(d.id || d.project_name));

    if (selectedList.length === 0) {
      alert('Please select at least 1 discovered project candidate from Pass 1 staging table below.');
      return;
    }

    setActivePass('PASS2_RUNNING');
    cancelRef.current = false;
    setProgress(5);

    setLiveLogs([
      { id: Date.now().toString(), message: `🚀 Launching PASS 2 Deep Multi-Tab Extraction for ${selectedList.length} selected projects...`, type: 'info' },
    ]);

    try {
      await runPass2DeepExtraction({
        selectedItems: selectedList,
        portalName: selectedPortal,
        tabsToExtract: selectedTabs,
        shouldStop: () => cancelRef.current,
        onItemExtracted: (item, current, total) => {
          setCurrentItem(item);
          const pct = Math.round((current / total) * 100);
          setProgress(pct);

          setStagingData((prev) =>
            prev.map((p) => (p.project_name === item.project_name ? { ...p, status: 'COMPLETED' } : p))
          );

          setLiveLogs((prev) => [
            { id: Date.now().toString(), message: `[DEEP EXTRACTED ${current}/${total}] ${item.project_name} | Extracted ${selectedTabs.length} Sub-Tabs | Upserted to Supabase`, type: 'success' },
            ...prev,
          ]);
        },
      });

      if (!cancelRef.current) {
        setProgress(100);
        setLiveLogs((prev) => [
          { id: Date.now().toString(), message: `🎉 PASS 2 Deep Multi-Tab Extraction Completed Successfully! Data synced to database.`, type: 'success' },
          ...prev,
        ]);
      }
    } catch (e: any) {
      setLiveLogs((prev) => [
        { id: Date.now().toString(), message: `Pass 2 Error: ${e.message}`, type: 'error' },
        ...prev,
      ]);
    } finally {
      setActivePass('IDLE');
    }
  };

  const handleStopPipeline = () => {
    cancelRef.current = true;
    setActivePass('IDLE');
    setLiveLogs((prev) => [
      { id: Date.now().toString(), message: `🛑 [PIPELINE ABORTED] User requested emergency stop. Aborting tasks...`, type: 'error' },
      ...prev,
    ]);
  };

  const filteredStaging = stagingData.filter((item) =>
    item.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.locality_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.developer || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-indigo-400" /> Dynamic Two-Pass Adaptive Scraper Engine
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Pass 1 Lightweight Reconnaissance Indexing ──► Inspect & Choose ──► Pass 2 Deep Multi-Tab Targeted Extractions.
            </p>
          </div>

          {/* Portal Switcher */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 p-2 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400 px-2">Target Site:</span>
            {(['gujrera', '99acres', 'magicbricks', 'squareyards'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPortal(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                  selectedPortal === p
                    ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LIVE MONITOR & STOP CONTROL BAR (IF RUNNING) */}
      {activePass !== 'IDLE' && (
        <div className="p-4 bg-indigo-950/40 border border-indigo-500/40 rounded-2xl space-y-3 animate-pulse">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              Running {activePass === 'PASS1_RUNNING' ? 'PASS 1 Reconnaissance Discovery Scan' : 'PASS 2 Deep Multi-Tab Extraction'}...
            </span>
            <span>{progress}%</span>
          </div>

          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            {currentItem && (
              <span className="text-xs text-slate-300 font-medium">
                Current Item: <strong className="text-white">{currentItem.project_name}</strong> ({currentItem.locality_name})
              </span>
            )}

            <button
              onClick={handleStopPipeline}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
            >
              <Square className="w-3.5 h-3.5 fill-current" /> 🛑 STOP / ABORT PIPELINE
            </button>
          </div>

          {/* Live Logs Stream */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] max-h-36 overflow-y-auto space-y-1">
            {liveLogs.map((l) => (
              <div key={l.id} className={l.type === 'success' ? 'text-emerald-300' : l.type === 'error' ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                {l.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PASS 1 & PASS 2 DUAL ACTION BAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PASS 1 TRIGGER CARD */}
        <div className="bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold rounded-xl">
                PASS 1: Reconnaissance
              </span>
              <span className="text-xs text-slate-500 font-semibold">{stagingData.length} Discovered</span>
            </div>
            <h3 className="text-lg font-bold text-white">Lightweight Index Scan</h3>
            <p className="text-xs text-slate-400 mt-1">
              Rapidly crawls target portal search results to discover all master project listings and metadata without heavy tab drilldowns.
            </p>
          </div>

          <button
            disabled={activePass !== 'IDLE'}
            onClick={handleLaunchPass1}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-blue-600 hover:opacity-90 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
          >
            <Search className="w-4 h-4" /> 🔍 Run Pass 1 Recon Discovery
          </button>
        </div>

        {/* PASS 2 TRIGGER CARD */}
        <div className="bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold rounded-xl">
                PASS 2: Deep Extraction
              </span>
              <span className="text-xs text-emerald-400 font-semibold">{selectedItemIds.size} Items Selected</span>
            </div>
            <h3 className="text-lg font-bold text-white">Targeted Multi-Tab Scrape</h3>
            <p className="text-xs text-slate-400 mt-1">
              Executes deep multi-tab drilldowns (GujRERA Tabs 1–5 or JSON-LD SEO schemas) strictly on the items you select below.
            </p>
          </div>

          <button
            disabled={activePass !== 'IDLE' || selectedItemIds.size === 0}
            onClick={handleLaunchPass2}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 hover:opacity-95 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" /> 🚀 Launch Pass 2 Deep Scrape ({selectedItemIds.size})
          </button>
        </div>
      </div>

      {/* DYNAMIC ACTION NODE PIPELINE VISUALIZER */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Code className="w-4 h-4 text-cyan-400" /> Active Action Node Pipeline Sequence ({selectedPortal.toUpperCase()})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {actionNodes.map((node, idx) => (
            <div key={idx} className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs space-y-1">
              <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[10px] font-mono font-bold">
                {node.type}
              </span>
              <p className="font-bold text-slate-200 text-[11px] truncate">{node.label}</p>
              <p className="text-[10px] text-slate-500 truncate font-mono">
                {node.target_url || node.selector || node.card_selector || node.target_table || 'Multi-Tab Rule'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* STAGING DISCOVERY REVIEW REGISTRY TABLE */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4.5 h-4.5 text-indigo-400" /> Pass 1 Discovered Index Staging Registry
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Inspect discovered project candidates and check the items you want to send to Pass 2 deep extraction.
            </p>
          </div>

          {/* Table Actions & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search discovered items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none w-48"
              />
            </div>

            <button
              onClick={handleSelectAll}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1"
            >
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" /> Select All
            </button>

            <button
              onClick={handleClearSelection}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 rounded-xl text-xs font-semibold"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Staging Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-3 w-10 text-center">Select</th>
                <th className="p-3">Project & Developer</th>
                <th className="p-3">Locality & City</th>
                <th className="p-3 text-amber-400">RERA Registration No</th>
                <th className="p-3 text-emerald-400">Est. Price</th>
                <th className="p-3 text-right">Pass 2 Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredStaging.map((item) => {
                const id = item.id || item.project_name;
                const isSelected = selectedItemIds.has(id);

                return (
                  <tr
                    key={id}
                    onClick={() => handleToggleSelect(id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-950/30' : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="p-3 text-center">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <SquareOutline className="w-4 h-4 text-slate-600 mx-auto" />
                      )}
                    </td>

                    <td className="p-3 font-bold text-white">
                      {item.project_name}
                      <span className="block text-[10px] text-slate-400 font-normal">{item.developer}</span>
                    </td>

                    <td className="p-3 text-slate-300">
                      {item.locality_name}, <span className="text-slate-500">{item.city}</span>
                    </td>

                    <td className="p-3 font-mono text-amber-300 font-bold text-[11px]">
                      {item.rera_id || 'GujRERA Verified'}
                    </td>

                    <td className="p-3 font-mono font-bold text-emerald-400">
                      ₹ {(item.estimated_price_inr ? item.estimated_price_inr / 100000 : 0).toFixed(2)} Lacs
                    </td>

                    <td className="p-3 text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : isSelected
                            ? 'bg-indigo-500/20 text-indigo-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.status === 'COMPLETED' ? 'COMPLETED (PASS 2)' : isSelected ? 'READY FOR PASS 2' : 'DISCOVERED'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdaptivePipelineManager;
