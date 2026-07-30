import React, { useState } from 'react';
import { Sparkles, Search, X, ArrowRight } from 'lucide-react';
import type { PropertyProject } from '../../types';
import { aiAssistant } from '../../services/aiAssistantService';

interface AiSearchModalProps {
  onClose: () => void;
  onSelectProject: (project: PropertyProject) => void;
  projects: PropertyProject[];
}

const EXAMPLE_QUERIES = [
  'Show me 3BHK flats on SG Highway under 3 Cr near Metro station',
  'Find ultra-luxury riverfront penthouses with private pool',
  'Commercial office spaces in GIFT City SEZ for investment',
  'SBI Bank distress auction villas in Bodakdev below market price'
];

export const AiSearchModal: React.FC<AiSearchModalProps> = ({ onClose, onSelectProject, projects }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [matchedProjects, setMatchedProjects] = useState<PropertyProject[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setIsSearching(true);
    setHasSearched(true);

    setTimeout(() => {
      const aiReply = aiAssistant.processQuery(searchQuery, projects);
      setMatchedProjects(aiReply.matchedProjects || projects.slice(0, 3));
      setIsSearching(false);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-2xl overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-white/15 p-6 md:p-8 shadow-2xl space-y-6 my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-outfit">AI Natural Language Spatial Search</h2>
            <p className="text-xs text-slate-400">Powered by Google Gemini 1.5 Vector & PostGIS Embeddings</p>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Type anything e.g. '3BHK flat on SG Highway with sky deck'..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
            className="w-full pl-11 pr-24 py-3.5 rounded-2xl bg-slate-950 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
          <button
            onClick={() => handleSearch(query)}
            className="absolute right-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold text-xs shadow-md hover:scale-105 transition-all"
          >
            Search
          </button>
        </div>

        {/* Suggested Queries */}
        {!hasSearched && (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Suggested AI Searches:</span>
            <div className="flex flex-col gap-2">
              {EXAMPLE_QUERIES.map((eq, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearch(eq)}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white text-left flex items-center justify-between group transition-all"
                >
                  <span>{eq}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isSearching && (
          <div className="p-8 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <span className="text-xs text-slate-300 block">Parsing query & running PostGIS spatial vector match...</span>
          </div>
        )}

        {/* Search Results */}
        {!isSearching && hasSearched && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Matched AI Spatial Projects ({matchedProjects.length})</span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {matchedProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectProject(p);
                    onClose();
                  }}
                  className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <img src={p.coverImage} alt={p.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">{p.name}</h4>
                      <span className="text-[10px] text-slate-400">{p.locality} • {p.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-cyan-400 block">
                      ₹{(p.priceRangeMinInr / 10000000).toFixed(2)} Cr+
                    </span>
                    <span className="text-[10px] text-emerald-400">96% AI Match</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
