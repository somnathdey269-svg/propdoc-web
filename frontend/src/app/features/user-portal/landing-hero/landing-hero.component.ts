import { Component, EventEmitter, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-landing-hero',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative overflow-y-auto bg-[#030712] text-slate-100 font-sans select-none scroll-smooth">
      
      <!-- LUXURY AMBIENT BACKGROUND GLOWS -->
      <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-cyan-500/15 via-teal-500/10 to-transparent blur-[120px] rounded-full"></div>
        <div class="absolute top-[40%] right-0 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full"></div>
        <div class="absolute top-[70%] left-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full"></div>
      </div>

      <!-- 1. APPLE-STYLE MINIMALIST STICKY HEADER -->
      <header class="sticky top-0 z-50 backdrop-blur-2xl bg-[#030712]/80 border-b border-white/10 px-6 py-4 flex items-center justify-between shadow-2xl">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-teal-300 to-emerald-400 p-0.5 shadow-xl">
            <div class="w-full h-full rounded-[10px] bg-[#030712] flex items-center justify-center font-black text-cyan-400 text-sm">
              UX
            </div>
          </div>
          <div>
            <h1 class="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              URBANX <span class="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-semibold">AHMEDABAD & GANDHINAGAR</span>
            </h1>
            <span class="text-[10px] text-slate-400 block font-normal">Ahmedabad & Gandhinagar's Premier Home Ecosystem</span>
          </div>
        </div>

        <nav class="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
          <a href="#story" class="hover:text-cyan-400 transition-colors">Our Story</a>
          <a href="#ecosystem" class="hover:text-cyan-400 transition-colors">4 Protective Shields</a>
          <a href="#digital-loans" class="hover:text-cyan-400 transition-colors">Digital Loans</a>
          <a href="#neighborhoods" class="hover:text-cyan-400 transition-colors">200+ Localities</a>
        </nav>

        <div class="flex items-center gap-3">
          <button (click)="openAiSearch.emit()" class="px-4 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-all hover:scale-105">
            <span>✨</span>
            <span class="hidden sm:inline">AI Consultant</span>
          </button>
          <button (click)="exploreCity.emit()" class="px-5 py-2 rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 font-extrabold text-xs shadow-xl flex items-center gap-2 hover:scale-105 transition-all">
            <span>🧩</span>
            <span>Launch 3D Map</span>
          </button>
        </div>
      </header>

      <!-- MAIN HERO CONTENT -->
      <main class="relative z-10 max-w-5xl mx-auto px-6 py-16 space-y-36">
        
        <!-- HERO STORY SECTION -->
        <section id="story" class="text-center space-y-8 pt-4">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-widest shadow-xl">
            <span>🛡️</span>
            <span>The Premier Home Ecosystem for Gujarat</span>
          </div>

          <div class="space-y-6 max-w-4xl mx-auto">
            <h2 class="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight">
              Buying a Home Should Bring Joy, <span class="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">Not Surprises.</span>
            </h2>
            <p class="text-slate-300 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed font-normal">
              UrbanX unites 50,000+ verified properties, direct legal advocate verification, instant digital home loans, and government property valuation into one transparent ecosystem built for families across Ahmedabad & Gandhinagar.
            </p>
          </div>

          <!-- CTAS -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button (click)="exploreCity.emit()" class="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 font-black text-sm tracking-wide shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3">
              <span>EXPLORE ALL PROPERTIES</span>
              <span>→</span>
            </button>
            <button (click)="openAiSearch.emit()" class="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-3">
              <span>ASK AI PROPERTY CONSULTANT</span>
              <span>✨</span>
            </button>
          </div>
        </section>

        <!-- EMI CALCULATOR SECTION -->
        <section id="digital-loans" class="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div class="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 class="text-xl font-bold text-white flex items-center gap-2">
                <span>🧮</span> Instant Digital Home Loan EMI Calculator
              </h3>
              <p class="text-xs text-slate-400 mt-1">Calculate your monthly outflow with pre-approved interest rates starting at {{ interestRate() }}%</p>
            </div>
            <span class="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold rounded-full">Pre-Approved</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-2">Loan Amount (Lakhs INR)</label>
              <input type="range" min="10" max="500" step="5" [(ngModel)]="loanAmountLakhs" class="w-full accent-cyan-400">
              <div class="text-right font-mono text-cyan-400 font-bold text-sm mt-1">₹ {{ loanAmountLakhs() }} Lakhs</div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-2">Tenure (Years)</label>
              <input type="range" min="5" max="30" step="1" [(ngModel)]="loanTenureYears" class="w-full accent-teal-400">
              <div class="text-right font-mono text-teal-400 font-bold text-sm mt-1">{{ loanTenureYears() }} Years</div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-2">Interest Rate (%)</label>
              <input type="range" min="6.5" max="12.0" step="0.1" [(ngModel)]="interestRate" class="w-full accent-purple-400">
              <div class="text-right font-mono text-purple-400 font-bold text-sm mt-1">{{ interestRate() }}% p.a.</div>
            </div>
          </div>

          <div class="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <div class="text-xs text-slate-400">Estimated Monthly EMI</div>
              <div class="text-3xl font-black text-emerald-400 font-mono">₹ {{ calculatedEmi().toLocaleString('en-IN') }} / mo</div>
            </div>
            <button (click)="exploreCity.emit()" class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all">
              Apply Pre-Approved Loan
            </button>
          </div>
        </section>

      </main>
    </div>
  `
})
export class LandingHeroComponent {
  @Output() exploreCity = new EventEmitter<void>();
  @Output() openAiSearch = new EventEmitter<void>();

  activeEcosystemTab = signal<'legal' | 'finance' | 'valuation' | 'auctions'>('legal');
  loanAmountLakhs = signal<number>(75);
  loanTenureYears = signal<number>(20);
  interestRate = signal<number>(8.5);

  calculatedEmi = computed(() => {
    const principalInr = this.loanAmountLakhs() * 100000;
    const monthlyRate = this.interestRate() / 12 / 100;
    const totalMonths = this.loanTenureYears() * 12;

    if (monthlyRate === 0) return Math.round(principalInr / totalMonths);

    return Math.round(
      (principalInr * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1)
    );
  });
}
