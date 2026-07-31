import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyProject } from '../../../types';

@Component({
  selector: 'app-property-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="project" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-3xl overflow-y-auto">
      <div class="relative w-full max-w-5xl rounded-3xl bg-slate-900 border border-white/20 overflow-hidden shadow-2xl space-y-4 p-6 flex flex-col max-h-[92vh]">
        
        <!-- Header Banner -->
        <div class="relative h-48 md:h-64 rounded-2xl overflow-hidden border border-white/10 shadow-inner">
          <img [src]="project.coverImage" [alt]="project.name" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-6 flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-xs font-semibold text-white">
                <span>🛡️</span>
                <span>GujRERA Verified Reg #{{ project.reraNumber }}</span>
              </div>
              <button (click)="closeModal.emit()" class="p-2 rounded-xl bg-slate-950/80 hover:bg-white/10 text-white">
                ✕
              </button>
            </div>

            <div class="space-y-1">
              <h2 class="text-xl md:text-2xl font-bold text-white">{{ project.name }}</h2>
              <span class="text-xs text-slate-300 flex items-center gap-1">
                📍 {{ project.address }}
              </span>
            </div>
          </div>
        </div>

        <!-- Tab Controls -->
        <div class="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950/80 border border-white/10 text-xs overflow-x-auto">
          <button
            (click)="activeTab.set('units')"
            [class.bg-cyan-500]="activeTab() === 'units'"
            [class.text-slate-950]="activeTab() === 'units'"
            [class.text-slate-400]="activeTab() !== 'units'"
            class="px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap"
          >
            Available Units
          </button>
          <button
            (click)="activeTab.set('pricing')"
            [class.bg-cyan-500]="activeTab() === 'pricing'"
            [class.text-slate-950]="activeTab() === 'pricing'"
            [class.text-slate-400]="activeTab() !== 'pricing'"
            class="px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap"
          >
            5-Portal Price Comparison
          </button>
          <button
            (click)="activeTab.set('lead')"
            [class.bg-cyan-500]="activeTab() === 'lead'"
            [class.text-slate-950]="activeTab() === 'lead'"
            [class.text-slate-400]="activeTab() !== 'lead'"
            class="px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap"
          >
            VIP Site Visit Request
          </button>
        </div>

        <!-- Content Area -->
        <div class="overflow-y-auto pr-2 space-y-4 text-xs">
          <!-- Units Tab -->
          <div *ngIf="activeTab() === 'units'" class="space-y-3">
            <h3 class="text-sm font-bold text-white">Project Tower Unit Stacks</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div *ngFor="let u of project.unitsStack" class="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-cyan-400 text-sm">{{ u.unitNumber }}</span>
                  <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">{{ u.status }}</span>
                </div>
                <div class="text-slate-300">{{ u.bhk }} • {{ u.carpetAreaSqFt }} sq.ft • Facing {{ u.facing }}</div>
                <div class="text-white font-bold font-mono text-sm">₹ {{ (u.priceInr / 100000).toFixed(2) }} Lacs</div>
              </div>
            </div>
          </div>

          <!-- Pricing Tab -->
          <div *ngIf="activeTab() === 'pricing'" class="space-y-3">
            <h3 class="text-sm font-bold text-white">Live Multi-Portal Pricing Aggregation</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
              <div class="p-3 rounded-2xl bg-slate-950 border border-indigo-500/30">
                <div class="text-indigo-400 font-semibold text-[10px]">GujRERA Base</div>
                <div class="text-white font-bold text-sm mt-1">₹ {{ (project.multiSourcePricing.gujReraPriceInr! / 100000).toFixed(2) }} L</div>
              </div>
              <div class="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div class="text-slate-400 text-[10px]">99acres</div>
                <div class="text-emerald-400 font-bold text-sm mt-1">₹ {{ (project.multiSourcePricing.acres99PriceInr! / 100000).toFixed(2) }} L</div>
              </div>
              <div class="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div class="text-slate-400 text-[10px]">MagicBricks</div>
                <div class="text-purple-400 font-bold text-sm mt-1">₹ {{ (project.multiSourcePricing.magicbricksPriceInr! / 100000).toFixed(2) }} L</div>
              </div>
              <div class="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div class="text-slate-400 text-[10px]">SquareYards</div>
                <div class="text-amber-400 font-bold text-sm mt-1">₹ {{ (project.multiSourcePricing.squareYardsPriceInr! / 100000).toFixed(2) }} L</div>
              </div>
            </div>
          </div>

          <!-- VIP Lead Form Tab -->
          <div *ngIf="activeTab() === 'lead'" class="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <h3 class="text-sm font-bold text-white">Schedule Private Site Visit with Builder</h3>
            <form (ngSubmit)="submitLead()" class="space-y-3">
              <input type="text" [(ngModel)]="name" name="name" placeholder="Full Name" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500">
              <input type="tel" [(ngModel)]="phone" name="phone" placeholder="Mobile Number (+91)" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500">
              <button type="submit" class="w-full py-3 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg">
                Submit Priority Site Visit Request
              </button>
              <div *ngIf="submitted()" class="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-center font-bold">
                ✓ Request Submitted! A dedicated Property Advisor will call you within 15 minutes.
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  `
})
export class PropertyDetailModalComponent {
  @Input() project: PropertyProject | null = null;
  @Output() closeModal = new EventEmitter<void>();

  activeTab = signal<'units' | 'pricing' | 'lead'>('units');
  name = '';
  phone = '';
  submitted = signal<boolean>(false);

  submitLead() {
    if (this.name && this.phone) {
      this.submitted.set(true);
    }
  }
}
