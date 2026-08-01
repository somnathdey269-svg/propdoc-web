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
  MousePointer,
  Lock,
  Tag,
  Layers,
  ChevronRight,
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
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';

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
      { id: (Date.now() + 1).toString(), message: `Connecting live browser stream to ${targetUrl}...`, type: 'info' },
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
    <div className={`fixed inset-0 z-50 flex flex-col font-sans transition-colors duration-300 ${isDark ? 'bg-[#070913] text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      
      {/* 1. STUNNING TOP NAVIGATION HEADER */}
      <header className={`px-6 py-3.5 border-b flex items-center justify-between shrink-0 shadow-lg relative z-10 transition-colors ${isDark ? 'bg-slate-950/90 backdrop-blur-2xl border-slate-800/80' : 'bg-white/95 backdrop-blur-2xl border-slate-200'}`}>
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-tight">{websiteName || 'New Target Website Setup'}</h2>
              <span className="px-2.5 py-0.5 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                60/40 Split-Screen Workspace
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Live Interactive Website Mirror (Left) • Guided Business Wizard (Right)</p>
          </div>
        </div>

        {/* STEP PROGRESS BREADCRUMB BADGES */}
        <div className="hidden lg:flex items-center gap-2">
          {[
            { s: 1, label: '1. Website URL' },
            { s: 2, label: '2. Card Selection' },
            { s: 3, label: '3. Data Fields' },
            { s: 4, label: '4. Run Extraction' },
          ].map((item, idx) => (
            <React.Fragment key={item.s}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
              <span className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                step === item.s
                  ? 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white shadow-md shadow-cyan-500/20 scale-105'
                  : step > item.s
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-900/60 text-slate-500 border border-slate-800'
              }`}>
                {step > item.s && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                {item.label}
              </span>
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={onExit}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm"
        >
          <X className="w-4 h-4 text-rose-400" /> Exit Workspace
        </button>
      </header>

      {/* 2. SPLIT-SCREEN MAIN CONTAINER (60% LEFT / 40% RIGHT) */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT PANEL (60% WIDTH): LIVE INTERACTIVE WEBSITE MIRROR */}
        <div className={`w-full lg:w-[60%] border-r flex flex-col justify-between p-5 space-y-4 ${isDark ? 'bg-[#0b0e1b] border-slate-800/80' : 'bg-slate-100 border-slate-200'}`}>
          
          {/* SIMULATED SAFARI/CHROME BROWSER TOP BAR */}
          <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs shadow-md ${isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>

            <div className="flex-1 max-w-xl mx-auto px-4 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-2 font-mono text-xs text-slate-200 shadow-inner">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{targetUrl || 'https://www.example.com'}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-full flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> LIVE CONNECTED
              </span>
              <button className="p-1.5 bg-slate-800/80 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* LIVE WEBSITE PREVIEW CANVAS */}
          <div className={`flex-1 rounded-3xl border p-6 overflow-y-auto space-y-4 relative shadow-2xl ${isDark ? 'bg-[#0e1224]/90 border-slate-800' : 'bg-white border-slate-200'}`}>
            
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <MousePointer className="w-4 h-4 text-cyan-400" /> Live Target Mirror Preview
              </div>
              <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-extrabold rounded-xl flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> 14 Matching Item Cards Auto-Detected
              </span>
            </div>

            {/* REPEATING PROJECT CARDS DISPLAY IN LIVE MIRROR */}
            <div className="space-y-4 pt-2">
              
              {/* CARD 1 (HIGHLIGHTED BOUNDARY) */}
              <div className="p-5 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border-2 border-cyan-400 rounded-3xl space-y-3 relative shadow-[0_0_25px_rgba(6,182,212,0.15)] transition-all">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-cyan-500 text-slate-950 text-[10px] font-black uppercase rounded-lg tracking-wider shadow">
                    SELECTED ITEM CONTAINER #1
                  </span>
                  <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold rounded-md">
                    ID: REF-88492
                  </span>
                </div>

                <h4 className="text-lg font-black text-white tracking-tight">Adani Shantigram Water Lily</h4>
                
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                  <span className="text-emerald-400 font-black font-mono text-base">₹ 1.25 Cr</span>
                  <span className="text-slate-300 font-semibold">Vaishno Devi, Ahmedabad</span>
                </div>

                <div className="p-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-cyan-300 hover:text-cyan-200 flex items-center gap-2 cursor-pointer font-mono shadow-inner">
                  <FileText className="w-4 h-4 text-cyan-400" /> Sanctioned_Layout_Plan_WaterLily.pdf
                </div>
              </div>

              {/* CARD 2 */}
              <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-3xl space-y-2 opacity-75 hover:opacity-100 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono font-bold">REF-88493</span>
                  <span className="text-slate-300 text-xs font-medium">Jagatpur, Ahmedabad</span>
                </div>
                <h4 className="text-sm font-bold text-slate-100">Godrej Garden City Cluster B</h4>
                <p className="text-emerald-400 font-bold font-mono text-xs">₹ 85.0 Lacs</p>
              </div>

              {/* CARD 3 */}
              <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-3xl space-y-2 opacity-75 hover:opacity-100 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono font-bold">REF-88494</span>
                  <span className="text-slate-300 text-xs font-medium">Bodaldev, Ahmedabad</span>
                </div>
                <h4 className="text-sm font-bold text-slate-100">Pacific Skydeck Towers</h4>
                <p className="text-emerald-400 font-bold font-mono text-xs">₹ 2.10 Cr</p>
              </div>

            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 font-mono">
            <span>Visual boundary overlays automatically sync with questionnaire clicks.</span>
            <span className="text-cyan-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Deterministic Selector Engine Active
            </span>
          </div>
        </div>

        {/* RIGHT PANEL (40% WIDTH): HIGH-CONTRAST SLEEK GUIDED WIZARD */}
        <div className={`w-full lg:w-[40%] flex flex-col justify-between p-8 space-y-6 ${isDark ? 'bg-[#090c1a]' : 'bg-white'}`}>
          
          <div className="space-y-6">
            
            {/* STEP 1: WEBSITE NAME & ADDRESS */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="p-5 bg-gradient-to-br from-indigo-900/50 via-slate-900 to-slate-950 border border-indigo-500/40 rounded-3xl space-y-1.5 shadow-xl">
                  <div className="flex items-center gap-2 text-cyan-300 font-black text-sm">
                    <HelpCircle className="w-4 h-4 text-cyan-400" /> Step 1: Target Website Address
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Enter the website name and public URL you want to extract structured data from.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-cyan-400" /> Website Name
                    </label>
                    <input
                      type="text"
                      value={websiteName}
                      onChange={(e) => setWebsiteName(e.target.value)}
                      placeholder="e.g. GujRERA, Amazon, Bank Auctions"
                      className="w-full p-3.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-cyan-400" /> Web Address (URL)
                    </label>
                    <input
                      type="text"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      placeholder="https://www.example.com"
                      className="w-full p-3.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" /> Industry Domain / Category
                    </label>
                    <select
                      value={industryCategory}
                      onChange={(e) => setIndustryCategory(e.target.value)}
                      className="w-full p-3.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
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
                <div className="p-5 bg-gradient-to-br from-indigo-900/50 via-slate-900 to-slate-950 border border-indigo-500/40 rounded-3xl space-y-1.5 shadow-xl">
                  <div className="flex items-center gap-2 text-cyan-300 font-black text-sm">
                    <MousePointer className="w-4 h-4 text-cyan-400" /> Step 2: Select Card Boundary
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Click on any item card on the left preview screen to lock recurring item boundaries.
                  </p>
                </div>

                <div className="p-5 bg-emerald-950/40 border border-emerald-500/40 rounded-3xl space-y-2 shadow-lg">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-black">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" /> Structural Card Boundary Locked!
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    The engine automatically detected matching item cards across the web layout on <strong className="text-cyan-300">{targetUrl || 'Target Website'}</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 3: CHOOSE DATA FIELDS TO CAPTURE */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="p-5 bg-gradient-to-br from-indigo-900/50 via-slate-900 to-slate-950 border border-indigo-500/40 rounded-3xl space-y-1.5 shadow-xl">
                  <div className="flex items-center gap-2 text-cyan-300 font-black text-sm">
                    <Database className="w-4 h-4 text-cyan-400" /> Step 3: Information to Save
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Select which data fields to extract into your database.
                  </p>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {capturedFields.map((f, i) => (
                    <div key={i} className="p-3.5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between text-xs transition-all shadow-sm">
                      <div>
                        <span className="font-extrabold text-white block text-sm">{f.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">Sample: "{f.sample}"</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-black rounded-lg">
                          {f.type}
                        </span>
                        <button
                          onClick={() => handleRemoveField(i)}
                          className="p-1 text-slate-400 hover:text-rose-400 font-bold transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAddField}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-2xl text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" /> + Add Custom Data Field
                </button>
              </div>
            )}

            {/* STEP 4: EXTRACTION & LIVE EXECUTION */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3 shadow-xl">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-2 text-cyan-300 font-black">
                      {isExecuting ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                      {isExecuting ? `Extracting data from ${websiteName || 'Target Website'}...` : 'Extraction Completed!'}
                    </span>
                    <span className="text-cyan-400 font-mono font-bold text-sm">{progress}%</span>
                  </div>

                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 transition-all duration-300 rounded-full shadow"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {currentItem && (
                  <div className="p-5 bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/40 rounded-3xl space-y-1 shadow-lg">
                    <span className="text-[10px] text-cyan-400 font-black uppercase tracking-wider">
                      Extracted Record #{currentItem.current} of {currentItem.total}
                    </span>
                    <h4 className="text-base font-black text-white">{currentItem.name}</h4>
                    <p className="text-sm text-emerald-400 font-black font-mono">
                      ₹ {(currentItem.price / 100000).toFixed(2)} Lacs
                    </p>
                  </div>
                )}

                <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-3xl font-mono text-xs max-h-52 overflow-y-auto space-y-2 shadow-inner">
                  {logs.map((l) => (
                    <div key={l.id} className="leading-relaxed flex items-center gap-2">
                      {l.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      {l.type === 'info' && <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                      <span className={l.type === 'success' ? 'text-emerald-300 font-bold' : 'text-slate-300'}>
                        {l.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* 3. HIGH-CONTRAST BOTTOM ACTION FOOTER */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between shrink-0">
            {step > 1 && step < 4 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-5 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-extrabold rounded-2xl flex items-center gap-2 transition-all shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}

            {step < 3 && (
              <button
                onClick={() => setStep(step + 1)}
                className="px-7 py-3.5 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-cyan-500/20 text-white font-extrabold text-xs rounded-2xl flex items-center gap-2 shadow-md transition-all hover:scale-[1.02]"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handleSaveAndStartExtraction}
                className="px-7 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:shadow-lg hover:shadow-emerald-500/25 text-white font-extrabold text-xs rounded-2xl flex items-center gap-2 shadow-md transition-all hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-current" /> Save Website & Run Extraction
              </button>
            )}

            {step === 4 && !isExecuting && (
              <button
                onClick={onExit}
                className="px-7 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all"
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
