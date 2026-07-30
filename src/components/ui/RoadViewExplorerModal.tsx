import React, { useState } from 'react';
import type { PropertyProject, NearbyPlace } from '../../types';
import { 
  X, Navigation, Compass, MapPin, School, Hospital, Train, ShoppingBag, 
  Trees
} from 'lucide-react';

interface RoadViewExplorerModalProps {
  project: PropertyProject;
  onClose: () => void;
}

export const RoadViewExplorerModal: React.FC<RoadViewExplorerModalProps> = ({ project, onClose }) => {
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace>(project.nearbyPlaces[0]);
  const [travelMode, setTravelMode] = useState<'drive' | 'transit' | 'walk'>('drive');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'School': return <School className="w-4 h-4 text-cyan-400" />;
      case 'Hospital': return <Hospital className="w-4 h-4 text-rose-400" />;
      case 'Metro': return <Train className="w-4 h-4 text-emerald-400" />;
      case 'Shopping': return <ShoppingBag className="w-4 h-4 text-purple-400" />;
      case 'Riverfront': return <Trees className="w-4 h-4 text-teal-400" />;
      default: return <MapPin className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/90 backdrop-blur-3xl overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl bg-slate-900 border border-white/20 overflow-hidden shadow-2xl space-y-4 p-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950 font-bold">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-outfit">3D Road View & Neighborhood Infrastructure</h2>
              <span className="text-xs text-slate-400">Street-level commute corridors & nearby place vectors for {project.name}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3D Road View Simulated Ground POV Canvas */}
        <div className="relative w-full h-80 md:h-96 rounded-2xl overflow-hidden border border-white/15 shadow-2xl">
          {/* Street Level Viewport Image */}
          <img
            src="https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=2000&q=80"
            alt="3D Street View"
            className="w-full h-full object-cover"
          />

          {/* Dark Glass Overlay with Dynamic Distance Lines */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-6 flex flex-col justify-between pointer-events-none">
            {/* Top Road HUD Badge */}
            <div className="flex items-center justify-between">
              <div className="px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-xl border border-cyan-500/40 text-xs font-semibold text-cyan-300 flex items-center gap-2">
                <Compass className="w-4 h-4 animate-spin text-cyan-400" />
                <span>3D Street Level POV • SG Highway / AUDA Road</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Traffic Flow: Smooth (12 mins to SG Ring Road)</span>
              </div>
            </div>

            {/* Selected Place Distance Marker Overlay */}
            <div className="pointer-events-auto p-4 rounded-2xl bg-slate-950/90 backdrop-blur-2xl border border-white/20 max-w-sm space-y-2">
              <div className="flex items-center gap-2">
                {getCategoryIcon(selectedPlace.category)}
                <span className="text-sm font-bold text-white">{selectedPlace.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300 pt-1 border-t border-white/10">
                <span>Distance: <strong className="text-cyan-400">{selectedPlace.distanceKm} km</strong></span>
                <span>Estimated Time: <strong className="text-emerald-400">{selectedPlace.timeMins} mins</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Places Grid & Travel Mode Selector */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Nearby Landmark / Infrastructure:</span>

            {/* Travel Mode Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
              <button
                onClick={() => setTravelMode('drive')}
                className={`px-2.5 py-1 rounded-lg transition-all ${travelMode === 'drive' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Drive 🚗
              </button>
              <button
                onClick={() => setTravelMode('transit')}
                className={`px-2.5 py-1 rounded-lg transition-all ${travelMode === 'transit' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Metro 🚇
              </button>
              <button
                onClick={() => setTravelMode('walk')}
                className={`px-2.5 py-1 rounded-lg transition-all ${travelMode === 'walk' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Walk 🚶
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {project.nearbyPlaces.map((place, idx) => {
              const isSelected = selectedPlace.name === place.name;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedPlace(place)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-400 shadow-lg shadow-cyan-500/20'
                      : 'bg-white/5 hover:bg-white/10 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getCategoryIcon(place.category)}
                    <span className="text-xs font-bold text-white truncate">{place.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex justify-between">
                    <span>{place.category}</span>
                    <span className="text-cyan-300 font-bold">{place.distanceKm} km • {place.timeMins} mins</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
