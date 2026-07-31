import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyDataService } from '../../../core/services/property-data.service';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-start gap-2 max-w-full">
      <div class="flex flex-wrap items-center gap-2">
        
        <!-- Buy / Rent Toggle -->
        <div class="p-1 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/20 shadow-2xl flex items-center gap-1 text-xs">
          <button
            (click)="toggleListingType('Sale')"
            [class.bg-gradient-to-r]="dataService.filters().listingType === 'Sale'"
            [class.from-emerald-400]="dataService.filters().listingType === 'Sale'"
            [class.to-teal-500]="dataService.filters().listingType === 'Sale'"
            [class.text-slate-950]="dataService.filters().listingType === 'Sale'"
            [class.text-slate-300]="dataService.filters().listingType !== 'Sale'"
            class="px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all"
          >
            <span>🏷️</span>
            <span>Buy (Sale)</span>
          </button>

          <button
            (click)="toggleListingType('Rent')"
            [class.bg-gradient-to-r]="dataService.filters().listingType === 'Rent'"
            [class.from-cyan-400]="dataService.filters().listingType === 'Rent'"
            [class.to-blue-500]="dataService.filters().listingType === 'Rent'"
            [class.text-slate-950]="dataService.filters().listingType === 'Rent'"
            [class.text-slate-300]="dataService.filters().listingType !== 'Rent'"
            class="px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all"
          >
            <span>🔑</span>
            <span>Rent (Lease)</span>
          </button>
        </div>

        <!-- Smart Collapsible Filter Button -->
        <button
          (click)="isOpen.set(!isOpen())"
          class="px-4 py-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-2xl border border-white/15 shadow-2xl text-xs text-white font-semibold flex items-center gap-3 hover:border-cyan-500/40 transition-all group"
        >
          <div class="flex items-center gap-2">
            <span>🔍</span>
            <span>Filters: <strong class="text-cyan-300">{{ dataService.filters().locality }}</strong></span>
          </div>

          <div class="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-bold border border-cyan-500/30 font-mono">
            {{ dataService.filteredProperties().length }} Projects
          </div>

          <span>{{ isOpen() ? '▲' : '▼' }}</span>
        </button>
      </div>

      <!-- Expanded Drawer -->
      <div *ngIf="isOpen()" class="p-4 rounded-3xl bg-slate-900/95 backdrop-blur-3xl border border-white/15 shadow-2xl space-y-3 max-w-2xl w-full text-xs">
        <div class="space-y-1.5">
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Ahmedabad Micro-Markets:</span>
          <div class="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
            <button
              *ngFor="let loc of localities"
              (click)="setLocality(loc)"
              [class.bg-gradient-to-r]="dataService.filters().locality === loc"
              [class.from-cyan-500]="dataService.filters().locality === loc"
              [class.to-teal-400]="dataService.filters().locality === loc"
              [class.text-slate-950]="dataService.filters().locality === loc"
              [class.bg-white-5]="dataService.filters().locality !== loc"
              [class.text-slate-300]="dataService.filters().locality !== loc"
              class="px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border border-white/10"
            >
              <span>{{ loc }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FilterBarComponent {
  dataService = inject(PropertyDataService);
  isOpen = signal<boolean>(false);

  localities = [
    'All Localities',
    'South Bopal', 'Bopal', 'Shela', 'Bodakdev', 'Sindhu Bhavan Road',
    'Thaltej', 'Science City', 'Gota', 'Vaishnodevi Circle', 'Chandkheda',
    'GIFT City', 'Kudasan', 'Prahlad Nagar', 'SG Highway', 'Nikol Kathwada'
  ];

  toggleListingType(type: 'Sale' | 'Rent') {
    const current = this.dataService.filters().listingType;
    this.dataService.filters.update(f => ({
      ...f,
      listingType: current === type ? 'All' : type
    }));
  }

  setLocality(locality: string) {
    this.dataService.filters.update(f => ({ ...f, locality }));
  }
}
