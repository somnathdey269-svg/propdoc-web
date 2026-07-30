import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { Key, ExternalLink, MapPin, ChevronLeft, Building2 } from 'lucide-react';
import type { PropertyProject, PriceMetric, TimeOfDay } from '../../types';
import { StreetViewModal } from './StreetViewModal';

// ─── TYPES ────────────────────────────────────────────────────────────────────

type MapLevel = 'zones' | 'localities' | 'projects' | 'property';

interface Zone {
  id: string;
  label: string;
  emoji: string;
  lat: number;
  lng: number;
  zoom: number;
  localities: string[]; // locality names that belong to this zone
}

interface GoogleCityMapProps {
  projects: PropertyProject[];
  selectedProject: PropertyProject | null;
  onSelectProject: (project: PropertyProject) => void;
  timeOfDay: TimeOfDay;
  onTimeOfDayChange: (tod: TimeOfDay) => void;
  priceMetric: PriceMetric;
  activeLocality: string;
  onSelectLocality?: (locality: string) => void;
  mapType?: 'roadmap' | 'hybrid' | 'terrain';
  tiltDegree?: number;
  showStreetViewModal?: boolean;
  onCloseStreetViewModal?: () => void;
}

// ─── 4 ZONE DEFINITIONS ───────────────────────────────────────────────────────

const ZONES: Zone[] = [
  {
    id: 'gandhinagar',
    label: 'Gandhinagar',
    emoji: '🏛️',
    lat: 23.2156,
    lng: 72.6369,
    zoom: 12.5,
    localities: [
      'Kudasan', 'GIFT City', 'Infocity', 'Gandhinagar Sector 21', 'Gandhinagar Sector 28',
      'Randheja', 'Adalaj', 'Sargasan', 'Zundal', 'Raysan', 'Pethapur',
    ],
  },
  {
    id: 'north',
    label: 'North Ahmedabad',
    emoji: '🏙️',
    lat: 23.1100,
    lng: 72.5800,
    zoom: 12.5,
    localities: [
      'Chandkheda', 'Motera', 'Gota', 'Ranip', 'Sevi Circle', 'Lapkaman',
      'Rancharda', 'Chharodi', 'Nana Chiloda', 'Sadhu Vasvani', 'Ognaj',
    ],
  },
  {
    id: 'south-west',
    label: 'South & West',
    emoji: '🌆',
    lat: 23.0200,
    lng: 72.4900,
    zoom: 12.5,
    localities: [
      'South Bopal', 'Bopal', 'Shela', 'Bodakdev', 'Sindhu Bhavan Road',
      'Science City', 'Prahlad Nagar', 'Satellite', 'Vastrapur', 'Thaltej',
      'Navrangpura', 'Jodhpur', 'Paldi', 'Vejalpur', 'Naranpura', 'Ambli',
      'North Bopal', 'Shilaj', 'Sanand Road', 'Sarkhej', 'Juhapura', 'Makarba',
    ],
  },
  {
    id: 'east',
    label: 'East Ahmedabad',
    emoji: '🏗️',
    lat: 23.0500,
    lng: 72.6800,
    zoom: 12.5,
    localities: [
      'Nikol', 'Kathwada', 'Nikol Kathwada', 'Vastral', 'Odhav', 'Narol',
      'Maninagar', 'Kankaria', 'Vatva', 'Koteshwar', 'Isanpur', 'Lambha',
      'Hathijan', 'Tragad', 'Bapunagar', 'Naroda',
    ],
  },
];

// ─── CAMERA CONTROLLER ────────────────────────────────────────────────────────

