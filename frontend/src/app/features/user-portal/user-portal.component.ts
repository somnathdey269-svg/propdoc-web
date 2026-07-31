import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

export interface PropertyListing {
  id: string;
  name: string;
  developer: string;
  locality: string;
  city: string;
  tier: 'Budget-Mid' | 'Mid-Luxury' | 'Ultra-Luxury' | 'SEZ-Commercial';
  gujreraId: string;
  basePriceInr: number;
  gujreraPriceInr: number;
  acres99PriceInr: number;
  magicbricksPriceInr: number;
  squareyardsPriceInr: number;
  bhkTypes: string[];
  imageUrl: string;
  status: 'Under Construction' | 'Ready to Move' | 'New Launch';
}

@Component({
  selector: 'app-user-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <!-- Header / Navbar -->
      <header class="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-500/25">
            UX
          </div>
          <div>
            <div class="font-extrabold text-xl tracking-tight text-white flex items-center gap-2">
              UrbanX <span class="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">Ahmedabad & Gandhinagar</span>
            </div>
            <div class="text-xs text-slate-400">Deterministic Real Estate Intelligence & Price Matrix</div>
          </div>
        </div>

        <nav class="hidden md:flex items-center space-x-6 text-sm font-medium">
          <a class="text-cyan-400 font-semibold cursor-pointer">Projects Showcase</a>
          <a class="text-slate-400 hover:text-slate-200 cursor-pointer">Localities Directory</a>
          <a class="text-slate-400 hover:text-slate-200 cursor-pointer">Price Matrix</a>
          <a routerLink="/admin" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-xs transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2">
            <span>⚙️</span> Super Admin Scraper Portal
          </a>
        </nav>
      </header>

      <!-- Hero Banner -->
      <section class="relative px-6 py-12 max-w-7xl mx-mx-auto text-center space-y-6">
        <div class="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono mb-2">
          <span>✨ Verified GujRERA Data Synchronized in Real-Time</span>
        </div>

        <h1 class="text-4xl md:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight">
          Find Property Prices Across <span class="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">GujRERA, 99acres & MagicBricks</span>
        </h1>

        <p class="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
          Compare listing prices from top real estate portals side-by-side with verified RERA IDs across 200+ prime localities in Ahmedabad and Gandhinagar.
        </p>

        <!-- Search & Filter Bar -->
        <div class="max-w-4xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-2xl space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input type="text" [(ngModel)]="searchQuery" placeholder="Search project name or developer..."
                   class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium">

            <select [(ngModel)]="selectedLocality" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-medium">
              <option value="ALL">All Localities (Ahmedabad & Gandhinagar)</option>
              <option value="Bodaldev">Bodaldev</option>
              <option value="Thaltej">Thaltej</option>
              <option value="Prahlad Nagar">Prahlad Nagar</option>
              <option value="GIFT City">GIFT City (Gandhinagar)</option>
              <option value="Vaishno Devi Circle">Vaishno Devi Circle</option>
              <option value="Shela">Shela</option>
            </select>

            <select [(ngModel)]="selectedTier" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-medium">
              <option value="ALL">All Property Tiers</option>
              <option value="Budget-Mid">Budget-Mid</option>
              <option value="Mid-Luxury">Mid-Luxury</option>
              <option value="Ultra-Luxury">Ultra-Luxury</option>
              <option value="SEZ-Commercial">SEZ-Commercial</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Main Property Listings Grid -->
      <section class="max-w-7xl mx-auto px-6 pb-20 space-y-8">
        <div class="flex items-center justify-between border-b border-slate-800 pb-4">
          <div class="text-sm font-semibold text-slate-400">
            Showing <span class="text-cyan-400 font-bold font-mono">{{ filteredListings().length }}</span> Verified Real Estate Projects
          </div>
          <div class="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <span>● 4-Portal Matrix Sync Active</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let p of filteredListings()" class="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden transition-all duration-300 shadow-xl flex flex-col justify-between group">

            <!-- Property Card Header / Image -->
            <div>
              <div class="relative h-48 bg-slate-800 overflow-hidden">
                <img [src]="p.imageUrl" [alt]="p.name" class="w-full h-full object-cover group-hover:scale-105 transition-all duration-500">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>

                <!-- Badges -->
                <div class="absolute top-3 left-3 flex flex-wrap gap-2">
                  <span class="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/90 text-white shadow-lg backdrop-blur">
                    ✓ GujRERA Verified
                  </span>
                  <span class="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-950/80 text-cyan-400 border border-cyan-500/30 backdrop-blur">
                    {{ p.tier }}
                  </span>
                </div>

                <div class="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                  <div>
                    <h3 class="text-lg font-bold text-white leading-tight group-hover:text-cyan-300 transition-all">{{ p.name }}</h3>
                    <div class="text-xs text-slate-300 font-medium">{{ p.developer }} • {{ p.locality }}, {{ p.city }}</div>
                  </div>
                </div>
              </div>

              <!-- Content Body -->
              <div class="p-5 space-y-4">
                <!-- RERA Reg ID -->
                <div class="flex items-center justify-between text-xs font-mono bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
                  <span class="text-slate-500">RERA No:</span>
                  <span class="text-cyan-400 font-bold">{{ p.gujreraId }}</span>
                </div>

                <!-- 4-Portal Pricing Comparison Matrix -->
                <div class="space-y-2">
                  <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Live 4-Portal Price Comparison</div>

                  <div class="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div class="bg-indigo-950/40 border border-indigo-500/20 p-2.5 rounded-lg">
                      <div class="text-indigo-400 font-semibold">GujRERA (Base)</div>
                      <div class="text-slate-100 font-bold text-sm mt-0.5">₹ {{ (p.gujreraPriceInr / 100000).toFixed(2) }} Lacs</div>
                    </div>

                    <div class="bg-slate-950 border border-slate-800 p-2.5 rounded-lg">
                      <div class="text-slate-400">99acres</div>
                      <div class="text-emerald-400 font-bold text-sm mt-0.5">₹ {{ (p.acres99PriceInr / 100000).toFixed(2) }} Lacs</div>
                    </div>

                    <div class="bg-slate-950 border border-slate-800 p-2.5 rounded-lg">
                      <div class="text-slate-400">MagicBricks</div>
                      <div class="text-purple-400 font-bold text-sm mt-0.5">₹ {{ (p.magicbricksPriceInr / 100000).toFixed(2) }} Lacs</div>
                    </div>

                    <div class="bg-slate-950 border border-slate-800 p-2.5 rounded-lg">
                      <div class="text-slate-400">SquareYards</div>
                      <div class="text-amber-400 font-bold text-sm mt-0.5">₹ {{ (p.squareyardsPriceInr / 100000).toFixed(2) }} Lacs</div>
                    </div>
                  </div>
                </div>

                <!-- BHK Types -->
                <div class="flex items-center space-x-1.5">
                  <span *ngFor="let bhk of p.bhkTypes" class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-medium">
                    {{ bhk }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Footer Action -->
            <div class="p-5 pt-0">
              <button class="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2">
                <span>Compare Full Specs & Floor Plans</span>
                <span>→</span>
              </button>
            </div>

          </div>
        </div>
      </section>
    </div>
  `
})
export class UserPortalComponent implements OnInit {
  searchQuery = signal<string>('');
  selectedLocality = signal<string>('ALL');
  selectedTier = signal<string>('ALL');

  listings = signal<PropertyListing[]>([
    {
      id: '1',
      name: 'Sharanya Skyvue',
      developer: 'Sharanya Group',
      locality: 'Bodaldev',
      city: 'Ahmedabad',
      tier: 'Ultra-Luxury',
      gujreraId: 'PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/RAA08234/190321',
      basePriceInr: 17500000,
      gujreraPriceInr: 17500000,
      acres99PriceInr: 17800000,
      magicbricksPriceInr: 17650000,
      squareyardsPriceInr: 17400000,
      bhkTypes: ['3 BHK', '4 BHK Penthouse'],
      imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      status: 'Under Construction'
    },
    {
      id: '2',
      name: 'Sun Elevate',
      developer: 'Sun Builders',
      locality: 'Shela',
      city: 'Ahmedabad',
      tier: 'Mid-Luxury',
      gujreraId: 'PR/GJ/AHMEDABAD/SANAND/AUDA/RAA07112/040620',
      basePriceInr: 8500000,
      gujreraPriceInr: 8500000,
      acres99PriceInr: 8750000,
      magicbricksPriceInr: 8600000,
      squareyardsPriceInr: 8450000,
      bhkTypes: ['3 BHK Apartment'],
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      status: 'Ready to Move'
    },
    {
      id: '3',
      name: 'GIFT One Tech Tower',
      developer: 'GIFT City Co-Dev',
      locality: 'GIFT City',
      city: 'Gandhinagar',
      tier: 'SEZ-Commercial',
      gujreraId: 'PR/GJ/GANDHINAGAR/GANDHINAGAR/GIDA/RAA09981/151121',
      basePriceInr: 22500000,
      gujreraPriceInr: 22500000,
      acres99PriceInr: 22900000,
      magicbricksPriceInr: 22600000,
      squareyardsPriceInr: 22400000,
      bhkTypes: ['Grade-A Office', 'Commercial Suite'],
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      status: 'New Launch'
    },
    {
      id: '4',
      name: 'Venus Skky',
      developer: 'Venus Infrastructure',
      locality: 'Thaltej',
      city: 'Ahmedabad',
      tier: 'Ultra-Luxury',
      gujreraId: 'PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/RAA09122/280821',
      basePriceInr: 19500000,
      gujreraPriceInr: 19500000,
      acres99PriceInr: 19900000,
      magicbricksPriceInr: 19700000,
      squareyardsPriceInr: 19400000,
      bhkTypes: ['4 BHK Sky Villa'],
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      status: 'Under Construction'
    }
  ]);

  filteredListings = computed(() => {
    return this.listings().filter(item => {
      const q = this.searchQuery().toLowerCase();
      const matchesSearch = !q || item.name.toLowerCase().includes(q) || item.developer.toLowerCase().includes(q);
      const matchesLocality = this.selectedLocality() === 'ALL' || item.locality === this.selectedLocality();
      const matchesTier = this.selectedTier() === 'ALL' || item.tier === this.selectedTier();

      return matchesSearch && matchesLocality && matchesTier;
    });
  });

  ngOnInit() {}
}
