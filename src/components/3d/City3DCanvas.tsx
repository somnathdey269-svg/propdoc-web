import React from 'react';
import type { PropertyProject, TimeOfDay, PriceMetric } from '../../types';
import { GoogleCityMap } from '../googlemaps/GoogleCityMap';

interface City3DCanvasProps {
  projects: PropertyProject[];
  selectedProject: PropertyProject | null;
  onSelectProject: (project: PropertyProject) => void;
  timeOfDay: TimeOfDay;
  onTimeOfDayChange?: (time: TimeOfDay) => void;
  priceMetric: PriceMetric;
  activeLocality?: string;
  onSelectLocality?: (locality: string) => void;
  mapType?: 'roadmap' | 'hybrid' | 'terrain';
  tiltDegree?: number;
  showStreetViewModal?: boolean;
  onCloseStreetViewModal?: () => void;
}

export const City3DCanvas: React.FC<City3DCanvasProps> = ({
  projects,
  selectedProject,
  onSelectProject,
  timeOfDay,
  onTimeOfDayChange,
  priceMetric,
  activeLocality = '',
  onSelectLocality,
  mapType = 'hybrid',
  tiltDegree = 45,
  showStreetViewModal = false,
  onCloseStreetViewModal,
}) => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950">
      {/* 100% IMMERSIVE REAL PRODUCTION GOOGLE MAPS PLATFORM ENGINE */}
      <GoogleCityMap
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={onSelectProject}
        timeOfDay={timeOfDay}
        onTimeOfDayChange={onTimeOfDayChange || (() => {})}
        priceMetric={priceMetric}
        activeLocality={activeLocality}
        onSelectLocality={onSelectLocality}
        mapType={mapType}
        tiltDegree={tiltDegree}
        showStreetViewModal={showStreetViewModal}
        onCloseStreetViewModal={onCloseStreetViewModal}
      />
    </div>
  );
};
