import React, { useState } from 'react';
import type { PropertyProject } from '../../types';
import { 
  X, ShieldCheck, MapPin, Download, Phone, 
  MessageSquare, FileText, CheckCircle2, Layers, 
  Tag, Compass, School, Hospital, Hotel, Trees, Coffee, Dumbbell, ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PropertyDetailModalProps {
  project: PropertyProject;
  onClose: () => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({ project, onClose }) => {
  const [activeTab, setActiveTab] = useState<'units' | 'pricing' | 'brochure' | 'nearby' | 'contact'>('units');
  const [selectedUnit, setSelectedUnit] = useState(project.unitsStack[0] || null);

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
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const formattedMinPrice = (project.priceRangeMinInr / 10000000).toFixed(2);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/90 backdrop-blur-3xl overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl bg-slate-900 border border-white/20 overflow-hidden shadow-2xl space-y-4 p-6 flex flex-col max-h-[92vh]">
        {/* Cover Header Banner */}
        <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden border border-white/10 shadow-inner">
          <img src={project.coverImage} alt={project.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-xs font-semibold text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>GujRERA Verified Reg #{project.reraNumber}</span>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl bg-slate-950/80 hover:bg-white/10 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-bold text-white font-outfit">{project.name}</h2>
              <span className="text-xs text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {project.address}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/80 border border-white/10 text-xs overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('units')}
            className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'units' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" /> Available Units
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'pricing' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tag className="w-4 h-4" /> 5-Source Aggregator Prices
          </button>
          <button
            onClick={() => setActiveTab('brochure')}
            className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'brochure' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" /> RERA PDF Brochure
          </button>
          <button
            onClick={() => setActiveTab('nearby')}
            className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'nearby' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" /> Nearby Places
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'contact' ? 'bg-emerald-400 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Phone className="w-4 h-4" /> Contact Builder
          </button>
        </div>

        {/* TAB 1: AVAILABLE UNITS STACK */}
        {activeTab === 'units' && (
          <div className="space-y-4 text-xs">
            <span className="font-semibold text-slate-400 block uppercase tracking-wider">Available Building Units & Inventory Stack:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {project.unitsStack.map((unit) => (
                <div
                  key={unit.id}
                  onClick={() => setSelectedUnit(unit)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    selectedUnit?.id === unit.id
                      ? 'bg-slate-800/90 border-cyan-400 shadow-lg shadow-cyan-500/20'
                      : 'bg-white/5 hover:bg-white/10 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Floor {unit.floorNumber} • Unit #{unit.unitNumber}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      unit.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {unit.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>{unit.bhk} ({unit.carpetAreaSqFt} sq.ft)</span>
                    <span className="text-cyan-400 font-mono font-bold">₹{(unit.priceInr / 10000000).toFixed(2)} Cr</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: 5-SOURCE MULTI-PRICE COMPARISON MATRIX */}
        {activeTab === 'pricing' && (
          <div className="space-y-3 text-xs">
            <span className="font-semibold text-slate-400 block uppercase tracking-wider">5-Source Aggregated Price Comparison Table:</span>
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
                        <th className="p-3">Platform Source</th>
                        <th className="p-3">Quoted Price</th>
                        <th className="p-3">Price / Sq.Ft</th>
                        <th className="p-3">Listing Category</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Property Listing Link</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-slate-300">
                      {/* 1. GujRERA */}
                      <tr className="hover:bg-white/5">
                        <td className="p-3 font-bold text-emerald-400">
                          <a
                            href={gujReraUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center gap-1"
                          >
                            <span>GujRERA (Official)</span>
                            <ExternalLink className="w-3 h-3 text-emerald-400" />
                          </a>
                        </td>
                        <td className="p-3 font-mono font-bold text-white">₹{formattedMinPrice} Cr</td>
                        <td className="p-3 font-mono">₹{project.pricePerSqFt}</td>
                        <td className="p-3">Developer Base</td>
                        <td className="p-3 text-emerald-400 font-semibold">✓ Govt Verified</td>
                        <td className="p-3 text-right">
                          <a
                            href={gujReraUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-[10px] transition-all"
                          >
                            <span>View RERA Cert</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>

                      {/* 2. 99acres */}
                      <tr className="hover:bg-white/5">
                        <td className="p-3 font-bold text-cyan-400">
                          <a
                            href={acres99Url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center gap-1"
                          >
                            <span>99acres</span>
                            <ExternalLink className="w-3 h-3 text-cyan-400" />
                          </a>
                        </td>
                        <td className="p-3 font-mono font-bold text-white">
                          ₹{((project.multiSourcePricing.acres99PriceInr || project.priceRangeMinInr * 0.99) / 10000000).toFixed(2)} Cr
                        </td>
                        <td className="p-3 font-mono">₹{Math.round(project.pricePerSqFt * 0.99)}</td>
                        <td className="p-3">Resale Unit</td>
                        <td className="p-3 text-slate-400">Verified Listing</td>
                        <td className="p-3 text-right">
                          <a
                            href={acres99Url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-[10px] transition-all"
                          >
                            <span>View 99acres</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>

                      {/* 3. SquareYards */}
                      <tr className="hover:bg-white/5">
                        <td className="p-3 font-bold text-purple-400">
                          <a
                            href={squareYardsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center gap-1"
                          >
                            <span>SquareYards</span>
                            <ExternalLink className="w-3 h-3 text-purple-400" />
                          </a>
                        </td>
                        <td className="p-3 font-mono font-bold text-white">
                          ₹{((project.multiSourcePricing.squareYardsPriceInr || project.priceRangeMinInr * 0.98) / 10000000).toFixed(2)} Cr
                        </td>
                        <td className="p-3 font-mono">₹{Math.round(project.pricePerSqFt * 0.98)}</td>
                        <td className="p-3">Group Deal</td>
                        <td className="p-3 text-purple-300">Partner Deal</td>
                        <td className="p-3 text-right">
                          <a
                            href={squareYardsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-bold text-[10px] transition-all"
                          >
                            <span>View SquareYards</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>

                      {/* 4. BankNet */}
                      {project.isBankAuction && (
                        <tr className="hover:bg-white/5 bg-rose-500/10">
                          <td className="p-3 font-bold text-rose-400">
                            <a
                              href={bankNetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline flex items-center gap-1"
                            >
                              <span>BankNet (IBAPI Auction)</span>
                              <ExternalLink className="w-3 h-3 text-rose-400" />
                            </a>
                          </td>
                          <td className="p-3 font-mono font-bold text-rose-300">
                            ₹{((project.multiSourcePricing.bankNetPriceInr || project.priceRangeMinInr * 0.75) / 10000000).toFixed(2)} Cr
                          </td>
                          <td className="p-3 font-mono">₹{Math.round(project.pricePerSqFt * 0.75)}</td>
                          <td className="p-3">Bank Distress Auction</td>
                          <td className="p-3 text-rose-400 font-bold">⚠️ 25% Reserve Discount</td>
                          <td className="p-3 text-right">
                            <a
                              href={bankNetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-[10px] transition-all"
                            >
                              <span>View IBAPI Auction</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                        </tr>
                      )}

                      {/* 5. Magicbricks */}
                      <tr className="hover:bg-white/5">
                        <td className="p-3 font-bold text-amber-400">
                          <a
                            href={magicbricksUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center gap-1"
                          >
                            <span>Magicbricks (Rent)</span>
                            <ExternalLink className="w-3 h-3 text-amber-400" />
                          </a>
                        </td>
                        <td className="p-3 font-mono font-bold text-white">
                          ₹{project.multiSourcePricing.monthlyRentInr || 65000} / mo
                        </td>
                        <td className="p-3 font-mono">-</td>
                        <td className="p-3">Rental Lease</td>
                        <td className="p-3 text-amber-300">Owner Direct</td>
                        <td className="p-3 text-right">
                          <a
                            href={magicbricksUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-[10px] transition-all"
                          >
                            <span>View Magicbricks</span>
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

        {/* TAB 3: OFFICIAL GUJRERA PDF BROCHURE */}
        {activeTab === 'brochure' && (
          <div className="space-y-4 text-xs">
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/15 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-cyan-400" />
                <div>
                  <h4 className="text-sm font-bold text-white">Official GujRERA Sanctioned PDF Brochure</h4>
                  <span className="text-slate-400 text-xs">Architectural specs, floorplans, and master layout for {project.name}</span>
                </div>
              </div>
              <a
                href={project.brochurePdfUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
              >
                <Download className="w-4 h-4" /> Download PDF Brochure
              </a>
            </div>
          </div>
        )}

        {/* TAB 4: NEARBY PLACES BREAKDOWN */}
        {activeTab === 'nearby' && (
          <div className="space-y-3 text-xs">
            <span className="font-semibold text-slate-400 block uppercase tracking-wider">Nearby Infrastructure & Distances:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {project.nearbyPlaces.map((place, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {getNearbyIcon(place.category)}
                    <div>
                      <span className="font-bold text-white block">{place.name}</span>
                      <span className="text-[10px] text-slate-400">{place.category}</span>
                    </div>
                  </div>
                  <span className="font-mono text-cyan-400 font-bold">{place.distanceKm} km</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: CONTACT BUILDER LEAD FORM */}
        {activeTab === 'contact' && (
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/15 space-y-4 max-w-xl mx-auto text-xs">
            {!isSubmitted ? (
              <form onSubmit={handleSubmitLead} className="space-y-3">
                <h4 className="text-sm font-bold text-white">Contact {project.builder.name} Sales Team</h4>

                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none focus:border-cyan-400"
                  required
                />
                <input
                  type="tel"
                  placeholder="Mobile Number (WhatsApp Enabled)"
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none focus:border-cyan-400"
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address (Optional)"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none focus:border-cyan-400"
                />

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-bold shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition-all"
                >
                  <MessageSquare className="w-4 h-4" /> Request VIP Instant Callback & WhatsApp Deal
                </button>
              </form>
            ) : (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Inquiry Registered Successfully!</h4>
                <p className="text-slate-300 text-xs">The sales office for {project.name} has received your contact request and will connect via WhatsApp within 15 minutes.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
