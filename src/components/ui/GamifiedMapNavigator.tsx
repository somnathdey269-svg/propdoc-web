import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Plus, Minus, Compass } from 'lucide-react';
import type { HeaderTheme } from './HeaderNav';

interface GamifiedMapNavigatorProps {
  onPan: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  headerTheme: HeaderTheme;
}

export const GamifiedMapNavigator: React.FC<GamifiedMapNavigatorProps> = ({
  onPan,
  onZoomIn,
  onZoomOut,
  headerTheme,
}) => {
  const getThemeAccents = () => {
    switch (headerTheme) {
      case 'emerald':
        return {
          dpadBorder: 'border-emerald-500/40 shadow-emerald-950/80',
          logoBg: 'from-emerald-400 via-teal-300 to-cyan-400',
          arrowHover: 'hover:bg-emerald-500/20 text-emerald-400',
          btnBorder: 'border-emerald-500/30'
        };
      case 'amber':
        return {
          dpadBorder: 'border-amber-500/40 shadow-amber-950/80',
          logoBg: 'from-amber-400 via-yellow-300 to-orange-400',
          arrowHover: 'hover:bg-amber-500/20 text-amber-400',
          btnBorder: 'border-amber-500/30'
        };
      case 'royal':
        return {
          dpadBorder: 'border-indigo-500/40 shadow-indigo-950/80',
          logoBg: 'from-indigo-400 via-purple-300 to-pink-400',
          arrowHover: 'hover:bg-indigo-500/20 text-indigo-400',
          btnBorder: 'border-indigo-500/30'
        };
      default: // midnight
        return {
          dpadBorder: 'border-cyan-500/40 shadow-cyan-950/80',
          logoBg: 'from-cyan-400 via-teal-300 to-emerald-400',
          arrowHover: 'hover:bg-cyan-500/20 text-cyan-400',
          btnBorder: 'border-cyan-500/30'
        };
    }
  };

  const theme = getThemeAccents();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 pointer-events-auto select-none animate-in fade-in slide-in-from-bottom-4">
      {/* GAMIFIED DPAD COMPASS CONTROLLER WITH THEME MATCHING */}
      <div className={`relative w-28 h-28 rounded-full bg-slate-950/95 backdrop-blur-3xl border-2 ${theme.dpadBorder} shadow-2xl flex items-center justify-center p-1 transition-all duration-300`}>
        
        {/* Compass Center Logo */}
        <div className={`absolute w-8 h-8 rounded-full bg-gradient-to-tr ${theme.logoBg} flex items-center justify-center text-slate-950 font-black text-xs shadow-lg z-10 pointer-events-none transition-all duration-300`}>
          <Compass className="w-4 h-4 text-slate-950 animate-spin-slow" />
        </div>

        {/* ⬆️ NORTH */}
        <button
          onClick={() => onPan('up')}
          title="Pan North"
          className={`absolute top-1 left-1/2 -translate-x-1/2 p-1.5 rounded-t-xl bg-white/5 ${theme.arrowHover} hover:text-white transition-all active:scale-90`}
        >
          <ChevronUp className="w-4 h-4 stroke-[3]" />
        </button>

        {/* ⬇️ SOUTH */}
        <button
          onClick={() => onPan('down')}
          title="Pan South"
          className={`absolute bottom-1 left-1/2 -translate-x-1/2 p-1.5 rounded-b-xl bg-white/5 ${theme.arrowHover} hover:text-white transition-all active:scale-90`}
        >
          <ChevronDown className="w-4 h-4 stroke-[3]" />
        </button>

        {/* ⬅️ WEST */}
        <button
          onClick={() => onPan('left')}
          title="Pan West"
          className={`absolute left-1 top-1/2 -translate-y-1/2 p-1.5 rounded-l-xl bg-white/5 ${theme.arrowHover} hover:text-white transition-all active:scale-90`}
        >
          <ChevronLeft className="w-4 h-4 stroke-[3]" />
        </button>

        {/* ➡️ EAST */}
        <button
          onClick={() => onPan('right')}
          title="Pan East"
          className={`absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-r-xl bg-white/5 ${theme.arrowHover} hover:text-white transition-all active:scale-90`}
        >
          <ChevronRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>

      {/* ZOOM IN / OUT PILOT CONTROL */}
      <div className={`flex flex-col gap-1 p-1 rounded-2xl bg-slate-950/95 backdrop-blur-3xl border ${theme.btnBorder} shadow-2xl transition-all duration-300`}>
        <button
          onClick={onZoomIn}
          title="Zoom In (+)"
          className={`p-2 rounded-xl bg-white/5 ${theme.arrowHover} hover:text-white transition-all active:scale-90`}
        >
          <Plus className="w-4 h-4 stroke-[3]" />
        </button>
        <div className="w-full h-[1px] bg-white/15" />
        <button
          onClick={onZoomOut}
          title="Zoom Out (-)"
          className={`p-2 rounded-xl bg-white/5 ${theme.arrowHover} hover:text-white transition-all active:scale-90`}
        >
          <Minus className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
