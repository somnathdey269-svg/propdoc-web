import React, { useState, useEffect } from 'react';
import { Globe, Shield, DollarSign, Plus, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AddWebsiteModal from './AddWebsiteModal';

interface WebsiteConfig {
  id?: string;
  portal_name: string;
  display_name: string;
  source_role: 'PRIMARY' | 'SECONDARY';
  search_url_template: string;
  target_cities: string[];
  is_active: boolean;
}

const DEFAULT_WEBSITES: WebsiteConfig[] = [
  {
    portal_name: 'gujrera',
    display_name: 'GujRERA Gujarat Registry',
    source_role: 'PRIMARY',
    search_url_template: 'https://gujrera.gujarat.gov.in/projectSearch.do',
    target_cities: ['Ahmedabad', 'Gandhinagar'],
    is_active: true,
  },
  {
    portal_name: '99acres',
    display_name: '99acres Real Estate',
    source_role: 'SECONDARY',
    search_url_template: 'https://www.99acres.com/api/v2/search/property/in/{city}',
    target_cities: ['Ahmedabad', 'Gandhinagar'],
    is_active: true,
  },
  {
    portal_name: 'magicbricks',
    display_name: 'MagicBricks Marketplace',
    source_role: 'SECONDARY',
    search_url_template: 'https://www.magicbricks.com/new-projects-in-{city}',
    target_cities: ['Ahmedabad', 'Gandhinagar'],
    is_active: true,
  },
  {
    portal_name: 'squareyards',
    display_name: 'SquareYards Property',
    source_role: 'SECONDARY',
    search_url_template: 'https://www.squareyards.com/new-projects-in-{city}',
    target_cities: ['Ahmedabad', 'Gandhinagar'],
    is_active: true,
  },
];

export const WebsiteSourcesManager: React.FC = () => {
  const [websites, setWebsites] = useState<WebsiteConfig[]>(DEFAULT_WEBSITES);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      const { data } = await supabase.from('scraper_configs').select('*');
      if (data && data.length > 0) {
        setWebsites(data as WebsiteConfig[]);
      }
    } catch (e) {
      // Fallback default
    }
  };

  const primaryWebsites = websites.filter((w) => w.source_role === 'PRIMARY');
  const secondaryWebsites = websites.filter((w) => w.source_role === 'SECONDARY');

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-400" /> Website Source Manager
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Add or edit any target website. Primary sources create master project records, while Secondary sources match marketplace prices.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:opacity-90 rounded-xl text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" /> ➕ Add New Website Source
          </button>
        </div>
      </div>

      {/* Primary & Secondary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PRIMARY SOURCES BOX */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl">
                <Shield className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">PRIMARY SOURCES (Official Registries)</h3>
                <p className="text-[11px] text-slate-400">Creates canonical master projects & RERA registration IDs.</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 rounded-full text-xs font-bold">
              {primaryWebsites.length} Sources
            </span>
          </div>

          <div className="space-y-3">
            {primaryWebsites.map((w) => (
              <div
                key={w.portal_name}
                className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-white">{w.display_name}</p>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[9px] font-bold">ACTIVE</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-sm">{w.search_url_template}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-400 font-medium">Cities:</span>
                    {(w.target_cities || ['Ahmedabad', 'Gandhinagar']).map((c) => (
                      <span key={c} className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 rounded text-[9px] font-semibold">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <a
                  href={w.search_url_template}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* SECONDARY SOURCES BOX */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-xl">
                <DollarSign className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">SECONDARY SOURCES (Listing Portals)</h3>
                <p className="text-[11px] text-slate-400">Cross-matches & compares live pricing against Primary projects.</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-bold">
              {secondaryWebsites.length} Sources
            </span>
          </div>

          <div className="space-y-3">
            {secondaryWebsites.map((w) => (
              <div
                key={w.portal_name}
                className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-white">{w.display_name}</p>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[9px] font-bold">ACTIVE</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-sm">{w.search_url_template}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-400 font-medium">Cities:</span>
                    {(w.target_cities || ['Ahmedabad', 'Gandhinagar']).map((c) => (
                      <span key={c} className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 rounded text-[9px] font-semibold">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <a
                  href={w.search_url_template}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Website Modal */}
      {showAddModal && (
        <AddWebsiteModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => fetchWebsites()}
        />
      )}
    </div>
  );
};

export default WebsiteSourcesManager;
