import React, { useState, useMemo, useEffect } from 'react';
import type { PropertyProject, SearchFilters, TimeOfDay } from '../types';
import { INITIAL_PROJECTS } from '../data/ahmedabadData';
import { seedSupabaseDatabase } from '../lib/seedDatabase';
import { City3DCanvas } from '../components/3d/City3DCanvas';
import { HeaderNav } from '../components/ui/HeaderNav';
import type { HeaderTheme } from '../components/ui/HeaderNav';
import { PropertyDetailPage } from './PropertyDetailPage';
import { AiChatbotDrawer } from '../components/ui/AiChatbotDrawer';
import { LandingHero } from '../components/ui/LandingHero';
import { MobileBottomSheet } from '../components/ui/MobileBottomSheet';
import { PropertyPreviewCard } from '../components/ui/PropertyPreviewCard';
import { MessageSquare, Plus, Minus, Eye, Home } from 'lucide-react';

export const UserPortal: React.FC = () => {
  const [projects] = useState<PropertyProject[]>(INITIAL_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<PropertyProject | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('midday');
  const [headerTheme, setHeaderTheme] = useState<HeaderTheme>('midnight');

  // Automatic Background Supabase Synchronization
  useEffect(() => {
    seedSupabaseDatabase().then((res) => {
      if (res?.success) {
        console.log(`✅ Supabase Database Auto-Synced! (${res.localitiesCount} Localities, ${res.projectsCount} Projects)`);
      }
    });
  }, []);

  // Map Controls State
  const [mapType, setMapType] = useState<'roadmap' | 'hybrid' | 'terrain'>('hybrid');
  const [tiltDegree] = useState(45);

  // Modals & Chatbot Drawer
  const [showLanding, setShowLanding] = useState(true);
  const [showAiChatbot, setShowAiChatbot] = useState(false);

  // Search Filters
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    locality: '',
    category: '',
    listingType: 'Sale', // Pure Buy Mode Only
    priceMetric: 'total',
    priceMin: 0,
    priceMax: 100000000,
    bhk: '',
    isBankAuctionOnly: false
  });

  // Filtered Projects across 50,000+ Ahmedabad District & Gandhinagar properties
  const filteredProjects = useMemo(() => {
    return projects.filter((proj) => {
      if (filters.locality && filters.locality !== 'All Localities' && proj.locality !== filters.locality) return false;
      if (filters.category && proj.category !== filters.category) return false;

      if (filters.query) {
        const q = filters.query.toLowerCase();
        const matchName = proj.name.toLowerCase().includes(q);
        const matchLoc = proj.locality.toLowerCase().includes(q);
        const matchCity = proj.city.toLowerCase().includes(q);
        const matchBld = proj.builder.name.toLowerCase().includes(q);
        if (!matchName && !matchLoc && !matchCity && !matchBld) return false;
      }
      return true;
    });
  }, [projects, filters]);

  const activeLocalityLabel = filters.locality || 'All Localities';

  const [showcaseProject, setShowcaseProject] = useState<PropertyProject | null>(null);

  const handleSelectProject = (project: PropertyProject) => {
    setSelectedProject(project);
  };

  const handleResetCamera = () => {
    setSelectedProject(null);
    setFilters({
      query: '',
      locality: '',
      category: '',
      listingType: 'Sale',
      priceMetric: 'total',
      priceMin: 0,
      priceMax: 100000000,
      bhk: '',
      isBankAuctionOnly: false
    });
  };

  // Dedicated Full-Screen Showcase Page (Only when user clicks Showcase in preview card!)
  if (showcaseProject) {
    return (
      <PropertyDetailPage
        project={showcaseProject}
        onBackToMap={() => setShowcaseProject(null)}
      />
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* 100% IMMERSIVE FULL SCREEN GOOGLE MAP */}
      <City3DCanvas
        projects={filteredProjects}
        selectedProject={selectedProject}
        onSelectProject={handleSelectProject}
        timeOfDay={timeOfDay}
        onTimeOfDayChange={setTimeOfDay}
        priceMetric={filters.priceMetric}
        activeLocality={filters.locality}
        onSelectLocality={(loc) => setFilters((prev) => ({ ...prev, locality: loc }))}
        mapType={mapType}
        tiltDegree={tiltDegree}
      />

      {/* FLOATING UNIFIED TOP HEADER BAR (PROPDOC LOGO LEFT & MAP SWITCHER RIGHT) */}
      <HeaderNav
        projects={projects}
        onSelectProject={handleSelectProject}
        filters={filters}
        onFilterChange={setFilters}
        totalResults={filteredProjects.length}
        timeOfDay={timeOfDay}
        onTimeOfDayChange={setTimeOfDay}
        onResetCamera={handleResetCamera}
        headerTheme={headerTheme}
        setHeaderTheme={setHeaderTheme}
        mapType={mapType}
        onMapTypeChange={setMapType}
      />

      {/* ========================================================================= */}
      {/* 1. HORIZONTAL CONTROLS IN BOTTOM-LEFT ([ 🏠 ] | [ - ] [ + ]) */}
      {/* ========================================================================= */}
      <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2 p-1.5 rounded-full bg-slate-950/90 backdrop-blur-2xl border border-cyan-500/30 shadow-2xl">
        {/* Home Button */}
        <button
          onClick={handleResetCamera}
          className="w-9 h-9 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          title="Reset to City Home View"
        >
          <Home className="w-4 h-4 text-cyan-400" />
        </button>
        
        <div className="w-px h-5 bg-white/20" />

        {/* Zoom Controls */}
        <button
          onClick={() => {
            const zoomBtn = document.querySelector('button[aria-label="Zoom out"]') as HTMLButtonElement;
            if (zoomBtn) zoomBtn.click();
          }}
          className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4 text-cyan-400" />
        </button>
        <button
          onClick={() => {
            const zoomBtn = document.querySelector('button[aria-label="Zoom in"]') as HTMLButtonElement;
            if (zoomBtn) zoomBtn.click();
          }}
          className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          title="Zoom In"
        >
          <Plus className="w-4 h-4 text-cyan-400" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. DYNAMIC PROPERTY COUNTER PILL AT BOTTOM-CENTER & PREVIEW CARD */}
      {/* ========================================================================= */}
      {selectedProject && (
        <PropertyPreviewCard
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onOpenDetails={(proj) => setShowcaseProject(proj)}
        />
      )}

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-950/95 backdrop-blur-3xl border border-cyan-500/40 text-xs font-bold text-white shadow-2xl animate-in fade-in max-w-md truncate">
        <Eye className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
        <span className="font-outfit tracking-wide truncate">
          {activeLocalityLabel !== 'All Localities'
            ? `${filteredProjects.length.toLocaleString('en-IN')} Verified Projects in ${activeLocalityLabel}`
            : `${projects.length.toLocaleString('en-IN')} Verified Projects in Ahmedabad & Gandhinagar`}
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 3. FLOATING "ASK PROPDOC" BUTTON IN BOTTOM-RIGHT */}
      {/* ========================================================================= */}
      <button
        onClick={() => setShowAiChatbot(true)}
        className="fixed bottom-6 right-6 z-40 px-5 py-3 rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-xs shadow-2xl flex items-center gap-2 hover:scale-110 active:scale-95 transition-all border border-cyan-300/50"
      >
        <MessageSquare className="w-4 h-4 fill-slate-950" />
        <span className="font-outfit tracking-wide uppercase">Ask PropDoc</span>
        <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
      </button>

      {/* Mobile Touch Drawer Sheet */}
      <MobileBottomSheet
        projects={filteredProjects}
        selectedProject={selectedProject}
        onSelectProject={handleSelectProject}
      />

      {/* Hero Landing Modal */}
      {showLanding && (
        <LandingHero
          onExploreCity={() => setShowLanding(false)}
          onOpenAiSearch={() => {
            setShowLanding(false);
            setShowAiChatbot(true);
          }}
        />
      )}

      {/* REAL INTERACTIVE CONVERSATIONAL AI CHATBOT DRAWER */}
      {showAiChatbot && (
        <AiChatbotDrawer
          projects={projects}
          onClose={() => setShowAiChatbot(false)}
          onSelectProject={(proj) => {
            setShowAiChatbot(false);
            handleSelectProject(proj);
          }}
          onFlyToLocality={(loc) => {
            setFilters((prev) => ({ ...prev, locality: loc }));
          }}
        />
      )}
    </div>
  );
};
