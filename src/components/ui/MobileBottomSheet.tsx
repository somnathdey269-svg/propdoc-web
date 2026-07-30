import React, { useState } from 'react';
import type { PropertyProject } from '../../types';
import { ChevronUp, ChevronDown, MapPin, ArrowRight } from 'lucide-react';

interface MobileBottomSheetProps {
  projects: PropertyProject[];
  selectedProject: PropertyProject | null;
  onSelectProject: (project: PropertyProject) => void;
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  projects,
  selectedProject,
  onSelectProject
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-30 flex flex-col bg-slate-900/95 backdrop-blur-2xl border-t border-white/15 rounded-t-3xl shadow-2xl transition-all duration-300">
      {/* Sheet Drag Handle */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-2.5 flex flex-col items-center cursor-pointer border-b border-white/5"
      >
        <div className="w-12 h-1.5 rounded-full bg-white/20" />
        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
          <span>{isExpanded ? 'Collapse Sheet' : 'Swipe Up for Ahmedabad Projects'}</span>
          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </div>
      </div>

      {/* Sheet Content */}
      <div className={`p-4 space-y-3 overflow-y-auto transition-all ${isExpanded ? 'max-h-96' : 'max-h-36'}`}>
        {selectedProject ? (
          <div className="p-3 rounded-2xl bg-white/5 border border-cyan-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">{selectedProject.name}</span>
              <span className="text-xs font-bold text-cyan-400">
                ₹{(selectedProject.priceRangeMinInr / 10000000).toFixed(2)} Cr
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>{selectedProject.locality} • {selectedProject.category}</span>
            </div>
            <button
              onClick={() => onSelectProject(selectedProject)}
              className="w-full py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-md flex items-center justify-center gap-1.5"
            >
              <span>Explore 3D Building & Units</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Featured Ahmedabad Projects</span>
            {projects.slice(0, 3).map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectProject(p)}
                className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between cursor-pointer"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{p.name}</h4>
                  <span className="text-[10px] text-slate-400">{p.locality}</span>
                </div>
                <span className="text-xs font-bold text-cyan-400">₹{(p.priceRangeMinInr / 10000000).toFixed(1)}Cr</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
