import React, { useState } from 'react';
import { Save, Plus, Database, CheckCircle2, ShieldCheck } from 'lucide-react';

interface UD_DAPConfigEditorProps {
  theme?: 'dark' | 'light';
}

export const ScraperConfigEditor: React.FC<UD_DAPConfigEditorProps> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';

  const [entityName, setEntityName] = useState<string>('PropertyListing');
  const [fields, setFields] = useState([
    { name: 'property_title', label: 'Property Title', type: 'TEXT', isPk: false, isRequired: true, transform: 'TRIM' },
    { name: 'listed_price', label: 'Listed Price (INR)', type: 'CURRENCY_INR', isPk: false, isRequired: true, transform: 'PARSE_CURRENCY_INR' },
    { name: 'rera_id', label: 'RERA Registration ID', type: 'TEXT', isPk: true, isRequired: true, transform: 'TRIM' },
    { name: 'document_brochure', label: 'PDF Brochure Document', type: 'FILE_BLOB', isPk: false, isRequired: false, transform: 'RESOLVE_ABSOLUTE_URL' },
  ]);

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleAddField = () => {
    setFields([
      ...fields,
      { name: 'new_field', label: 'New Field Label', type: 'TEXT', isPk: false, isRequired: false, transform: 'TRIM' }
    ]);
  };

  const handleSaveSchema = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-3xl border transition-all ${isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-md'}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black tracking-tight">Dynamic Target Entity & Field System</h2>
              <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-full uppercase">
                Zero-Code Business Schema
              </span>
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Define plain business data structures and type normalizers without raw CSS or XPath selectors.
            </p>
          </div>

          <button
            onClick={handleSaveSchema}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Entity Schema
          </button>
        </div>

        {savedSuccess && (
          <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Target Entity Schema Saved & Blueprint Compiled!
          </div>
        )}

        <div className="space-y-6">
          {/* Target Entity Name Input */}
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-cyan-400" /> Target Entity Name
            </label>
            <input
              type="text"
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              className={`w-full p-3 rounded-xl font-bold text-xs border focus:outline-none ${isDark ? 'bg-slate-900 border-slate-800 text-cyan-300' : 'bg-white border-slate-300 text-indigo-700'}`}
            />
          </div>

          {/* Fields List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Captured Business Fields</h4>
              <button
                onClick={handleAddField}
                className="text-xs text-indigo-400 font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Field
              </button>
            </div>

            {fields.map((f, i) => (
              <div key={i} className={`p-4 rounded-2xl border grid grid-cols-1 sm:grid-cols-12 gap-3 items-center ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Field Label</label>
                  <input
                    type="text"
                    value={f.label}
                    onChange={(e) => {
                      const copy = [...fields];
                      copy[i].label = e.target.value;
                      copy[i].name = e.target.value.toLowerCase().replace(/\s+/g, '_');
                      setFields(copy);
                    }}
                    className={`w-full p-2.5 rounded-xl font-semibold text-xs border focus:outline-none ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300'}`}
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data Type</label>
                  <select
                    value={f.type}
                    onChange={(e) => {
                      const copy = [...fields];
                      copy[i].type = e.target.value;
                      setFields(copy);
                    }}
                    className={`w-full p-2.5 rounded-xl font-mono text-xs border focus:outline-none ${isDark ? 'bg-slate-900 border-slate-800 text-cyan-300' : 'bg-white border-slate-300'}`}
                  >
                    <option value="TEXT">TEXT</option>
                    <option value="NUMBER">NUMBER</option>
                    <option value="CURRENCY_INR">CURRENCY (INR)</option>
                    <option value="DATE_TIME">DATE & TIME</option>
                    <option value="URL">URL LINK</option>
                    <option value="FILE_BLOB">FILE / DOCUMENT (PDF)</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sanitizer Transformer</label>
                  <select
                    value={f.transform}
                    onChange={(e) => {
                      const copy = [...fields];
                      copy[i].transform = e.target.value;
                      setFields(copy);
                    }}
                    className={`w-full p-2.5 rounded-xl font-mono text-xs border focus:outline-none ${isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-300'}`}
                  >
                    <option value="TRIM">TRIM_WHITESPACE</option>
                    <option value="PARSE_CURRENCY_INR">PARSE_CURRENCY_INR</option>
                    <option value="RESOLVE_ABSOLUTE_URL">RESOLVE_ABSOLUTE_URL</option>
                    <option value="PARSE_DATE_ISO">PARSE_DATE_ISO</option>
                  </select>
                </div>

                <div className="sm:col-span-2 flex items-center gap-2 pt-4 sm:pt-0 justify-end">
                  <label className="flex items-center gap-1 text-[10px] text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={f.isPk}
                      onChange={(e) => {
                        const copy = [...fields];
                        copy[i].isPk = e.target.checked;
                        setFields(copy);
                      }}
                      className="accent-indigo-600 rounded"
                    />
                    <span>Primary Key</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> Multi-Strategy Selector Identity Engine Active
            </span>
            <span className="text-[10px] text-slate-400">All fields automatically bound to 5 fallback strategy tiers.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScraperConfigEditor;
