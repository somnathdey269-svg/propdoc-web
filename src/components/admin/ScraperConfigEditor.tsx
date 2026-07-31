import React, { useState } from 'react';
import { Save } from 'lucide-react';

interface ScraperConfigEditorProps {
  theme?: 'dark' | 'light';
}

export const ScraperConfigEditor: React.FC<ScraperConfigEditorProps> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const [selectors, setSelectors] = useState({
    projectName: '.project-title, h1.rera-title',
    developerName: '.promoter-name, .builder-name',
    reraId: '.rera-registration-no, span.rera-id',
    priceRange: '.price-tag, .pricing-range',
    locality: '.locality-name, .project-location',
  });

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-3xl border transition-all ${isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-md'}`}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight">CSS/XPath Selector Configurator</h2>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Fine-tune HTML element extraction rules and DOM transformation patterns.
            </p>
          </div>
          <button className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-all flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Selector Configs
          </button>
        </div>

        <div className="space-y-4">
          {Object.entries(selectors).map(([key, val]) => (
            <div key={key} className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{key}</label>
              <input
                type="text"
                value={val}
                onChange={(e) => setSelectors({ ...selectors, [key]: e.target.value })}
                className={`w-full p-3 rounded-xl font-mono text-xs border focus:outline-none ${isDark ? 'bg-slate-900 border-slate-800 text-cyan-300' : 'bg-white border-slate-300 text-indigo-700'}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScraperConfigEditor;
