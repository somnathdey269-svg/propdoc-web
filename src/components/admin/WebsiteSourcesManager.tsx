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

interface WebsiteSourcesManagerProps {
  isDark?: boolean;
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

export const WebsiteSourcesManager: React.FC<WebsiteSourcesManagerProps> = ({ isDark = true }) => {
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

  // Dynamic Theme Helper Classes
  const cardBg = isDark
    ? 'bg-slate-900/60 border-slate-800'
    : 'bg-white border-slate-200 shadow-lg shadow-slate-200/50';

  const cardInnerBg = isDark
    ? 'bg-slate-950/80 border-slate-800'
    : 'bg-slate-50 border-slate-200';

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-600';

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className={`border rounded-3xl p-6 backdrop-blur-xl ${cardBg}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className={`text-xl font-bold flex items-center gap-2 ${textPrimary}`}>
              <Globe className="w-5 h-5 text-indigo-500" /> Website Source Manager
            </h2>
            <p className={`text-xs mt-1 ${textSecondary}`}>
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
        <div className={`border rounded-3xl p-6 backdrop-blur-xl space-y-4 ${cardBg}`}>
          <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-xl">
                <Shield className="w-4 h-4" />
              </span>
              <div>
                <h3 className={`text-base font-bold ${textPrimary}`}>PRIMARY SOURCES (Official Registries)</h3>
                <p className={`text-[11px] ${textSecondary}`}>Creates canonical master projects & RERA registration IDs.</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-500 rounded-full text-xs font-bold">
              {primaryWebsites.length} Sources
            </span>
          </div>

          <div className="space-y-3">
            {primaryWebsites.map((w) => (
              <div
                key={w.portal_name}
                className={`p-4 border rounded-2xl flex items-center justify-between gap-4 ${cardInnerBg}`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`text-xs font-bold ${textPrimary}`}>{w.display_name}</p>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded text-[9px] font-bold">ACTIVE</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-sm">{w.search_url_template}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className={`text-[10px] font-medium ${textSecondary}`}>Cities:</span>
                    {(w.target_cities || ['Ahmedabad', 'Gandhinagar']).map((c) => (
                      <span key={c} className={`px-2 py-0.5 border rounded text-[9px] font-semibold ${
                        isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
                      }`}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <a
                  href={w.search_url_template}
                  target="_blank"
                  rel="noreferrer"
                  className={`p-2 border rounded-xl transition-colors shrink-0 ${
                    isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* SECONDARY SOURCES BOX */}
        <div className={`border rounded-3xl p-6 backdrop-blur-xl space-y-4 ${cardBg}`}>
          <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-500 rounded-xl">
                <DollarSign className="w-4 h-4" />
              </span>
              <div>
                <h3 className={`text-base font-bold ${textPrimary}`}>SECONDARY SOURCES (Listing Portals)</h3>
                <p className={`text-[11px] ${textSecondary}`}>Cross-matches & compares live pricing against Primary projects.</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-500 rounded-full text-xs font-bold">
              {secondaryWebsites.length} Sources
            </span>
          </div>

          <div className="space-y-3">
            {secondaryWebsites.map((w) => (
              <div
                key={w.portal_name}
                className={`p-4 border rounded-2xl flex items-center justify-between gap-4 ${cardInnerBg}`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`text-xs font-bold ${textPrimary}`}>{w.display_name}</p>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded text-[9px] font-bold">ACTIVE</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-sm">{w.search_url_template}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className={`text-[10px] font-medium ${textSecondary}`}>Cities:</span>
                    {(w.target_cities || ['Ahmedabad', 'Gandhinagar']).map((c) => (
                      <span key={c} className={`px-2 py-0.5 border rounded text-[9px] font-semibold ${
                        isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
                      }`}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <a
                  href={w.search_url_template}
                  target="_blank"
                  rel="noreferrer"
                  className={`p-2 border rounded-xl transition-colors shrink-0 ${
                    isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
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
          isDark={isDark}
        />
      )}
    </div>
  );
};

export default WebsiteSourcesManager;
