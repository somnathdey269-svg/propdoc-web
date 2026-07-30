import React, { useState } from 'react';
import { Sparkles, Compass, ArrowRight, Gavel, Landmark, Calculator, DollarSign, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

interface LandingHeroProps {
  onExploreCity: () => void;
  onOpenAiSearch: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onExploreCity,
  onOpenAiSearch,
}) => {
  // Active Ecosystem Pillar Tab State
  const [activeEcosystemTab, setActiveEcosystemTab] = useState<'legal' | 'finance' | 'valuation' | 'auctions'>('legal');

  // EMI Calculator State
  const [loanAmountLakhs, setLoanAmountLakhs] = useState<number>(75);
  const [loanTenureYears, setLoanTenureYears] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(8.5);

  const monthlyRate = interestRate / 12 / 100;
  const totalMonths = loanTenureYears * 12;
  const principalInr = loanAmountLakhs * 100000;
  const calculatedEmi = Math.round(
    (principalInr * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#030712] text-slate-100 font-sans select-none scroll-smooth">
      
      {/* LUXURY AMBIENT BACKGROUND GLOWS */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-cyan-500/15 via-teal-500/10 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-[40%] right-0 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full" />
        <div className="absolute top-[70%] left-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full" />
      </div>

      {/* 1. APPLE-STYLE MINIMALIST STICKY HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#030712]/80 border-b border-white/10 px-6 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-teal-300 to-emerald-400 p-0.5 shadow-xl">
            <div className="w-full h-full rounded-[10px] bg-[#030712] flex items-center justify-center font-black text-cyan-400 text-sm">
              UX
            </div>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide font-outfit flex items-center gap-2">
              URBANX <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-semibold">AHMEDABAD & GANDHINAGAR</span>
            </h1>
            <span className="text-[10px] text-slate-400 block font-normal">Ahmedabad & Gandhinagar's Premier Home Ecosystem</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
          <a href="#story" className="hover:text-cyan-400 transition-colors">Our Story</a>
          <a href="#ecosystem" className="hover:text-cyan-400 transition-colors">4 Protective Shields</a>
          <a href="#digital-loans" className="hover:text-cyan-400 transition-colors">Digital Loans</a>
          <a href="#neighborhoods" className="hover:text-cyan-400 transition-colors">200+ Localities</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAiSearch}
            className="px-4 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-all hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">AI Consultant</span>
          </button>
          <button
            onClick={onExploreCity}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 font-extrabold text-xs shadow-xl flex items-center gap-2 hover:scale-105 transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Launch 3D Map</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-16 space-y-36">
        
        {/* HERO SECTION: STORY & VALUE PROPOSITION */}
        <section id="story" className="text-center space-y-8 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-widest shadow-xl">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>The Premier Home Ecosystem for Gujarat</span>
          </div>

          <div className="space-y-6 max-w-4xl mx-auto">
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] font-outfit tracking-tight">
              Buying a Home Should Bring Joy, <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">Not Surprises.</span>
            </h2>
            <p className="text-slate-300 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed font-normal">
              UrbanX unites 50,000+ verified properties, direct legal advocate verification, instant digital home loans, and government property valuation into one transparent ecosystem built for families across Ahmedabad & Gandhinagar.
            </p>
          </div>

          {/* MAIN CTAS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onExploreCity}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 font-black text-base shadow-2xl flex items-center justify-center gap-3 hover:scale-105 transition-all group"
            >
              <Compass className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
              <span>Explore Ahmedabad & Gandhinagar in 3D Map</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenAiSearch}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 text-white font-extrabold text-base shadow-xl flex items-center justify-center gap-2.5 transition-all"
            >
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>Ask AI Consultant</span>
            </button>
          </div>

          {/* METRICS PILLS */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 text-center space-y-1 backdrop-blur-xl">
              <span className="text-3xl font-black text-cyan-400 font-mono">50,000+</span>
              <span className="text-xs text-slate-400 block font-medium">Verified Homes</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 text-center space-y-1 backdrop-blur-xl">
              <span className="text-3xl font-black text-emerald-400 font-mono">140+</span>
              <span className="text-xs text-slate-400 block font-medium">Legal Advocates</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 text-center space-y-1 backdrop-blur-xl">
              <span className="text-3xl font-black text-amber-400 font-mono">100%</span>
              <span className="text-xs text-slate-400 block font-medium">GujRERA Audited</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 text-center space-y-1 backdrop-blur-xl">
              <span className="text-3xl font-black text-purple-400 font-mono">1-Stop</span>
              <span className="text-xs text-slate-400 block font-medium">Complete Ecosystem</span>
            </div>
          </div>
        </section>

        {/* SECTION 1: THE HOME BUYER'S COMPARISON (TRADITIONAL VS URBANX) */}
        <section className="space-y-10">
          <div className="text-center space-y-3">
            <span className="px-4 py-1.5 rounded-full bg-rose-500/10 text-rose-300 text-xs font-bold border border-rose-500/30 uppercase tracking-widest">
              Why UrbanX Exists
            </span>
            <h3 className="text-3xl sm:text-5xl font-black text-white font-outfit">
              A Safer Way to Buy Your Home
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* TRADITIONAL WAY */}
            <div className="p-8 rounded-3xl bg-slate-900/40 border border-rose-500/20 space-y-6 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <XCircle className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-white">Traditional Home Buying</h4>
              </div>
              <ul className="space-y-4 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>Paying token money before verifying 30-year title deeds and litigation risks.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>Unaware if price per sq.ft is artificially inflated by local middlemen.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>Weeks of bank visits and paperwork for home loan sanctions.</span>
                </li>
              </ul>
            </div>

            {/* THE URBANX WAY */}
            <div className="p-8 rounded-3xl bg-slate-900/80 border border-emerald-500/40 space-y-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase rounded-bl-xl">
                100% Protected
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-white">The UrbanX Ecosystem</h4>
              </div>
              <ul className="space-y-4 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>30-Year statutory title deed verification by High Court advocates before token payment.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Guaranteed lowest price cross-matched against GujRERA filings & bank auctions.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Instant 10-minute Digital Loan Application pre-approval from SBI, HDFC & ICICI.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 2: THE 4 PROTECTIVE PILLARS ECOSYSTEM MATRIX */}
        <section id="ecosystem" className="space-y-10">
          <div className="text-center space-y-3">
            <span className="px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-bold border border-cyan-500/30 uppercase tracking-widest">
              The 1-Stop Home Ecosystem
            </span>
            <h3 className="text-3xl sm:text-5xl font-black text-white font-outfit">
              Four Protective Shields <span className="text-cyan-400">For Your Family</span>
            </h3>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setActiveEcosystemTab('legal')}
              className={`px-5 py-3 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeEcosystemTab === 'legal'
                  ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 shadow-xl scale-105'
                  : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-white/10'
              }`}
            >
              <Gavel className="w-4 h-4" />
              <span>1. Legal & Advocate Verification</span>
            </button>

            <button
              onClick={() => setActiveEcosystemTab('finance')}
              className={`px-5 py-3 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeEcosystemTab === 'finance'
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-xl scale-105'
                  : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-white/10'
              }`}
            >
              <Landmark className="w-4 h-4" />
              <span>2. Digital Loan Application</span>
            </button>

            <button
              onClick={() => setActiveEcosystemTab('valuation')}
              className={`px-5 py-3 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeEcosystemTab === 'valuation'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 shadow-xl scale-105'
                  : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-white/10'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>3. Certified Property Valuation</span>
            </button>

            <button
              onClick={() => setActiveEcosystemTab('auctions')}
              className={`px-5 py-3 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeEcosystemTab === 'auctions'
                  ? 'bg-gradient-to-r from-purple-400 to-indigo-400 text-slate-950 shadow-xl scale-105'
                  : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-white/10'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>4. SARFAESI Bank Auctions</span>
            </button>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/80 border border-white/15 shadow-2xl max-w-4xl mx-auto backdrop-blur-2xl">
            {activeEcosystemTab === 'legal' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Gavel className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white font-outfit">Verified Legal Advocate Title Audit</h4>
                    <span className="text-xs text-cyan-400 font-medium">Over 140+ Registered High Court Advocates in Ahmedabad & Gandhinagar</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Never pay a token deposit without statutory legal audit. UrbanX connects buyers directly with certified High Court & District Advocates for 30-year title deed search, non-encumbrance reports, and GujRERA litigation auditing.
                </p>
              </div>
            )}

            {activeEcosystemTab === 'finance' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Landmark className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white font-outfit">Instant Digital Loan Application & Bank Pre-Approval</h4>
                    <span className="text-xs text-emerald-400 font-medium">Pre-Approved Rates from SBI, HDFC, ICICI, and Axis Bank</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Apply directly online through our Digital Loan Application engine to receive instant pre-approved home loan sanction letters within 10 minutes. Compare exact EMI calculations, zero processing fee offers, and interest rates starting at 8.35% per annum.
                </p>
              </div>
            )}

            {activeEcosystemTab === 'valuation' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white font-outfit">Government Certified Property Valuation</h4>
                    <span className="text-xs text-amber-400 font-medium">Official Fair Market Value & Satellite Carpet Area Certification</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Avoid overpaying for property. UrbanX combines high-resolution satellite carpet area measurement with government-registered valuation officers to issue official market valuation certificates for buyers and bank sanction procedures.
                </p>
              </div>
            )}

            {activeEcosystemTab === 'auctions' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white font-outfit">SARFAESI Bank Distress Auction Deals</h4>
                    <span className="text-xs text-purple-400 font-medium">Up to 35% Below Market Rate Reserve Pricing</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Access 148 verified bank distress auction listings across Ahmedabad & Gandhinagar (including SBI, Bank of Baroda, and Canara Bank auctions) with reserve pricing up to 35% below current market valuation.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 3: DIGITAL LOAN APPLICATION & LIVE EMI CALCULATOR WIDGET */}
        <section id="digital-loans" className="p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-emerald-500/30 shadow-2xl space-y-8 backdrop-blur-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 uppercase">
                Digital Loan Application Engine
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-white font-outfit mt-2">
                Calculate EMI & Get Pre-Sanctioned
              </h3>
              <p className="text-xs text-slate-400">Instant digital pre-approval letter for properties across Ahmedabad & Gandhinagar.</p>
            </div>

            <button
              onClick={onExploreCity}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 font-black text-xs shadow-xl flex items-center gap-2 hover:scale-105 transition-all"
            >
              <Landmark className="w-4 h-4" />
              <span>Apply Online Now</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 rounded-2xl bg-slate-950/80 border border-white/10">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-200 mb-2">
                  <span>Loan Amount:</span>
                  <span className="text-emerald-400 font-mono">₹{loanAmountLakhs} Lakhs</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={500}
                  step={5}
                  value={loanAmountLakhs}
                  onChange={(e) => setLoanAmountLakhs(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-200 mb-2">
                  <span>Tenure (Years):</span>
                  <span className="text-emerald-400 font-mono">{loanTenureYears} Years</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={1}
                  value={loanTenureYears}
                  onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-200 mb-2">
                  <span>Interest Rate (% p.a.):</span>
                  <span className="text-emerald-400 font-mono">{interestRate}%</span>
                </div>
                <input
                  type="range"
                  min={7.5}
                  max={11.0}
                  step={0.1}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/90 border border-white/10 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-semibold block">Estimated Monthly EMI</span>
                <span className="text-3xl font-black text-emerald-400 font-mono block">
                  ₹{calculatedEmi.toLocaleString('en-IN')}/mo
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Total Payable Amount: ₹{((calculatedEmi * totalMonths) / 100000).toFixed(2)} Lakhs
                </span>
              </div>

              <button
                onClick={onExploreCity}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition-all"
              >
                <span>Submit Digital Loan Application</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 4: MICRO-MARKET NEIGHBORHOOD STORIES */}
        <section id="neighborhoods" className="space-y-8 text-center">
          <div className="space-y-3">
            <span className="px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-300 text-xs font-bold border border-purple-500/30 uppercase tracking-widest">
              Living in Gujarat
            </span>
            <h3 className="text-3xl sm:text-5xl font-black text-white font-outfit">
              Explore 200+ Localities Across Twin Cities
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2 backdrop-blur-xl">
              <span className="text-xs font-bold text-cyan-400">SG Highway & Bodakdev</span>
              <h4 className="text-sm font-bold text-white">Luxury Skyscraper Belt</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Top schools (DPS, Zydus), fine dining, C.G. Road shopping (avg ₹8,450/sq.ft).</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2 backdrop-blur-xl">
              <span className="text-xs font-bold text-emerald-400">Sabarmati Riverfront</span>
              <h4 className="text-sm font-bold text-white">Promenade Living</h4>
              <p className="text-xs text-slate-400 leading-relaxed">River views, morning walking trails, heritage culture, metro access (avg ₹7,100/sq.ft).</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2 backdrop-blur-xl">
              <span className="text-xs font-bold text-amber-400">GIFT City SEZ</span>
              <h4 className="text-sm font-bold text-white">Global Finance Hub</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Walk-to-work financial towers, international schools, 50% green cover (avg ₹9,200/sq.ft).</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2 backdrop-blur-xl">
              <span className="text-xs font-bold text-purple-400">Bopal & South Bopal</span>
              <h4 className="text-sm font-bold text-white">Family Gated Villas</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Peaceful residential townships, upcoming Outer Ring Road (avg ₹6,100/sq.ft).</p>
            </div>
          </div>
        </section>

        {/* SECTION 5: FINAL CALL TO ACTION */}
        <section className="text-center py-6">
          <div className="p-10 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-teal-500/20 to-emerald-500/20 border-2 border-cyan-400/50 shadow-2xl space-y-6 max-w-4xl mx-auto backdrop-blur-3xl">
            <h3 className="text-3xl sm:text-5xl font-black text-white font-outfit">
              Ready to Explore Ahmedabad & Gandhinagar in 3D?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Launch the full interactive 3D map engine to inspect verified properties, legal advocate reports, and distress bank auctions.
            </p>
            <div className="flex justify-center">
              <button
                onClick={onExploreCity}
                className="px-10 py-5 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 font-black text-base shadow-2xl flex items-center gap-3 hover:scale-105 transition-all"
              >
                <Compass className="w-6 h-6" />
                <span>Launch Interactive 3D Map Engine</span>
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER BAR */}
      <footer className="border-t border-white/10 bg-[#030712] px-6 py-6 text-center text-xs text-slate-500 relative z-10">
        <p>© 2026 UrbanX Spatial Technologies • Built to Protect Home Buyers across Ahmedabad & Gandhinagar.</p>
      </footer>
    </div>
  );
};
