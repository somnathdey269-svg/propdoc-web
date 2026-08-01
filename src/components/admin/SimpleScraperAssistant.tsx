import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Play, 
  Globe, 
  RefreshCw,
  Plus,
  Zap,
  Database,
  Sliders,
  CheckCircle2,
  Building2,
  FileText,
  MousePointer,
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import SplitScreenWizard from './SplitScreenWizard';
import { executeAcquisitionRun } from '../../../scripts/scraper-microservice/universalDataAcquisitionEngine';

interface AcquisitionTarget {
  id?: string;
  portal_name: string;
  display_name: string;
  industry_category: string;
  base_url: string;
  health_score?: number;
}

interface ExtractedRecord {
  id: string;
  target_id: string;
  source_url: string;
  record_hash: string;
  payload: Record<string, any>;
  quality_status: string;
  created_at: string;
}

interface SimpleScraperAssistantProps {
  isDark?: boolean;
  theme?: 'dark' | 'light';
}

export const SimpleScraperAssistant: React.FC<SimpleScraperAssistantProps> = ({ theme = 'light' }) => {
  const [targets, setTargets] = useState<AcquisitionTarget[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<AcquisitionTarget | null>(null);
  const [isSplitScreenActive, setIsSplitScreenActive] = useState<boolean>(false);

  // Extracted Data Vault State
  const [extractedRecords, setExtractedRecords] = useState<ExtractedRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingRecords, setIsLoadingRecords] = useState<boolean>(false);
  const [executingTarget, setExecutingTarget] = useState<string | null>(null);

  useEffect(() => {
    fetchTargets();
    fetchExtractedRecords();
  }, []);

  const fetchTargets = async () => {
    try {
      const { data } = await supabase.from('acquisition_targets').select('*');
      if (data && data.length > 0) {
        const mapped: AcquisitionTarget[] = data.map((d) => ({
          id: d.id,
          portal_name: d.target_name || d.portal_name,
          display_name: d.display_name || d.target_name,
          industry_category: d.industry_category || 'General',
          base_url: d.base_url || '',
          health_score: 98,
        }));
        setTargets(mapped);
      } else {
        setTargets([]);
      }
    } catch (err) {
      console.warn('Could not fetch targets:', err);
      setTargets([]);
    }
  };

  const fetchExtractedRecords = async () => {
    setIsLoadingRecords(true);
    try {
      const { data } = await supabase
        .from('extracted_records')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (data && data.length > 0) {
        setExtractedRecords(data);
      } else {
        setExtractedRecords([]);
      }
    } catch (err) {
      console.warn('Could not fetch records:', err);
      setExtractedRecords([]);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  const handleQuickRun = async (target: AcquisitionTarget) => {
    setSelectedTarget(target);
    setExecutingTarget(target.portal_name);
    try {
      await executeAcquisitionRun({
        targetId: target.portal_name,
        blueprint: {
          target_id: target.portal_name,
          version: 1,
          entry_node_key: 'ENTRY',
          nodes: {
            ENTRY: {
              node_key: 'ENTRY',
              node_type: 'EXTRACT',
              target_url: target.base_url,
              fields: [
                { field_name: 'item_title', display_label: 'Title', data_type: 'TEXT', selectors: [{ type: 'ARIA', value: 'title' }] },
                { field_name: 'price', display_label: 'Price', data_type: 'CURRENCY_INR', selectors: [{ type: 'ARIA', value: 'price' }] }
              ]
            }
          }
        },
        maxItems: 5
      });
      await fetchExtractedRecords();
    } catch (e) {
      console.error(e);
    } finally {
      setExecutingTarget(null);
    }
  };

  const handleAddNewWebsite = () => {
    setSelectedTarget(null);
    setIsSplitScreenActive(true);
  };

  const filteredRecords = extractedRecords.filter((r) => {
    const title = r.payload?.item_title || r.payload?.project_name || r.payload?.title || '';
    const loc = r.payload?.locality || r.payload?.developer || '';
    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // IF FULL SPLIT-SCREEN WORKSPACE IS ACTIVE, RENDER FULL WORKSPACE
  if (isSplitScreenActive) {
    return (
      <SplitScreenWizard
        portalName={selectedTarget?.portal_name || ''}
        portalDisplayName={selectedTarget?.display_name || ''}
        baseUrl={selectedTarget?.base_url || ''}
        onExit={() => {
          setIsSplitScreenActive(false);
          fetchTargets();
        }}
        onRunComplete={() => fetchExtractedRecords()}
        theme={theme}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      
      {/* 1. TOP HEADER BANNER */}
      <div className="p-6 rounded-3xl border border-slate-200/90 bg-white text-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Zap className="w-3 h-3 inline mr-1 text-indigo-600" /> Universal Acquisition Platform
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Website Scraper & Data Collector</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Configure and run data extraction for any website using our 60/40 Split-Screen Wizard.
          </p>
        </div>

        <button
          onClick={handleAddNewWebsite}
          className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-cyan-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/25 text-white font-black text-xs rounded-2xl shadow-md hover:scale-[1.02] transition-all flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Website
        </button>
      </div>

      {/* 2. VISUAL 4-STEP PROCESS GUIDE (SHOWCASING STEPS ON 1ST SCREEN) */}
      <div className="p-6 rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/70 via-cyan-50/40 to-white shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-900 font-black text-sm">
            <Sparkles className="w-4.5 h-4.5 text-indigo-600" /> How It Works — 4 Simple Steps to Extract Data
          </div>
          <span className="text-[11px] text-indigo-700 font-extrabold">Zero Code Required</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          
          {/* STEP 1 */}
          <div className="p-4 bg-white border border-indigo-100 rounded-2xl space-y-2 shadow-sm relative">
            <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow">
              1
            </div>
            <h4 className="font-black text-xs text-slate-900 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-600" /> Enter Web Address
            </h4>
            <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
              Enter the target website name & public URL you want to extract data from.
            </p>
          </div>

          {/* STEP 2 */}
          <div className="p-4 bg-white border border-indigo-100 rounded-2xl space-y-2 shadow-sm relative">
            <div className="w-7 h-7 rounded-xl bg-cyan-600 text-white font-black text-xs flex items-center justify-center shadow">
              2
            </div>
            <h4 className="font-black text-xs text-slate-900 flex items-center gap-1.5">
              <MousePointer className="w-3.5 h-3.5 text-cyan-600" /> Select Card Boundary
            </h4>
            <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
              Click any item card on the live mirror. The engine auto-detects all matching cards!
            </p>
          </div>

          {/* STEP 3 */}
          <div className="p-4 bg-white border border-indigo-100 rounded-2xl space-y-2 shadow-sm relative">
            <div className="w-7 h-7 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center shadow">
              3
            </div>
            <h4 className="font-black text-xs text-slate-900 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-600" /> Pick Data Fields
            </h4>
            <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
              Select which details to save into your database (Title, Price, PDF Documents).
            </p>
          </div>

          {/* STEP 4 */}
          <div className="p-4 bg-white border border-indigo-100 rounded-2xl space-y-2 shadow-sm relative">
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow">
              4
            </div>
            <h4 className="font-black text-xs text-slate-900 flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-emerald-600 fill-current" /> Auto-Extract Data
            </h4>
            <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
              Run the extraction job and view extracted records saved to your Data Vault.
            </p>
          </div>

        </div>
      </div>

      {/* 3. TARGET WEBSITES CARDS GRID */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-600" /> Configured Target Websites ({targets.length})
        </h3>

        {targets.length === 0 ? (
          <div className="p-10 rounded-3xl border border-slate-200 bg-white text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-inner">
              <Globe className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900">No Target Websites Configured</h4>
              <p className="text-xs text-slate-500 font-semibold mt-1">Start by adding your first website address to launch the 60/40 Split-Screen setup.</p>
            </div>
            <button
              onClick={handleAddNewWebsite}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-cyan-600 to-purple-600 text-white font-black text-xs rounded-2xl shadow-md hover:scale-[1.02] transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Your First Website <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {targets.map((target) => {
              const isRunning = executingTarget === target.portal_name;
              return (
                <div
                  key={target.portal_name}
                  className="p-5 rounded-3xl border border-slate-200/90 bg-white text-slate-900 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-700 text-[10px] font-black rounded-full">
                        ● Active Target
                      </span>
                      <Globe className="w-4 h-4 text-indigo-500" />
                    </div>
                    <h4 className="font-black text-sm text-slate-900 mb-1">{target.display_name}</h4>
                    <p className="text-[11px] text-slate-500 font-mono font-semibold truncate">{target.base_url}</p>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleQuickRun(target)}
                      disabled={isRunning}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-black text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      {isRunning ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Extracting Data...
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" /> Run Extraction
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setSelectedTarget(target);
                        setIsSplitScreenActive(true);
                      }}
                      className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Sliders className="w-3.5 h-3.5 text-indigo-600" /> Full 60/40 Split-Screen Setup
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. EXTRACTED DATA RESULTS TABLE */}
      <div className="p-6 rounded-3xl border border-slate-200/90 bg-white text-slate-900 shadow-sm transition-all">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-black text-slate-900">Extracted Data Results ({extractedRecords.length})</h3>
              <p className="text-xs text-slate-500 font-semibold">All captured records from recent extraction jobs</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or location..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs font-semibold rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all"
              />
            </div>
            <button
              onClick={fetchExtractedRecords}
              className="p-2 bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingRecords ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-black">
                <th className="p-3 uppercase tracking-wider">PROJECT / ITEM NAME</th>
                <th className="p-3 uppercase tracking-wider">LOCATION & DEVELOPER</th>
                <th className="p-3 uppercase tracking-wider">CAPTURED PRICE</th>
                <th className="p-3 uppercase tracking-wider">STATUS</th>
                <th className="p-3 uppercase tracking-wider">DOCUMENT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-semibold">
                    No extracted records found. Click "+ Add New Website" above to launch split-screen setup and extract data.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const title = r.payload?.item_title || r.payload?.project_name || r.payload?.title || 'Extracted Item';
                  const loc = r.payload?.locality || r.payload?.developer || 'Gujarat';
                  const price = r.payload?.price ? `₹ ${(r.payload.price / 100000).toFixed(2)} Lacs` : 'Extracted';
                  const doc = r.payload?.pdf_document || 'Sanctioned_Plan.pdf';

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-black text-slate-900 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>{title}</span>
                      </td>
                      <td className="p-3 text-slate-700 font-bold">{loc}</td>
                      <td className="p-3 text-emerald-700 font-mono font-black text-sm">{price}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-black rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-indigo-600 font-mono text-[11px] font-bold hover:underline cursor-pointer flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-indigo-600" /> {doc}
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

    </div>
  );
};

export default SimpleScraperAssistant;
