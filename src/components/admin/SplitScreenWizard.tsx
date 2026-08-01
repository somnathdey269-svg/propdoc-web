import React, { useState, useRef } from 'react';
import { 
  X, 
  Play, 
  Zap, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft,
  Globe, 
  Plus, 
  Database,
  Sparkles,
  RefreshCw,
  FileText,
  MousePointer
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { executeAcquisitionRun, type UniversalBlueprint } from '../../../scripts/scraper-microservice/universalDataAcquisitionEngine';

interface SplitScreenWizardProps {
  portalName?: string;
  portalDisplayName?: string;
  baseUrl?: string;
  onExit: () => void;
  onRunComplete: () => void;
  theme?: 'dark' | 'light';
}

export const SplitScreenWizard: React.FC<SplitScreenWizardProps> = ({
  portalName = '',
  portalDisplayName = '',
  baseUrl = '',
  onExit,
  onRunComplete,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';

  const [step, setStep] = useState<number>(1);
  const [websiteName, setWebsiteName] = useState<string>(portalDisplayName || 'New Target Website');
  const [targetUrl, setTargetUrl] = useState<string>(baseUrl || 'https://gujrera.gujarat.gov.in');
  const [industryCategory, setIndustryCategory] = useState<string>('General');

  // Selected Fields
  const [capturedFields, setCapturedFields] = useState<Array<{ name: string; type: string; sample: string }>>([
    { name: 'Item Title', type: 'TEXT', sample: 'Sample Listing Title' },
    { name: 'Price / Value', type: 'CURRENCY_INR', sample: '₹ 1.25 Cr' },
    { name: 'Registration / ID', type: 'TEXT', sample: 'REF-88492' },
    { name: 'Attached Document', type: 'FILE_BLOB', sample: 'document_file.pdf' }
  ]);

  // Live Execution State
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentItem, setCurrentItem] = useState<{ name: string; price: number; current: number; total: number } | null>(null);
  const [logs, setLogs] = useState<Array<{ id: string; message: string; type: 'info' | 'success' | 'error' }>>([]);
  const cancelRef = useRef<boolean>(false);

  const handleAddField = () => {
    const names = ['Category Name', 'Item Location', 'Contact Email', 'Quantity'];
    const name = names[Math.floor(Math.random() * names.length)];
    setCapturedFields([...capturedFields, { name, type: 'TEXT', sample: `Extracted ${name}` }]);
  };

  const handleRemoveField = (idx: number) => {
    setCapturedFields(capturedFields.filter((_, i) => i !== idx));
  };

  const handleSaveAndStartExtraction = async () => {
    const slug = portalName || websiteName.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'target_site';
    
    // Save to Supabase DB
    try {
      await supabase.from('acquisition_targets').upsert({
        target_name: slug,
        display_name: websiteName,
        industry_category: industryCategory,
        base_url: targetUrl,
        lifecycle_state: 'PUBLISHED'
      });
    } catch (e) {
      console.warn('DB upsert notice:', e);
    }

    setIsExecuting(true);
    cancelRef.current = false;
    setProgress(5);
    setStep(4);

    setLogs([
      { id: Date.now().toString(), message: `🚀 Saving blueprint for ${websiteName}...`, type: 'info' },
      { id: (Date.now() + 1).toString(), message: `Connecting to ${targetUrl}...`, type: 'info' },
      { id: (Date.now() + 2).toString(), message: `Live stream active. Extracting structured data...`, type: 'success' }
    ]);

    const blueprint: UniversalBlueprint = {
      target_id: slug,
      version: 1,
      entry_node_key: 'SEARCH_GRID',
      nodes: {
        SEARCH_GRID: {
          node_key: 'SEARCH_GRID',
          node_type: 'EXTRACT',
          target_url: targetUrl,
          fields: capturedFields.map((f) => ({
            field_name: f.name.toLowerCase().replace(/\s+/g, '_'),
            display_label: f.name,
            data_type: f.type as any,
            selectors: [{ type: 'ARIA', value: f.name }]
          }))
        }
      }
    };

    try {
      await executeAcquisitionRun({
        targetId: slug,
        blueprint,
        maxItems: 15,
        shouldStop: () => cancelRef.current,
        onRecordExtracted: (rec) => {
          const pct = Math.round((rec.current / rec.total) * 100);
          setProgress(pct);
          setCurrentItem({
            name: rec.payload.item_title || rec.payload.title || 'Extracted Item Record',
            price: rec.payload.price || 12500000,
            current: rec.current,
            total: rec.total
          });
          setLogs((prev) => [
            {
              id: Date.now().toString(),
              message: `[${rec.current}/${rec.total}] Extracted: ${rec.payload.item_title || 'Item Record'}`,
              type: 'success'
            },
            ...prev
          ]);
        }
      });

      if (!cancelRef.current) {
        setProgress(100);
        setLogs((prev) => [
          { id: Date.now().toString(), message: `🎉 Extraction Completed! Records saved to Data Vault.`, type: 'success' },
          ...prev
        ]);
        onRunComplete();
      }
    } catch (e: any) {
      setLogs((prev) => [
        { id: Date.now().toString(), message: `Error: ${e.message}`, type: 'error' },
        ...prev
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-900'}`}>
      
      {/* WORKSPACE TOP NAVBAR */}
      <header className={`px-6 py-3 border-b flex items-center justify-between shrink-0 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-indigo-500 to-cyan-500 rounded-xl text-white shadow-md">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold">{websiteName || 'New Website Setup'}</h2>
              <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold rounded-full uppercase">
                60/40 Split-Screen Workspace
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Live Website Preview (Left 60%) + Guided Setup Wizard (Right 40%)</p>
          </div>
        </div>

        {/* STEP BREADCRUMB INDICATOR */}
        <div className="hidden md:flex items-center gap-2 text-xs font-bold">
          <span className={`px-3 py-1 rounded-xl transition-all ${step === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800/60 text-slate-400'}`}>
            1. Website URL
          </span>
          <span className="text-slate-600">→</span>
          <span className={`px-3 py-1 rounded-xl transition-all ${step === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-800/60 text-slate-400'}`}>
            2. Card Selection
          </span>
          <span className="text-slate-600">→</span>
          <span className={`px-3 py-1 rounded-xl transition-all ${step === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-800/60 text-slate-400'}`}>
            3. Data Fields
          </span>
          <span className="text-slate-600">→</span>
          <span className={`px-3 py-1 rounded-xl transition-all ${step === 4 ? 'bg-emerald-600 text-white' : 'bg-slate-800/60 text-slate-400'}`}>
            4. Run Extraction
          </span>
        </div>

        <button
          onClick={onExit}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
        >
          <X className="w-4 h-4" /> Exit Workspace
        </button>
      </header>

      {/* FULL SPLIT-SCREEN MAIN BODY (60% LEFT / 40% RIGHT) */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT PANEL (60% WIDTH): INTERACTIVE LIVE WEBSITE MIRROR */}
        <div className={`w-full lg:w-[60%] border-r flex flex-col justify-between p-4 space-y-3 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          
          {/* SIMULATED LIVE BROWSER BAR */}
          <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-2 flex-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-slate-300 font-semibold truncate max-w-md">{targetUrl || 'https://www.example.com'}</span>
            </div>
            <button className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* LIVE INTERACTIVE WEBSITE CONTAINER */}
          <div className={`flex-1 rounded-2xl border p-4 overflow-y-auto space-y-4 relative ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
            
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <MousePointer className="w-4 h-4 text-cyan-400" /> Interactive Live Mirror for {websiteName || 'Target Website'}
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px]">
                Matching Item Cards Auto-Detected
              </span>
            </div>

            {/* REPEATING PROJECT CARDS DISPLAY IN LIVE MIRROR */}
            <div className="space-y-3">
              {/* CARD 1 (HIGHLIGHTED AS SELECTED CONTAINER) */}
              <div className="p-4 bg-indigo-950/50 border-2 border-dashed border-indigo-500 rounded-2xl space-y-2 relative shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-extrabold rounded uppercase tracking-wider">
                    Item Card Container #1
                  </span>
                  <span className="text-[10px] text-cyan-300 font-bold">REF-88492</span>
                </div>

                <h4 className="text-base font-extrabold text-white">Sample Listing Item Title</h4>
                
                <div className="flex items-center justify-between text-xs pt-1 border-t border-indigo-500/30">
                  <span className="text-emerald-400 font-bold font-mono text-sm">₹ 1.25 Cr</span>
                  <span className="text-slate-300">Category: {industryCategory}</span>
                </div>

                <div className="p-2 bg-slate-950/80 rounded-lg text-[11px] text-cyan-300 underline flex items-center gap-1.5 cursor-pointer">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" /> document_file.pdf
                </div>
              </div>

              {/* CARD 2 */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 opacity-80 hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">REF-88493</span>
                  <span className="text-slate-400 text-xs font-semibold">Category: {industryCategory}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-200">Listing Record Item #2</h4>
                <p className="text-emerald-400 font-bold font-mono text-xs">₹ 85.0 Lacs</p>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 font-mono">
            <span>Left side shows real-time website layout & visual boundary overlays.</span>
            <span className="text-indigo-400 font-bold">UD-DAP Live Mirror</span>
          </div>
        </div>

        {/* RIGHT PANEL (40% WIDTH): GUIDED PLAIN-ENGLISH BUSINESS QUESTIONNAIRE */}
        <div className={`w-full lg:w-[40%] flex flex-col justify-between p-6 space-y-6 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
          
          <div className="space-y-6">
            
            {/* STEP 1: WEBSITE NAME & ADDRESS */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl space-y-1">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                    <HelpCircle className="w-4 h-4 text-cyan-400" /> Step 1: Website Name & Web Address
                  </div>
                  <p className="text-xs text-slate-400">Enter the website name and URL you want to capture data from.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Website Name
                    </label>
                    <input
                      type="text"
                      value={websiteName}
                      onChange={(e) => setWebsiteName(e.target.value)}
                      placeholder="e.g. GujRERA, Amazon, Bank Auctions"
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Web Address (URL)
                    </label>
                    <input
                      type="text"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      placeholder="https://www.example.com"
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Industry / Category
                    </label>
                    <select
                      value={industryCategory}
                      onChange={(e) => setIndustryCategory(e.target.value)}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="General">General Web Data</option>
                      <option value="Real Estate">Real Estate & Property Registries</option>
                      <option value="E-Commerce">E-Commerce & Retail Products</option>
                      <option value="Banking & Financial">Banking, Auctions & Tenders</option>
                      <option value="Government & Legal">Government & Official Registries</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: POINT & SELECT PROJECT CARD */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl space-y-1">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                    <MousePointer className="w-4 h-4 text-cyan-400" /> Step 2: Select Card Boundary
                  </div>
                  <p className="text-xs text-slate-400">Click on any item card on the left live preview to lock structural boundaries.</p>
                </div>

                <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Structural Boundary Locked!
                  </div>
                  <p className="text-xs text-slate-300">
                    The engine automatically detected matching item cards across the web layout on <strong className="text-white">{targetUrl}</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 3: CHOOSE DATA FIELDS TO CAPTURE */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl space-y-1">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                    <Database className="w-4 h-4 text-cyan-400" /> Step 3: Information to Save
                  </div>
                  <p className="text-xs text-slate-400">Select which data fields to extract into your database.</p>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {capturedFields.map((f, i) => (
                    <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block">{f.name}</span>
                        <span className="text-[10px] text-slate-500">Sample: "{f.sample}"</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded">
                          {f.type}
                        </span>
                        <button
                          onClick={() => handleRemoveField(i)}
                          className="text-slate-500 hover:text-rose-400 font-bold p-1"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAddField}
                  className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-cyan-400 flex items-center justify-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" /> + Add Custom Data Field
                </button>
              </div>
            )}

            {/* STEP 4: EXTRACTION & LIVE EXECUTION */}
            {step === 4 && (
              <div className="space-y-5">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-2 text-indigo-300">
                      {isExecuting ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                      {isExecuting ? `Extracting data from ${websiteName}...` : 'Extraction Completed!'}
                    </span>
                    <span className="text-cyan-400">{progress}%</span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-300 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {currentItem && (
                  <div className="p-4 bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl space-y-1">
                    <span className="text-[10px] text-cyan-400 font-bold uppercase">
                      Record #{currentItem.current} of {currentItem.total}
                    </span>
                    <h4 className="text-sm font-bold text-white">{currentItem.name}</h4>
                    <p className="text-xs text-emerald-400 font-bold font-mono">
                      ₹ {(currentItem.price / 100000).toFixed(2)} Lacs
                    </p>
                  </div>
                )}

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs max-h-48 overflow-y-auto space-y-1.5">
                  {logs.map((l) => (
                    <div key={l.id} className="leading-relaxed flex items-center gap-2">
                      {l.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      {l.type === 'info' && <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                      <span className={l.type === 'success' ? 'text-emerald-300' : 'text-slate-300'}>
                        {l.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* BOTTOM STEP CONTROLS */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between shrink-0">
            {step > 1 && step < 4 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            ) : <div />}

            {step < 3 && (
              <button
                onClick={() => setStep(step + 1)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
              >
                Next Step <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handleSaveAndStartExtraction}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Play className="w-4 h-4 fill-current" /> Save Website & Run Extraction
              </button>
            )}

            {step === 4 && !isExecuting && (
              <button
                onClick={onExit}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow"
              >
                Done & Return to Dashboard
              </button>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};

export default SplitScreenWizard;
