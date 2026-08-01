import React, { useState, useRef } from 'react';
import { 
  X, 
  Play, 
  Square, 
  MapPin, 
  Zap, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Eye,
  Database,
  Globe,
  Plus
} from 'lucide-react';
import { executeAcquisitionRun, type UniversalBlueprint } from '../../../scripts/scraper-microservice/universalDataAcquisitionEngine';

interface SimpleWizardModalProps {
  portalName: string;
  portalDisplayName: string;
  onClose: () => void;
  onJobComplete?: () => void;
}

export const ScraperWizardModal: React.FC<SimpleWizardModalProps> = ({
  portalName,
  portalDisplayName,
  onClose,
  onJobComplete,
}) => {
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [targetUrl, setTargetUrl] = useState<string>(
    portalName === '99acres' ? 'https://www.99acres.com' :
    portalName === 'magicbricks' ? 'https://www.magicbricks.com' :
    portalName === 'squareyards' ? 'https://www.squareyards.com' :
    'https://gujrera.gujarat.gov.in'
  );
  const [locationScope, setLocationScope] = useState<string>('Ahmedabad');

  const [capturedFields, setCapturedFields] = useState<Array<{ name: string; type: string }>>([
    { name: 'Project Title', type: 'TEXT' },
    { name: 'Price', type: 'CURRENCY_INR' },
    { name: 'RERA Registration ID', type: 'TEXT' },
    { name: 'Document PDF', type: 'FILE_BLOB' }
  ]);

  // Execution State
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentItem, setCurrentItem] = useState<{
    name: string;
    locality?: string;
    price?: number;
    current: number;
    total: number;
  } | null>(null);

  const [logs, setLogs] = useState<{ id: string; message: string; type: 'info' | 'success' | 'error' }[]>([]);
  const cancelSignalRef = useRef<boolean>(false);

  const handleAddField = () => {
    const names = ['Total Units', 'Developer Name', 'Locality', 'Contact Phone'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    setCapturedFields([...capturedFields, { name: randomName, type: 'TEXT' }]);
  };

  const handleStartExtraction = async () => {
    setIsExecuting(true);
    cancelSignalRef.current = false;
    setProgress(5);
    setWizardStep(3);

    setLogs([
      { id: Date.now().toString(), message: `🚀 Starting data extraction for ${portalDisplayName}...`, type: 'info' },
      { id: (Date.now() + 1).toString(), message: `Connecting to ${targetUrl} (Scope: ${locationScope})...`, type: 'info' },
      { id: (Date.now() + 2).toString(), message: `Extraction pipeline initialized.`, type: 'success' }
    ]);

    const sampleBlueprint: UniversalBlueprint = {
      target_id: portalName,
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
        targetId: portalName,
        blueprint: sampleBlueprint,
        maxItems: 15,
        shouldStop: () => cancelSignalRef.current,
        onRecordExtracted: (rec) => {
          const pct = Math.round((rec.current / rec.total) * 100);
          setProgress(pct);
          setCurrentItem({
            name: rec.payload.item_title || rec.payload.title || 'Extracted Project Record',
            locality: locationScope,
            price: rec.payload.price || 8500000,
            current: rec.current,
            total: rec.total,
          });

          setLogs((prev) => [
            {
              id: Date.now().toString(),
              message: `[${rec.current}/${rec.total}] Extracted: ${rec.payload.item_title || 'Item Record'} (${locationScope})`,
              type: 'success',
            },
            ...prev,
          ]);
        }
      });

      if (!cancelSignalRef.current) {
        setProgress(100);
        setLogs((prev) => [
          { id: Date.now().toString(), message: `🎉 Extraction completed! All records saved to Data Vault.`, type: 'success' },
          ...prev,
        ]);
        if (onJobComplete) onJobComplete();
      }
    } catch (e: any) {
      setLogs((prev) => [
        { id: Date.now().toString(), message: `Extraction Error: ${e.message}`, type: 'error' },
        ...prev,
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleStop = () => {
    cancelSignalRef.current = true;
    setIsExecuting(false);
    setLogs((prev) => [
      { id: Date.now().toString(), message: `🛑 Extraction stopped by admin.`, type: 'error' },
      ...prev,
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 my-auto text-white">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-cyan-500 rounded-2xl text-white shadow-md">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{portalDisplayName}</h2>
              <p className="text-xs text-slate-400">Website Data Setup & Extraction Assistant</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1 & STEP 2: SETUP QUESTIONNAIRE */}
        {wizardStep < 3 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* LEFT: VISUAL PREVIEW */}
            <div className="md:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                  <Globe className="w-3.5 h-3.5" /> Website Preview
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[150px]">{targetUrl}</span>
              </div>

              <div className="p-4 bg-slate-900 border border-indigo-500/20 rounded-xl space-y-3">
                <div className="flex items-center gap-2 p-2 bg-slate-950 rounded-lg text-xs">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-slate-400">Location Scope:</span>
                  <span className="text-white font-bold">{locationScope}</span>
                </div>

                <div className="p-3 bg-indigo-950/40 border border-indigo-500/40 rounded-xl space-y-1">
                  <h5 className="font-bold text-xs text-white">Adani Shantigram Water Lily</h5>
                  <p className="text-emerald-400 font-bold text-xs">₹ 1.25 Cr • Vaishno Devi, Ahmedabad</p>
                  <p className="text-[10px] text-cyan-300">📄 Sanctioned_Plan_WaterLily.pdf</p>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 border-t border-slate-800 pt-2">
                The engine will extract items matching this layout automatically.
              </p>
            </div>

            {/* RIGHT: QUESTIONNAIRE */}
            <div className="md:col-span-6 space-y-4">
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div className="p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-xl space-y-1">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-cyan-400" /> Step 1: Target Website Address
                    </h4>
                    <p className="text-[11px] text-slate-400">Confirm the website web address and search location.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Website URL
                    </label>
                    <input
                      type="text"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Target Location / City Scope
                    </label>
                    <input
                      type="text"
                      value={locationScope}
                      onChange={(e) => setLocationScope(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div className="p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-xl space-y-1">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-cyan-400" /> Step 2: Information to Capture
                    </h4>
                    <p className="text-[11px] text-slate-400">Data fields that will be saved into your database.</p>
                  </div>

                  <div className="space-y-2 max-h-44 overflow-y-auto">
                    {capturedFields.map((f, i) => (
                      <div key={i} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">{f.name}</span>
                        <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded">
                          {f.type}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleAddField}
                    className="w-full py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-cyan-400 flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Field
                  </button>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                {wizardStep > 1 ? (
                  <button
                    onClick={() => setWizardStep(wizardStep - 1)}
                    className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300"
                  >
                    Back
                  </button>
                ) : <div />}

                {wizardStep === 1 ? (
                  <button
                    onClick={() => setWizardStep(2)}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    Next Step <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleStartExtraction}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 rounded-xl text-white font-bold text-xs flex items-center gap-2 shadow-lg"
                  >
                    <Play className="w-4 h-4 fill-current" /> Run Extraction Now
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: LIVE EXTRACTION PROGRESS */}
        {wizardStep === 3 && (
          <div className="space-y-5">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-2 text-indigo-300">
                  {isExecuting ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  {isExecuting ? `Extracting data from ${portalDisplayName}...` : 'Extraction Completed!'}
                </span>
                <span className="text-cyan-400">{progress}%</span>
              </div>

              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {isExecuting && (
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={handleStop}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Square className="w-3 h-3 fill-current" /> Stop Extraction
                  </button>
                </div>
              )}
            </div>

            {currentItem && (
              <div className="p-4 bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl space-y-1">
                <span className="text-[10px] text-cyan-400 font-bold uppercase">
                  Item #{currentItem.current} of {currentItem.total}
                </span>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-400" /> {currentItem.name}
                </h4>
                <p className="text-xs text-emerald-400 font-bold font-mono">
                  ₹ {(currentItem.price ? currentItem.price / 100000 : 0).toFixed(2)} Lacs • {locationScope}
                </p>
              </div>
            )}

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs max-h-48 overflow-y-auto space-y-1.5">
              {logs.map((l) => (
                <div key={l.id} className="leading-relaxed flex items-center gap-2">
                  {l.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  {l.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                  {l.type === 'info' && <Eye className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                  <span className={l.type === 'success' ? 'text-emerald-300' : l.type === 'error' ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                    {l.message}
                  </span>
                </div>
              ))}
            </div>

            {!isExecuting && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow"
                >
                  Close & View Extracted Results
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ScraperWizardModal;
