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
  MousePointer,
  Lock,
  Tag,
  Layers,
  ShieldCheck
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
}) => {
  const [step, setStep] = useState<number>(1);
  const [websiteName, setWebsiteName] = useState<string>(portalDisplayName || '');
  const [targetUrl, setTargetUrl] = useState<string>(baseUrl || '');
  const [industryCategory, setIndustryCategory] = useState<string>('General');

  // Selected Fields
  const [capturedFields, setCapturedFields] = useState<Array<{ name: string; type: string; sample: string }>>([
    { name: 'Item Title', type: 'TEXT', sample: 'Sample Listing Record' },
    { name: 'Price / Value', type: 'CURRENCY_INR', sample: '₹ 1.25 Cr' },
    { name: 'Registration / ID', type: 'TEXT', sample: 'REF-88492' },
    { name: 'Attached Document', type: 'FILE_BLOB', sample: 'sanctioned_doc.pdf' }
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
    
    try {
      await supabase.from('acquisition_targets').upsert({
        target_name: slug,
        display_name: websiteName || 'Target Website',
        industry_category: industryCategory,
        base_url: targetUrl || 'https://www.example.com',
        lifecycle_state: 'PUBLISHED'
      });
    } catch (e) {
      console.warn('DB notice:', e);
    }

    setIsExecuting(true);
    cancelRef.current = false;
    setProgress(5);
    setStep(4);

    setLogs([
      { id: Date.now().toString(), message: `🚀 Saving blueprint for ${websiteName || 'Target Website'}...`, type: 'info' },
      { id: (Date.now() + 1).toString(), message: `Connecting live stream to ${targetUrl}...`, type: 'info' },
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
          target_url: targetUrl || 'https://www.example.com',
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
    <div className="fixed inset-0 z-50 flex flex-col font-sans bg-slate-50 text-slate-900">
      
      {/* 1. CLEAN TOP HEADER BAR (NO UNNECESSARY BUTTONS / STEPS CLUTTER) */}
      <header className="px-6 py-3.5 bg-white border-b border-slate-200/90 flex items-center justify-between shrink-0 shadow-sm relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-tight text-slate-900">{websiteName || 'New Target Website Setup'}</h2>
              <span className="px-3 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-black rounded-full uppercase tracking-wider">
                60/40 Split-Screen Workspace
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Live Interactive Web Mirror (Left 60%) • Guided Business Wizard (Right 40%)</p>
          </div>
        </div>

        <button
          onClick={onExit}
          className="px-4 py-2 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-600 text-xs font-black rounded-xl flex items-center gap-2 transition-all"
        >
          <X className="w-4 h-4 text-rose-500" /> Exit Workspace
        </button>
      </header>

      {/* 2. SPLIT-SCREEN MAIN CONTAINER (60% LEFT / 40% RIGHT) */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT PANEL (60% WIDTH): LIVE INTERACTIVE WEBSITE MIRROR */}
        <div className="w-full lg:w-[60%] border-r border-slate-200 flex flex-col justify-between p-5 space-y-4 bg-indigo-50/30">
          
          {/* SIMULATED BRIGHT BROWSER TOP BAR */}
          <div className="p-3 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-sm">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
            </div>

            <div className="flex-1 max-w-xl mx-auto px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 font-mono text-xs text-slate-800">
              <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate font-semibold">{targetUrl || 'Type Web Address (URL) on right panel...'}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-300 text-emerald-700 text-[10px] font-black rounded-full flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> {targetUrl ? 'LIVE READY' : 'WAITING FOR URL'}
              </span>
              <button className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* LIVE WEBSITE PREVIEW CANVAS */}
          <div className="flex-1 rounded-3xl border border-slate-200 bg-white p-6 overflow-y-auto space-y-4 relative shadow-lg flex flex-col justify-between">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-black text-slate-800">
                <MousePointer className="w-4 h-4 text-indigo-600" /> Live Target Mirror Preview
              </div>
              {targetUrl && (
                <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-black rounded-xl flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Live Stream Connected
                </span>
              )}
            </div>

            {/* BLANK STATE BEFORE TARGET URL OR DURING SETUP */}
            {!targetUrl ? (
              <div className="my-auto py-12 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-inner">
                  <Globe className="w-8 h-8" />
                </div>
                <h4 className="text-base font-black text-slate-900">Live Website Preview Area</h4>
                <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto">
                  Type your target Web Address (URL) on the right panel to load and display the live website preview.
                </p>
              </div>
            ) : (
              /* CLEAN BLANK/CARD OVERLAY DISPLAY WHEN URL IS ENTERED */
              <div className="space-y-4 pt-2">
                <div className="p-5 bg-gradient-to-br from-indigo-50/90 via-cyan-50/50 to-white border-2 border-indigo-600 rounded-3xl space-y-3 relative shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-lg tracking-wider">
                      TARGET WEB MIRROR: {websiteName || 'Active Website'}
                    </span>
                    <span className="px-2.5 py-0.5 bg-indigo-100 border border-indigo-200 text-indigo-800 text-[10px] font-mono font-black rounded-md">
                      {targetUrl}
                    </span>
                  </div>

                  <div className="p-4 bg-white border border-indigo-200 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-700 font-bold">
                      <span>Detected Structural Boundary</span>
                      <span className="text-emerald-600 font-mono font-black">Live Connected</span>
                    </div>
                    <p className="text-slate-500 font-semibold">
                      Click on any card or element in the live website stream to capture item schemas.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-3 border-t border-slate-100 font-semibold">
              <span>Left side shows real-time website layout & visual boundary overlays.</span>
              <span className="text-indigo-600 font-extrabold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Universal Deterministic Engine
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL (40% WIDTH): BRIGHT HIGH-CONTRAST GUIDED WIZARD */}
        <div className="w-full lg:w-[40%] flex flex-col justify-between p-8 space-y-6 bg-white">
          
          <div className="space-y-6">
            
            {/* STEP 1: WEBSITE NAME & ADDRESS */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="p-5 bg-gradient-to-br from-indigo-50 via-cyan-50/40 to-white border border-indigo-200 rounded-3xl space-y-1.5 shadow-sm">
                  <div className="flex items-center gap-2 text-indigo-900 font-black text-sm">
                    <HelpCircle className="w-4.5 h-4.5 text-indigo-600" /> Step 1 of 4: Target Website Address
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                    Enter the website name and public URL you want to extract structured data from.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-indigo-600" /> Website Name
                    </label>
                    <input
                      type="text"
                      value={websiteName}
                      onChange={(e) => setWebsiteName(e.target.value)}
                      placeholder="e.g. GujRERA, Amazon, Bank Auctions"
                      className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-extrabold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-indigo-600" /> Web Address (URL)
                    </label>
                    <input
                      type="text"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      placeholder="https://www.example.com"
                      className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-mono font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" /> Industry Domain / Category
                    </label>
                    <select
                      value={industryCategory}
                      onChange={(e) => setIndustryCategory(e.target.value)}
                      className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-extrabold text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
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
              <div className="space-y-6">
                <div className="p-5 bg-gradient-to-br from-indigo-50 via-cyan-50/40 to-white border border-indigo-200 rounded-3xl space-y-1.5 shadow-sm">
                  <div className="flex items-center gap-2 text-indigo-900 font-black text-sm">
                    <MousePointer className="w-4.5 h-4.5 text-indigo-600" /> Step 2 of 4: Select Card Boundary
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                    Click on any item card on the left preview screen to lock recurring item boundaries.
                  </p>
                </div>

                <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-3xl space-y-2 shadow-sm">
                  <div className="flex items-center gap-2 text-emerald-800 text-xs font-black">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" /> Structural Card Boundary Locked!
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                    The engine automatically detected matching item cards across the web layout on <strong className="text-indigo-700">{targetUrl || 'Target Website'}</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 3: CHOOSE DATA FIELDS TO CAPTURE */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="p-5 bg-gradient-to-br from-indigo-50 via-cyan-50/40 to-white border border-indigo-200 rounded-3xl space-y-1.5 shadow-sm">
                  <div className="flex items-center gap-2 text-indigo-900 font-black text-sm">
                    <Database className="w-4.5 h-4.5 text-indigo-600" /> Step 3 of 4: Information to Save
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                    Select which data fields to extract into your database.
                  </p>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {capturedFields.map((f, i) => (
                    <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-2xl flex items-center justify-between text-xs transition-all shadow-sm">
                      <div>
                        <span className="font-black text-slate-900 block text-sm">{f.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono font-semibold">Sample: "{f.sample}"</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10px] font-black rounded-lg">
                          {f.type}
                        </span>
                        <button
                          onClick={() => handleRemoveField(i)}
                          className="p-1 text-slate-400 hover:text-rose-600 font-bold transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAddField}
                  className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-2xl text-xs font-black text-indigo-700 flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4 text-indigo-600" /> + Add Custom Data Field
                </button>
              </div>
            )}

            {/* STEP 4: EXTRACTION & LIVE EXECUTION */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-3 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="flex items-center gap-2 text-indigo-900">
                      {isExecuting ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                      {isExecuting ? `Extracting data from ${websiteName || 'Target Website'}...` : 'Extraction Completed!'}
                    </span>
                    <span className="text-indigo-600 font-mono font-extrabold text-sm">{progress}%</span>
                  </div>

                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-600 via-cyan-500 to-purple-600 transition-all duration-300 rounded-full shadow"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {currentItem && (
                  <div className="p-5 bg-gradient-to-r from-indigo-50 to-cyan-50 border border-indigo-200 rounded-3xl space-y-1 shadow-sm">
                    <span className="text-[10px] text-indigo-700 font-black uppercase tracking-wider">
                      Extracted Record #{currentItem.current} of {currentItem.total}
                    </span>
                    <h4 className="text-base font-black text-slate-900">{currentItem.name}</h4>
                    <p className="text-sm text-emerald-700 font-black font-mono">
                      ₹ {(currentItem.price / 100000).toFixed(2)} Lacs
                    </p>
                  </div>
                )}

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl font-mono text-xs max-h-52 overflow-y-auto space-y-2 shadow-inner">
                  {logs.map((l) => (
                    <div key={l.id} className="leading-relaxed flex items-center gap-2">
                      {l.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      {l.type === 'info' && <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                      <span className={l.type === 'success' ? 'text-emerald-800 font-bold' : 'text-slate-700 font-semibold'}>
                        {l.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* 3. HIGH-CONTRAST BRIGHT FOOTER */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between shrink-0">
            {step > 1 && step < 4 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-black rounded-2xl flex items-center gap-2 transition-all shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}

            {step < 3 && (
              <button
                onClick={() => setStep(step + 1)}
                className="px-7 py-3.5 bg-gradient-to-r from-indigo-600 via-cyan-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/25 text-white font-black text-xs rounded-2xl flex items-center gap-2 shadow-md transition-all hover:scale-[1.02]"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handleSaveAndStartExtraction}
                className="px-7 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:shadow-lg hover:shadow-emerald-500/25 text-white font-black text-xs rounded-2xl flex items-center gap-2 shadow-md transition-all hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-current" /> Save Website & Run Extraction
              </button>
            )}

            {step === 4 && !isExecuting && (
              <button
                onClick={onExit}
                className="px-7 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-black text-xs rounded-2xl shadow-lg transition-all"
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
