import React, { useEffect, useRef } from 'react';
import { X, Navigation, ExternalLink, ShieldCheck } from 'lucide-react';
import type { PropertyProject } from '../../types';

interface StreetViewModalProps {
  project: PropertyProject;
  onClose: () => void;
}

export const StreetViewModal: React.FC<StreetViewModalProps> = ({ project, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !(window as any).google?.maps) return;

    const google = (window as any).google;
    const panorama = new google.maps.StreetViewPanorama(containerRef.current, {
      position: { lat: project.coordinates.lat, lng: project.coordinates.lng },
      pov: { heading: 160, pitch: 0 },
      zoom: 1,
      addressControl: true,
      fullscreenControl: false,
      motionTracking: true,
      motionTrackingControl: true,
    });

    panorama.setVisible(true);
  }, [project]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-2xl animate-in fade-in">
      <div className="relative w-full max-w-4xl h-[75vh] rounded-3xl bg-slate-900 border border-white/20 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-white/10 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-outfit">Google Street View 360° Panorama</h3>
              <p className="text-[11px] text-slate-400">{project.name} • {project.locality}, {project.city}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Street View Container */}
        <div ref={containerRef} className="flex-1 w-full h-full bg-slate-950" />

        {/* Footer info badge */}
        <div className="p-3 bg-slate-950/90 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            Live Google Maps Grounding • Real Street View Panorama
          </span>
          <a
            href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${project.coordinates.lat},${project.coordinates.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-500/30 flex items-center gap-1 transition-all"
          >
            <span>Open Full Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
