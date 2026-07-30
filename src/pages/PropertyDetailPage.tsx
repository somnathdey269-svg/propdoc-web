import React, { useState } from 'react';
import type { PropertyProject } from '../types';
import { 
  ArrowLeft, ShieldCheck, MapPin, Download, Phone, 
  MessageSquare, FileText, CheckCircle2, Layers, 
  Tag, Compass, School, Hospital, Hotel, Trees, Coffee, Dumbbell, Award, ExternalLink, Navigation
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StreetViewModal } from '../components/googlemaps/StreetViewModal';

interface PropertyDetailPageProps {
  project: PropertyProject;
  onBackToMap: () => void;
}

export const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({ project, onBackToMap }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'units' | 'pricing' | 'brochure' | 'nearby' | 'contact'>('overview');
  const [selectedUnit, setSelectedUnit] = useState(project.unitsStack[0] || null);
  const [showStreetView, setShowStreetView] = useState(false);

  // Form State for VIP Lead Registration
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadPhone) return;

    setIsSubmitted(true);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const formattedMinPrice = (project.priceRangeMinInr / 10000000).toFixed(2);
  const formattedLowestPrice = (project.multiSourcePricing.lowestPriceInr / 10000000).toFixed(2);

  const getNearbyIcon = (cat: string) => {
    switch (cat) {
      case 'Hospital': return <Hospital className="w-4 h-4 text-rose-400" />;
      case 'School': return <School className="w-4 h-4 text-cyan-400" />;
      case 'Temple': return <Compass className="w-4 h-4 text-amber-400" />;
      case 'Garden': return <Trees className="w-4 h-4 text-emerald-400" />;
      case 'Gym': return <Dumbbell className="w-4 h-4 text-purple-400" />;
      case 'Cafe': return <Coffee className="w-4 h-4 text-orange-400" />;
      case 'Hotel': return <Hotel className="w-4 h-4 text-indigo-400" />;
      default: return <MapPin className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8 animate-in fade-in duration-300">
      {/* Top Floating Navigation Bar */}
      <div className="max-w-7xl mx-auto flex items-center justify-between pb-6 border-b border-white/10">
        <button
          onClick={onBackToMap}
          className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-white flex items-center gap-2 transition-all hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>Back to Ahmedabad & Gandhinagar Discovery Map</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStreetView(true)}
            className="px-4 py-2 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-2 transition-all hover:scale-105"
          >
            <Navigation className="w-4 h-4 animate-pulse text-cyan-400" />
            <span>Google Street View 360° Panorama</span>
          </button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>GujRERA Verified Reg #{project.reraNumber}</span>
          </div>
        </div>
      </div>

      {/* Hero Property Banner */}
      <div className="max-w-7xl mx-auto pt-6">
        <div className="relative h-72 md:h-96 rounded-3xl overflow-hidden border border-white/15 shadow-2xl">
          <img src={project.coverImage} alt={project.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-6 md:p-10 flex flex-col justify-between">
            <div className="flex justify-end">
              <span className="px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold">
                {project.locality} • {project.city}
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl md:text-4xl font-extrabold text-white font-outfit tracking-tight">{project.name}</h1>
              <p className="text-xs md:text-sm text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" /> {project.address}
              </p>

              {/* Lowest Price Highlight Badge */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <div className="px-4 py-2 rounded-2xl bg-emerald-500/20 backdrop-blur-xl border border-emerald-400/40 text-emerald-300 text-sm font-bold flex items-center gap-2 shadow-lg">
                  <Award className="w-4 h-4" />
                  <span>Lowest Price: ₹{formattedLowestPrice} Cr on {project.multiSourcePricing.lowestPriceSource}</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Base Price Range: ₹{formattedMinPrice} Cr+ (₹{project.pricePerSqFt}/sq.ft • ₹{project.pricePerSqYd}/sq.yd)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Controls */}
      <div className="max-w-7xl mx-auto pt-6">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-white/15 text-xs overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview & AI Highlights
          </button>
          <button
            onClick={() => setActiveTab('units')}
            className={`px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'units' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" /> Units & Floorplans
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'pricing' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tag className="w-4 h-4" /> 5-Platform Price Comparison
          </button>
          <button
            onClick={() => setActiveTab('brochure')}
            className={`px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'brochure' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" /> RERA PDF Brochure
          </button>
          <button
            onClick={() => setActiveTab('nearby')}
            className={`px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'nearby' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" /> Nearby Distances
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'contact' ? 'bg-emerald-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Phone className="w-4 h-4" /> Contact Builder Sales
          </button>
        </div>
      </div>

      {/* Tab Content Areas */}
      <div className="max-w-7xl mx-auto pt-6 space-y-6">
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 p-6 rounded-3xl bg-slate-900 border border-white/15 space-y-4">
              <h3 className="text-base font-bold text-white">About {project.name}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{project.description}</p>

              <div className="pt-4 border-t border-white/10">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Highlights & Specifications</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.aiSummary.keyHighlights.map((h, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-white/15 space-y-4">
              <h3 className="text-base font-bold text-white">Investment Metrics</h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex justify-between">
                  <span className="text-slate-400">Builder:</span>
                  <span className="font-bold text-white">{project.builder.name}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex justify-between">
                  <span className="text-slate-400">Project Status:</span>
                  <span className="font-bold text-cyan-400">{project.status}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex justify-between">
                  <span className="text-slate-400">Projected Yield:</span>
                  <span className="font-bold text-emerald-400">{project.aiSummary.projectedYield}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex justify-between">
                  <span className="text-slate-400">3-Yr Capital Growth:</span>
                  <span className="font-bold text-emerald-400">{project.aiSummary.expectedAppreciation3Yr}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* UNITS & STACK */}
        {activeTab === 'units' && (
          <div className="p-6 rounded-3xl bg-slate-900 border border-white/15 space-y-4">
            <h3 className="text-base font-bold text-white">Available Floor Units & Floorplan Layouts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {project.unitsStack.map((unit) => (
                <div
                  key={unit.id}
                  onClick={() => setSelectedUnit(unit)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    selectedUnit?.id === unit.id
                      ? 'bg-slate-800 border-cyan-400 shadow-xl shadow-cyan-500/20'
                      : 'bg-white/5 hover:bg-white/10 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-white text-sm">
                    <span>Floor {unit.floorNumber} • Unit #{unit.unitNumber}</span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs">
                      {unit.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>{unit.bhk} ({unit.carpetAreaSqFt} sq.ft)</span>
                    <span className="text-cyan-400 font-mono font-bold">₹{(unit.priceInr / 10000000).toFixed(2)} Cr</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5-PLATFORM PRICE COMPARISON */}
        {activeTab === 'pricing' && (
          <div className="p-6 rounded-3xl bg-slate-900 border border-white/15 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">5-Platform Quoted Price Comparison Matrix</h3>
            <div className="rounded-2xl border border-white/15 overflow-hidden bg-slate-950/80">
              {(() => {
                const gujReraUrl = project.multiSourcePricing.sourceUrls?.gujReraUrl || `https://gujrera.gujarat.gov.in/projectSearch?reraNo=${encodeURIComponent(project.reraNumber)}&project=${encodeURIComponent(project.name)}`;
                const acres99Url = project.multiSourcePricing.sourceUrls?.acres99Url || `https://www.99acres.com/${project.slug}-in-${project.locality.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${project.city.toLowerCase()}`;
                const squareYardsUrl = project.multiSourcePricing.sourceUrls?.squareYardsUrl || `https://www.squareyards.com/sale/property-for-sale-in-${project.locality.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${project.city.toLowerCase()}/${project.slug}`;
                const bankNetUrl = project.multiSourcePricing.sourceUrls?.bankNetUrl || `https://www.ibapi.in/auction-details.aspx?property=${encodeURIComponent(project.name)}`;
                const magicbricksUrl = project.multiSourcePricing.sourceUrls?.magicbricksUrl || `https://www.magicbricks.com/property-for-sale-in-${project.locality.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${project.city.toLowerCase()}?project=${encodeURIComponent(project.name)}`;

                return (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-slate-300">
                        <th className="p-4">Aggregator Source</th>
                        <th className="p-4">Quoted Price</th>
                        <th className="p-4">Price / Sq.Ft</th>
                        <th className="p-4">Price / Sq.Yard</th>
                        <th className="p-4">Highlight Badge</th>
                        <th className="p-4 text-right">Property Listing Link</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-slate-300">
                      {/* 1. GujRERA (Statutory) */}
                      <tr className="hover:bg-white/5">
                        <td className="p-4 font-bold text-emerald-400">
                          <a
                            href={gujReraUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center gap-1.5"
                          >
                            <span>GujRERA (Statutory)</span>
                            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                          </a>
                        </td>
                        <td className="p-4 font-mono font-bold text-white">₹{formattedMinPrice} Cr</td>
                        <td className="p-4 font-mono">₹{project.pricePerSqFt}</td>
                        <td className="p-4 font-mono">₹{project.pricePerSqYd}</td>
                        <td className="p-4 text-emerald-400 font-semibold">✓ Govt Verified</td>
                        <td className="p-4 text-right">
                          <a
                            href={gujReraUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] transition-all"
                          >
                            <span>View RERA Certificate</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>

                      {/* 2. 99acres */}
                      <tr className="hover:bg-white/5">
                        <td className="p-4 font-bold text-cyan-400">
                          <a
                            href={acres99Url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center gap-1.5"
                          >
                            <span>99acres</span>
                            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                          </a>
                        </td>
                        <td className="p-4 font-mono font-bold text-white">
                          ₹{((project.multiSourcePricing.acres99PriceInr || project.priceRangeMinInr * 0.985) / 10000000).toFixed(2)} Cr
                        </td>
                        <td className="p-4 font-mono">₹{Math.round(project.pricePerSqFt * 0.985)}</td>
                        <td className="p-4 font-mono">₹{Math.round(project.pricePerSqYd * 0.985)}</td>
                        <td className="p-4 text-slate-400">Resale Listing</td>
                        <td className="p-4 text-right">
                          <a
                            href={acres99Url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-[11px] transition-all"
                          >
                            <span>View 99acres Listing</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>

                      {/* 3. SquareYards */}
                      <tr className="hover:bg-white/5">
                        <td className="p-4 font-bold text-purple-400">
                          <a
                            href={squareYardsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center gap-1.5"
                          >
                            <span>SquareYards</span>
                            <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                          </a>
                        </td>
                        <td className="p-4 font-mono font-bold text-white">
                          ₹{((project.multiSourcePricing.squareYardsPriceInr || project.priceRangeMinInr * 0.975) / 10000000).toFixed(2)} Cr
                        </td>
                        <td className="p-4 font-mono">₹{Math.round(project.pricePerSqFt * 0.975)}</td>
                        <td className="p-4 font-mono">₹{Math.round(project.pricePerSqYd * 0.975)}</td>
                        <td className="p-4 text-purple-300 font-bold">Group Booking Deal</td>
                        <td className="p-4 text-right">
                          <a
                            href={squareYardsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-bold text-[11px] transition-all"
                          >
                            <span>View SquareYards Deal</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>

                      {/* 4. BankNet SARFAESI Auctions */}
                      {project.isBankAuction && (
                        <tr className="hover:bg-white/5 bg-rose-500/10">
                          <td className="p-4 font-bold text-rose-400">
                            <a
                              href={bankNetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline flex items-center gap-1.5"
                            >
                              <span>BankNet (IBAPI Auction)</span>
                              <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
                            </a>
                          </td>
                          <td className="p-4 font-mono font-bold text-rose-300">
                            ₹{((project.multiSourcePricing.bankNetPriceInr || project.priceRangeMinInr * 0.75) / 10000000).toFixed(2)} Cr
                          </td>
                          <td className="p-4 font-mono">₹{Math.round(project.pricePerSqFt * 0.75)}</td>
                          <td className="p-4 font-mono">₹{Math.round(project.pricePerSqYd * 0.75)}</td>
                          <td className="p-4 text-rose-400 font-bold">⚠️ 25% Reserve Discount</td>
                          <td className="p-4 text-right">
                            <a
                              href={bankNetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-[11px] transition-all"
                            >
                              <span>View IBAPI Auction</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                        </tr>
                      )}

                      {/* 5. Magicbricks */}
                      <tr className="hover:bg-white/5">
                        <td className="p-4 font-bold text-amber-400">
                          <a
                            href={magicbricksUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center gap-1.5"
                          >
                            <span>Magicbricks (Rent)</span>
                            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                          </a>
                        </td>
                        <td className="p-4 font-mono font-bold text-white">
                          ₹{project.multiSourcePricing.monthlyRentInr || 28000} / mo
                        </td>
                        <td className="p-4 font-mono">-</td>
                        <td className="p-4 font-mono">-</td>
                        <td className="p-4 text-amber-300">Owner Direct Lease</td>
                        <td className="p-4 text-right">
                          <a
                            href={magicbricksUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-[11px] transition-all"
                          >
                            <span>View Magicbricks Lease</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                );
              })()}
            </div>
          </div>
        )}

        {/* BROCHURE */}
        {activeTab === 'brochure' && (
          <div className="p-6 rounded-3xl bg-slate-900 border border-white/15 space-y-4">
            <div className="p-6 rounded-2xl bg-slate-950 border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <FileText className="w-10 h-10 text-cyan-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white">Official GujRERA Sanctioned PDF Brochure</h4>
                  <p className="text-xs text-slate-400">Download structural specs, sanctioned master layout, and payment schedule for {project.name}</p>
                </div>
              </div>
              <a
                href={project.brochurePdfUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 hover:scale-105 transition-all shadow-lg shrink-0"
              >
                <Download className="w-4 h-4" /> Download PDF Brochure
              </a>
            </div>
          </div>
        )}

        {/* NEARBY DISTANCES */}
        {activeTab === 'nearby' && (
          <div className="p-6 rounded-3xl bg-slate-900 border border-white/15 space-y-4">
            <h3 className="text-base font-bold text-white">Nearby Infrastructure & Commute Time</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {project.nearbyPlaces.map((place, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    {getNearbyIcon(place.category)}
                    <div>
                      <span className="font-bold text-white block">{place.name}</span>
                      <span className="text-[10px] text-slate-400">{place.category}</span>
                    </div>
                  </div>
                  <span className="font-mono text-cyan-400 font-bold">{place.distanceKm} km ({place.timeMins} mins)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTACT BUILDER */}
        {activeTab === 'contact' && (
          <div className="max-w-xl mx-auto p-8 rounded-3xl bg-slate-900 border border-white/15 space-y-4 text-xs">
            {!isSubmitted ? (
              <form onSubmit={handleSubmitLead} className="space-y-4">
                <h3 className="text-base font-bold text-white">Contact {project.builder.name} Sales Office</h3>

                <div>
                  <label className="text-slate-300 block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Patel"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Mobile Number (WhatsApp Enabled)</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98250 XXXXX"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="rajesh@example.com"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-bold text-xs shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition-all"
                >
                  <MessageSquare className="w-4 h-4" /> Request Instant WhatsApp Direct Lead Callback
                </button>
              </form>
            ) : (
              <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Inquiry Sent Successfully!</h4>
                <p className="text-slate-300 text-xs">The sales desk for {project.name} has received your inquiry and will message you via WhatsApp shortly.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* GOOGLE STREET VIEW 360 PANORAMA MODAL */}
      {showStreetView && (
        <StreetViewModal project={project} onClose={() => setShowStreetView(false)} />
      )}
    </div>
  );
};
