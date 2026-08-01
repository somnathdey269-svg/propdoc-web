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
  FileText
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AddWebsiteModal from './AddWebsiteModal';
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

export const SimpleScraperAssistant: React.FC<SimpleScraperAssistantProps> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const [targets, setTargets] = useState<AcquisitionTarget[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<AcquisitionTarget | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
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
        if (!selectedTarget) {
          setSelectedTarget(mapped[0]);
        }
      } else {
        setTargets([]);
        setSelectedTarget(null);
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

  const filteredRecords = extractedRecords.filter((r) => {
    const title = r.payload?.item_title || r.payload?.project_name || r.payload?.title || '';
    const loc = r.payload?.locality || r.payload?.developer || '';
    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // IF FULL SPLIT-SCREEN WORKSPACE IS ACTIVE, RENDER FULL WORKSPACE
  if (isSplitScreenActive && selectedTarget) {
    return (
      <SplitScreenWizard
        portalName={selectedTarget.portal_name}
        portalDisplayName={selectedTarget.display_name}
        baseUrl={selectedTarget.base_url}
        onExit={() => setIsSplitScreenActive(false)}
        onRunComplete={() => fetchExtractedRecords()}
        theme={theme}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* 1. TOP HEADER BANNER */}
      <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${isDark ? 'bg-slate-900/90 border-slate-800 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'bg-cyan-50 text-cyan-700 border border-cyan-200'}`}>
              <Zap className="w-3 h-3 inline mr-1" /> Simple Data Acquisition
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Website Scraper & Data Collector</h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Configure and run data extraction for any website from scratch.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-all flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Website
        </button>
      </div>

      {/* 2. TARGET WEBSITES CARDS GRID */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" /> Configured Target Websites ({targets.length})
        </h3>

        {targets.length === 0 ? (
          <div className={`p-10 rounded-3xl border text-center space-y-4 ${isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'}`}>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Globe className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-white">No Target Websites Configured</h4>
              <p className="text-xs text-slate-400 mt-1">Start by adding your first website address to begin extracting data.</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Your First Website
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {targets.map((target) => {
              const isRunning = executingTarget === target.portal_name;
              return (
                <div
                  key={target.portal_name}
                  className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all ${
                    isDark ? 'bg-slate-900/80 border-slate-800 text-white hover:border-slate-700' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-full">
                        ● Active Target
                      </span>
                      <Globe className="w-4 h-4 text-slate-400" />
                    </div>
                    <h4 className="font-extrabold text-sm mb-1">{target.display_name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono truncate">{target.base_url}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800/60">
                    <button
                      onClick={() => handleQuickRun(target)}
                      disabled={isRunning}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
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
                      className="w-full py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Full 60/40 Split-Screen Setup
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. EXTRACTED DATA RESULTS TABLE */}
      <div className={`p-6 rounded-3xl border transition-all ${isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold">Extracted Data Results ({extractedRecords.length})</h3>
              <p className="text-xs text-slate-400">All captured records from recent extraction jobs</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by project name or location..."
                className={`w-full pl-9 pr-4 py-2 text-xs border rounded-xl focus:outline-none ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600' : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>
            <button
              onClick={fetchExtractedRecords}
              className={`p-2 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-50 border-slate-200'}`}
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingRecords ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className={`border-b ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
                <th className="p-3 font-bold uppercase tracking-wider">PROJECT / ITEM NAME</th>
                <th className="p-3 font-bold uppercase tracking-wider">LOCATION & DEVELOPER</th>
                <th className="p-3 font-bold uppercase tracking-wider">CAPTURED PRICE</th>
                <th className="p-3 font-bold uppercase tracking-wider">STATUS</th>
                <th className="p-3 font-bold uppercase tracking-wider">DOCUMENT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No extracted records found. Add a target website above and click "Run Extraction" to populate data.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const title = r.payload?.item_title || r.payload?.project_name || r.payload?.title || 'Extracted Item';
                  const loc = r.payload?.locality || r.payload?.developer || 'Gujarat';
                  const price = r.payload?.price ? `₹ ${(r.payload.price / 100000).toFixed(2)} Lacs` : 'Extracted';
                  const doc = r.payload?.pdf_document || 'Sanctioned_Plan.pdf';

                  return (
                    <tr key={r.id} className={`transition-colors ${isDark ? 'hover:bg-slate-950/60' : 'hover:bg-slate-50'}`}>
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>{title}</span>
                      </td>
                      <td className="p-3 text-slate-300 font-medium">{loc}</td>
                      <td className="p-3 text-emerald-400 font-mono font-bold">{price}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-300 text-[10px] font-bold rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Completed
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-cyan-400 font-mono text-[11px] hover:underline cursor-pointer flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" /> {doc}
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

      {/* MODAL FOR ADDING NEW TARGET */}
      {showAddModal && (
        <AddWebsiteModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchTargets();
          }}
        />
      )}
    </div>
  );
};

export default SimpleScraperAssistant;
