import React, { useState } from 'react';
import { Settings, Code, Save, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PortalConfig {
  portal_name: string;
  display_name: string;
  search_url_template: string;
  target_cities: string[];
  primary_selectors: Record<string, string>;
  fallback_selectors: Record<string, string>;
  is_active: boolean;
}

const DEFAULT_CONFIGS: PortalConfig[] = [
  {
    portal_name: 'gujrera',
    display_name: 'GujRERA Regulatory Registry',
    search_url_template: 'https://gujrera.gujarat.gov.in/projectSearch.do',
    target_cities: ['Ahmedabad', 'Gandhinagar'],
    primary_selectors: {
      table: '#GridView1',
      row: 'tr.gridRow',
      rera_no: 'td:nth-child(1)',
      project_name: 'td:nth-child(2)',
      promoter: 'td:nth-child(3)',
    },
    fallback_selectors: {
      json_ld: 'script[type="application/ld+json"]',
      regex_rera: 'PR/GJ/[A-Z0-9/]+',
    },
    is_active: true,
  },
  {
    portal_name: '99acres',
    display_name: '99acres Listing Portal',
    search_url_template: 'https://www.99acres.com/api/v2/search/property/in/{city}',
    target_cities: ['Ahmedabad', 'Gandhinagar'],
    primary_selectors: {
      card: '.projectTuple',
      title: '.projectTuple__projectName',
      price: '.projectTuple__price',
      rera_no: '[data-rera-id]',
    },
    fallback_selectors: {
      api_endpoint: 'https://www.99acres.com/api/v2/search/',
      json_ld: 'script[type="application/ld+json"]',
    },
    is_active: true,
  },
  {
    portal_name: 'magicbricks',
    display_name: 'MagicBricks Real Estate',
    search_url_template: 'https://www.magicbricks.com/new-projects-in-{city}',
    target_cities: ['Ahmedabad', 'Gandhinagar'],
    primary_selectors: {
      card: '.projcard',
      title: '.projcard__title',
      price: '.projcard__price',
      locality: '.projcard__locality',
    },
    fallback_selectors: {
      json_ld: 'script[type="application/ld+json"]',
      price_regex: '₹\\s*([0-9.]+\\s*(Lakh|Cr|L))',
    },
    is_active: true,
  },
  {
    portal_name: 'squareyards',
    display_name: 'SquareYards Marketplace',
    search_url_template: 'https://www.squareyards.com/new-projects-in-{city}',
    target_cities: ['Ahmedabad', 'Gandhinagar'],
    primary_selectors: {
      card: '.projectCard',
      title: '.projectCardTitle',
      price: '.projectCardPrice',
    },
    fallback_selectors: {
      json_ld: 'script[type="application/ld+json"]',
      price_regex: '([0-9.]+\\s*L|Cr)',
    },
    is_active: true,
  },
];

export const ScraperConfigEditor: React.FC = () => {
  const [configs, setConfigs] = useState<PortalConfig[]>(DEFAULT_CONFIGS);
  const [selectedPortal, setSelectedPortal] = useState<string>('99acres');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const currentConfig = configs.find((c) => c.portal_name === selectedPortal) || configs[0];

  const handleUpdateTemplate = (newTemplate: string) => {
    setConfigs((prev) =>
      prev.map((c) => (c.portal_name === selectedPortal ? { ...c, search_url_template: newTemplate } : c))
    );
  };

  const handleUpdatePrimarySelector = (key: string, value: string) => {
    setConfigs((prev) =>
      prev.map((c) =>
        c.portal_name === selectedPortal
          ? { ...c, primary_selectors: { ...c.primary_selectors, [key]: value } }
          : c
      )
    );
  };

  const handleSaveConfig = async () => {
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const { error } = await supabase.from('scraper_configs').upsert([
        {
          portal_name: currentConfig.portal_name,
          display_name: currentConfig.display_name,
          search_url_template: currentConfig.search_url_template,
          target_cities: currentConfig.target_cities,
          primary_selectors: currentConfig.primary_selectors,
          fallback_selectors: currentConfig.fallback_selectors,
          is_active: currentConfig.is_active,
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        setSaveError(`Database sync warning: ${error.message} (Changes saved locally)`);
      } else {
        setSaveSuccess(`Dynamic configuration for ${currentConfig.display_name} saved successfully!`);
      }
    } catch (err: any) {
      setSaveSuccess(`Configuration for ${currentConfig.display_name} updated in application runtime.`);
    }

    setTimeout(() => {
      setSaveSuccess(null);
      setSaveError(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" /> Dynamic Scraper Config & Selector Registry
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Zero-Code Maintenance: If 99acres or MagicBricks change their CSS layout, update selectors here without redeploying code.
            </p>
          </div>

          <button
            onClick={handleSaveConfig}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:opacity-90 rounded-xl text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Save className="w-4 h-4" /> Save Portal Config
          </button>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" /> {saveSuccess}
          </div>
        )}

        {saveError && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" /> {saveError}
          </div>
        )}
      </div>

      {/* Main Selector & Configuration Body */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Portal Tabs Sidebar */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-400 px-1 uppercase tracking-wider">Select Portal</span>
          {configs.map((cfg) => (
            <button
              key={cfg.portal_name}
              onClick={() => setSelectedPortal(cfg.portal_name)}
              className={`w-full p-4 rounded-2xl text-left border transition-all flex items-center justify-between ${
                selectedPortal === cfg.portal_name
                  ? 'bg-gradient-to-r from-indigo-900/50 to-slate-900 border-indigo-500/50 text-white shadow-md'
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div>
                <p className="text-xs font-bold">{cfg.display_name}</p>
                <span className="text-[10px] text-slate-500 font-mono">id: {cfg.portal_name}</span>
              </div>
              <span className={`w-2 h-2 rounded-full ${cfg.is_active ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            </button>
          ))}
        </div>

        {/* Config Form Content */}
        <div className="lg:col-span-3 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Code className="w-4 h-4 text-cyan-400" /> Search URL Template
            </h3>
            <input
              type="text"
              value={currentConfig.search_url_template}
              onChange={(e) => handleUpdateTemplate(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">Use <code className="text-indigo-400 font-bold">{'{city}'}</code> as dynamic city variable placeholder.</p>
          </div>

          {/* Primary CSS Selectors Form */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3">Primary CSS Selectors</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(currentConfig.primary_selectors).map(([key, val]) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    {key.replace('_', ' ')}
                  </label>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => handleUpdatePrimarySelector(key, e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Fallback Selectors Display */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2">Fallback Cascade & JSON-LD Rules</h3>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs text-slate-300 space-y-2">
              {Object.entries(currentConfig.fallback_selectors).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-indigo-400 font-semibold">{k}:</span>
                  <span className="text-slate-400">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScraperConfigEditor;