const MapCameraController: React.FC<{
  level: MapLevel;
  activeZone: Zone | null;
  activeLocality: string;
  selectedProject: PropertyProject | null;
  projects: PropertyProject[];
}> = ({ level, activeZone, activeLocality, selectedProject, projects }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (level === 'zones') {
      map.panTo({ lat: 23.0550, lng: 72.5650 });
      map.setZoom(10.8);
    } else if (level === 'localities' && activeZone) {
      map.panTo({ lat: activeZone.lat, lng: activeZone.lng });
      map.setZoom(activeZone.zoom);
    } else if (level === 'projects' && activeLocality) {
      const q = activeLocality.toLowerCase().trim();
      const locProjects = projects.filter(
        p => p.locality.toLowerCase().includes(q) || q.includes(p.locality.toLowerCase())
      );
      if (locProjects.length > 0) {
        const avgLat = locProjects.reduce((sum, p) => sum + p.coordinates.lat, 0) / locProjects.length;
        const avgLng = locProjects.reduce((sum, p) => sum + p.coordinates.lng, 0) / locProjects.length;
        map.panTo({ lat: avgLat, lng: avgLng });
      } else if (activeZone) {
        map.panTo({ lat: activeZone.lat, lng: activeZone.lng });
      }
      map.setZoom(15.0);
    } else if (level === 'property' && selectedProject) {
      map.panTo({ lat: selectedProject.coordinates.lat, lng: selectedProject.coordinates.lng });
      map.setZoom(16.8);
    }
  }, [map, level, activeZone, activeLocality, selectedProject, projects]);

  return null;
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export const GoogleCityMapContent: React.FC<GoogleCityMapProps> = ({
  projects,
  selectedProject,
  onSelectProject,
  priceMetric,
  activeLocality,
  onSelectLocality,
  mapType = 'hybrid',
  tiltDegree = 45,
  showStreetViewModal,
  onCloseStreetViewModal,
}) => {
  // ── Drill-down state ────────────────────────────────────────────────────────
  const [level, setLevel] = useState<MapLevel>('zones');
  const [activeZone, setActiveZone] = useState<Zone | null>(null);
  const [drillLocality, setDrillLocality] = useState<string>('');
  const [hoveredProject, setHoveredProject] = useState<PropertyProject | null>(null);
  const [streetViewProject, setStreetViewProject] = useState<PropertyProject | null>(null);

  const defaultCenter = { lat: 23.0600, lng: 72.5800 };

  // ── Sync external locality filter → drill state ─────────────────────────────
  useEffect(() => {
    if (activeLocality && activeLocality !== 'All Localities') {
      // Find which zone contains this locality
      const zone = ZONES.find(z =>
        z.localities.some(l => l.toLowerCase() === activeLocality.toLowerCase())
      );
      if (zone) {
        setActiveZone(zone);
        setDrillLocality(activeLocality);
        setLevel('projects');
      }
    } else if (!activeLocality || activeLocality === 'All Localities' || activeLocality === '') {
      if (selectedProject) {
        setLevel('property');
      } else {
        setLevel('zones');
        setActiveZone(null);
        setDrillLocality('');
      }
    }
  }, [activeLocality, selectedProject]);

  // ── Locality clusters for level === 'localities' ─────────────────────────────
  const localityClusters = useMemo(() => {
    if (!activeZone) return [];
    const zoneLocalitiesLower = activeZone.localities.map(l => l.toLowerCase());

    const record: Record<string, { localityName: string; lat: number; lng: number; count: number }> = {};
    projects.forEach((proj) => {
      const locLower = proj.locality.toLowerCase();
      // Only include localities that belong to the active zone
      const match = zoneLocalitiesLower.find(zl => locLower.includes(zl) || zl.includes(locLower));
      if (!match) return;

      const key = proj.locality;
      if (!record[key]) {
        record[key] = { localityName: proj.locality, lat: proj.coordinates.lat, lng: proj.coordinates.lng, count: 0 };
      }
      record[key].count += 1;
      record[key].lat = (record[key].lat + proj.coordinates.lat) / 2;
      record[key].lng = (record[key].lng + proj.coordinates.lng) / 2;
    });
    return Object.values(record);
  }, [projects, activeZone]);

  // ── Projects for selected locality ──────────────────────────────────────────
  const localityProjects = useMemo(() => {
    if (!drillLocality) return [];
    const q = drillLocality.toLowerCase();
    return projects.filter(p => p.locality.toLowerCase().includes(q) || q.includes(p.locality.toLowerCase()));
  }, [projects, drillLocality]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleZoneClick = useCallback((zone: Zone) => {
    setActiveZone(zone);
    setDrillLocality('');
    setLevel('localities');
  }, []);

  const handleLocalityClick = useCallback((localityName: string) => {
    setDrillLocality(localityName);
    setLevel('projects');
    if (onSelectLocality) onSelectLocality(localityName);
  }, [onSelectLocality]);

  const handleProjectClick = useCallback((proj: PropertyProject) => {
    onSelectProject(proj);
    setLevel('property');
  }, [onSelectProject]);

  const handleBack = useCallback(() => {
    if (level === 'property') {
      onSelectProject(null as unknown as PropertyProject); // deselect
      setLevel('projects');
    } else if (level === 'projects') {
      setDrillLocality('');
      if (onSelectLocality) onSelectLocality('All Localities');
      setLevel('localities');
    } else if (level === 'localities') {
      setActiveZone(null);
      setLevel('zones');
    }
  }, [level, onSelectLocality, onSelectProject]);

  // ── Valuation badge style ────────────────────────────────────────────────────
  const getValuationBadgeStyle = (proj: PropertyProject, isSelected: boolean) => {
    if (isSelected) return 'bg-cyan-500 text-slate-950 border-white ring-4 ring-cyan-400/50 shadow-cyan-400/80 scale-110';
    if (proj.isBankAuction || proj.valuationTier === 'bank-auction') return 'bg-amber-400 text-slate-950 border-amber-200 ring-2 ring-amber-400 animate-pulse shadow-amber-500/50';
    if (proj.valuationTier === 'below-avg') return 'bg-emerald-500 text-slate-950 border-emerald-200 shadow-emerald-500/50';
    if (proj.valuationTier === 'above-avg') return 'bg-purple-600 text-white border-purple-300 shadow-purple-600/50';
    return 'bg-sky-500 text-slate-950 border-sky-200 shadow-sky-500/50';
  };

  // ── Breadcrumb label ─────────────────────────────────────────────────────────
  const breadcrumb = (() => {
    if (level === 'zones') return null;
    if (level === 'localities') return activeZone?.label;
    if (level === 'projects') return `${activeZone?.label} › ${drillLocality}`;
    if (level === 'property') return `${drillLocality} › ${selectedProject?.name ?? ''}`;
    return null;
  })();

  const isStreetViewActive = showStreetViewModal || !!streetViewProject;
  const activeStreetViewProject = streetViewProject || selectedProject || projects[0];

  return (
    <div className="relative w-full h-full">
      <Map
        id="urbanx-google-map"
        mapId="DEMO_MAP_ID"
        defaultCenter={defaultCenter}
        defaultZoom={10.5}
        defaultHeading={0}
        defaultTilt={tiltDegree}
        mapTypeId={mapType}
        gestureHandling="greedy"
        disableDefaultUI={true}
        zoomControl={false}
        internalUsageAttributionIds={['gmp_git_agentskills_v1']}
        className="w-full h-full"
      >
        <MapCameraController level={level} activeZone={activeZone} activeLocality={drillLocality} selectedProject={selectedProject} projects={projects} />

        {/* ─── LEVEL 0: 4 ZONE PILLARS ─────────────────────────────────────── */}
        {level === 'zones' && ZONES.map((zone) => {
          const count = projects.filter(p =>
            zone.localities.some(l => p.locality.toLowerCase().includes(l.toLowerCase()) || l.toLowerCase().includes(p.locality.toLowerCase()))
          ).length;
          return (
            <AdvancedMarker
              key={zone.id}
              position={{ lat: zone.lat, lng: zone.lng }}
              onClick={() => handleZoneClick(zone)}
              zIndex={50}
            >
              <div className="group cursor-pointer transform hover:scale-105 transition-all duration-200">
                <div className="px-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/70 shadow-xl text-slate-800 flex flex-col items-center gap-1 font-outfit hover:bg-white transition-all min-w-[120px]">
                  <span className="text-2xl">{zone.emoji}</span>
                  <span className="font-bold text-[12px] text-slate-800 text-center leading-tight">{zone.label}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold mt-0.5">
                    {count} Projects
                  </span>
                </div>
                {/* Subtle pulse ring */}
                <div className="absolute inset-0 rounded-2xl ring-2 ring-slate-300/40 animate-ping pointer-events-none" />
              </div>
            </AdvancedMarker>
          );
        })}

        {/* ─── LEVEL 1: LOCALITY CLUSTERS WITHIN ZONE ──────────────────────── */}
        {level === 'localities' && localityClusters.map((cluster) => (
          <AdvancedMarker
            key={cluster.localityName}
            position={{ lat: cluster.lat, lng: cluster.lng }}
            onClick={() => handleLocalityClick(cluster.localityName)}
            zIndex={40}
          >
            <div className="group cursor-pointer transform hover:scale-105 transition-all duration-200 drop-shadow-lg">
              <div className="px-3 py-1.5 rounded-full bg-white/88 backdrop-blur-xl border border-white/60 text-slate-800 shadow-lg flex items-center gap-1.5 font-outfit hover:bg-white/98 transition-all">
                <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="font-semibold text-[11px] text-slate-800">{cluster.localityName}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-slate-800/10 text-slate-700 text-[10px] font-bold">
                  {cluster.count}
                </span>
              </div>
            </div>
          </AdvancedMarker>
        ))}

        {/* ─── LEVEL 2: INDIVIDUAL PROPERTY PINS IN LOCALITY ───────────────── */}
        {level === 'projects' && localityProjects.map((proj) => {
          const isHovered = hoveredProject?.id === proj.id;
          const priceDisplay =
            priceMetric === 'sqft' ? `₹${proj.pricePerSqFt}/ft²`
            : priceMetric === 'sqyd' ? `₹${proj.pricePerSqYd}/yd²`
            : `₹${(proj.priceRangeMinInr / 10000000).toFixed(2)} Cr`;
          const badgeStyle = getValuationBadgeStyle(proj, false);
          return (
            <AdvancedMarker
              key={proj.id}
              position={{ lat: proj.coordinates.lat, lng: proj.coordinates.lng }}
              onClick={() => handleProjectClick(proj)}
              zIndex={isHovered ? 50 : 10}
            >
              <div
                onMouseEnter={() => setHoveredProject(proj)}
                onMouseLeave={() => setHoveredProject(null)}
                className="group relative cursor-pointer transition-all duration-200 transform hover:scale-110"
              >
                <div className={`px-3 py-1.5 rounded-full border shadow-xl backdrop-blur-xl flex items-center gap-1.5 text-xs font-bold font-mono transition-all ${badgeStyle}`}>
                  <Building2 className="w-3 h-3 shrink-0 opacity-80" />
                  <span className="truncate max-w-[130px] font-outfit">{proj.name}</span>
                  <span className="font-extrabold text-[10px]">{priceDisplay}</span>
                </div>
                {/* Hover preview */}
                {isHovered && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-3 rounded-2xl bg-slate-950/95 border border-cyan-500/30 text-slate-100 shadow-2xl backdrop-blur-2xl pointer-events-none animate-in fade-in zoom-in-95 z-50">
                    <img src={proj.coverImage} alt={proj.name} className="w-full h-20 object-cover rounded-xl mb-2" />
                    <p className="text-xs font-bold text-white truncate font-outfit">{proj.name}</p>
                    <p className="text-[10px] text-slate-400">{proj.locality} · Click to view</p>
                  </div>
                )}
              </div>
            </AdvancedMarker>
          );
        })}

        {/* ─── LEVEL 3: SELECTED PROPERTY PIN + NEARBY POI RINGS ───────────── */}
        {level === 'property' && selectedProject && (
          <>
            {/* The selected property itself */}
            <AdvancedMarker
              key={selectedProject.id}
              position={{ lat: selectedProject.coordinates.lat, lng: selectedProject.coordinates.lng }}
              zIndex={100}
            >
              <div className="cursor-default transform scale-125">
                <div className="px-3 py-1.5 rounded-full border shadow-2xl backdrop-blur-xl flex items-center gap-1.5 text-xs font-bold bg-cyan-500 text-slate-950 border-white ring-4 ring-cyan-400/50">
                  <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse shrink-0" />
                  <span className="truncate max-w-[140px] font-outfit">{selectedProject.name}</span>
                </div>
              </div>
            </AdvancedMarker>

            {/* Nearby POI markers */}
            {selectedProject.nearbyPlaces.map((poi, pIdx) => {
              const angles = [0, 72, 144, 216, 288];
              const angleRad = (angles[pIdx % angles.length]) * (Math.PI / 180);
              const dist = 0.003 + (pIdx % 3) * 0.001;
              const offsetLat = selectedProject.coordinates.lat + Math.sin(angleRad) * dist;
              const offsetLng = selectedProject.coordinates.lng + Math.cos(angleRad) * dist;

              const poiStyle = (() => {
                if (poi.category === 'Hospital') return { icon: '🏥', color: 'bg-rose-500/90 text-white border-rose-300' };
                if (poi.category === 'School') return { icon: '🏫', color: 'bg-amber-400/90 text-slate-950 border-amber-200' };
                if (poi.category === 'Metro') return { icon: '🚇', color: 'bg-emerald-500/90 text-slate-950 border-emerald-200' };
                if (poi.category === 'Garden') return { icon: '🌳', color: 'bg-green-500/90 text-slate-950 border-green-200' };
                if (poi.category === 'Riverfront') return { icon: '✈️', color: 'bg-indigo-500/90 text-white border-indigo-300' };
                return { icon: '📍', color: 'bg-slate-600/90 text-white border-slate-400' };
              })();

              return (
                <AdvancedMarker key={`poi-${pIdx}`} position={{ lat: offsetLat, lng: offsetLng }} zIndex={80}>
                  <div className={`px-2.5 py-1 rounded-full border shadow-xl backdrop-blur-xl text-[10px] font-bold flex items-center gap-1 font-outfit animate-in fade-in zoom-in-95 ${poiStyle.color}`}>
                    <span>{poiStyle.icon}</span>
                    <span className="truncate max-w-[90px]">{poi.name.split(' ').slice(0, 2).join(' ')}</span>
                    <span className="font-mono opacity-90">{poi.distanceKm}km</span>
                  </div>
                </AdvancedMarker>
              );
            })}
          </>
        )}
      </Map>

      {/* ─── BACK BUTTON + BREADCRUMB ─────────────────────────────────────────── */}
      {level !== 'zones' && (
        <div className="absolute top-4 left-4 z-30 flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/90 backdrop-blur-xl border border-white/60 shadow-lg text-slate-700 text-xs font-semibold font-outfit hover:bg-white transition-all hover:scale-105"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back
          </button>
          {breadcrumb && (
            <div className="px-3 py-2 rounded-xl bg-slate-950/80 backdrop-blur-xl border border-white/10 shadow-lg text-white/80 text-[11px] font-outfit truncate max-w-[220px]">
              {breadcrumb}
            </div>
          )}
        </div>
      )}

      {/* ─── STREET VIEW MODAL ────────────────────────────────────────────────── */}
      {isStreetViewActive && activeStreetViewProject && (
        <StreetViewModal
          project={activeStreetViewProject}
          onClose={() => {
            setStreetViewProject(null);
            if (onCloseStreetViewModal) onCloseStreetViewModal();
          }}
        />
      )}
    </div>
  );
};

// ─── OUTER WRAPPER (API KEY GUARD) ────────────────────────────────────────────

export const GoogleCityMap: React.FC<GoogleCityMapProps> = (props) => {
  const envKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  const isRealKeyProvided = envKey && envKey !== 'your_real_google_maps_api_key_here' && envKey.trim().length > 10;

  return (
    <div className="relative w-full h-full">
      {!isRealKeyProvided ? (
        <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-3xl p-6 flex flex-col items-center justify-center text-center space-y-5 animate-in fade-in">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-400 via-teal-300 to-emerald-400 p-0.5 shadow-2xl flex items-center justify-center">
            <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center">
              <Key className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div className="max-w-lg space-y-2">
            <h2 className="text-xl font-bold text-white font-outfit">Google Maps API Key Setup Required</h2>
          </div>
          <a
            href="https://console.cloud.google.com/google/maps-apis/credentials?utm_campaign=gmp_git_agentskills_v1"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 font-extrabold text-xs shadow-xl flex items-center gap-2"
          >
            <span>Get API Key from Google Cloud Console</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      ) : (
        <APIProvider apiKey={envKey} libraries={['places', 'routes', 'geometry']}>
          <GoogleCityMapContent {...props} />
        </APIProvider>
      )}
    </div>
  );
};
