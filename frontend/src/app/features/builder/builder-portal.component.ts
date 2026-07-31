import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PropertyDataService } from '../../core/services/property-data.service';

@Component({
  selector: 'app-builder-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8 space-y-6">
      
      <!-- Top Bar -->
      <header class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div class="flex items-center gap-3">
          <a routerLink="/" class="px-4 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 text-xs font-semibold flex items-center gap-2">
            ← Back to Public Property Showcase
          </a>
          <span class="px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono">
            🏢 BUILDER & DEVELOPER PORTAL
          </span>
        </div>

        <!-- Tab Controls -->
        <div class="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-white/15 text-xs">
          <button
            (click)="activeTab.set('claim')"
            [class.bg-amber-500]="activeTab() === 'claim'"
            [class.text-slate-950]="activeTab() === 'claim'"
            [class.text-slate-400]="activeTab() !== 'claim'"
            class="px-4 py-2 rounded-xl font-bold transition-all"
          >
            Claim RERA Project
          </button>
          <button
            (click)="activeTab.set('inventory')"
            [class.bg-amber-500]="activeTab() === 'inventory'"
            [class.text-slate-950]="activeTab() === 'inventory'"
            [class.text-slate-400]="activeTab() !== 'inventory'"
            class="px-4 py-2 rounded-xl font-bold transition-all"
          >
            Inventory Unit Stack
          </button>
        </div>
      </header>

      <!-- Main Container -->
      <main class="max-w-7xl mx-auto space-y-6">
        
        <!-- Claim RERA Project Tab -->
        <div *ngIf="activeTab() === 'claim'" class="max-w-2xl mx-auto bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-6">
          <div>
            <h2 class="text-xl font-bold text-white">Claim Your RERA Registered Project</h2>
            <p class="text-xs text-slate-400 mt-1">Get verified developer badge, live unit availability stack controls, and price feed updates.</p>
          </div>

          <form (ngSubmit)="claimProject()" class="space-y-4 text-xs">
            <div>
              <label class="block text-slate-400 mb-1">Project Name</label>
              <input type="text" [(ngModel)]="projectName" name="projectName" placeholder="e.g. Sharanya Skyvue" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white">
            </div>

            <div>
              <label class="block text-slate-400 mb-1">GujRERA Reg Number</label>
              <input type="text" [(ngModel)]="reraNumber" name="reraNumber" placeholder="PR/GJ/AHMEDABAD/AUDA/RAA..." class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono">
            </div>

            <button type="submit" class="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg">
              Verify & Claim Project Microsite
            </button>

            <div *ngIf="claimedSubdomain()" class="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 space-y-1">
              <div class="font-bold text-sm">✓ Project Claim Approved!</div>
              <div class="text-xs font-mono">Your microsite is live at: {{ claimedSubdomain() }}</div>
            </div>
          </form>
        </div>

        <!-- Inventory Stack Tab -->
        <div *ngIf="activeTab() === 'inventory'" class="space-y-4">
          <h2 class="text-lg font-bold text-white">Live Developer Unit Availability Matrix</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div *ngFor="let p of dataService.properties()" class="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="font-bold text-white text-sm">{{ p.name }}</h4>
                <span class="text-[10px] text-cyan-400 font-mono">{{ p.locality }}</span>
              </div>
              <div class="space-y-2">
                <div *ngFor="let u of p.unitsStack" class="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div>
                    <span class="font-bold text-slate-200">{{ u.unitNumber }}</span>
                    <span class="text-slate-400 text-[10px] ml-2">{{ u.bhk }}</span>
                  </div>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold" [class.bg-emerald-500-20]="u.status === 'AVAILABLE'" [class.text-emerald-400]="u.status === 'AVAILABLE'">
                    {{ u.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

    </div>
  `
})
export class BuilderPortalComponent {
  dataService = inject(PropertyDataService);

  activeTab = signal<'claim' | 'inventory'>('claim');
  projectName = '';
  reraNumber = '';
  claimedSubdomain = signal<string | null>(null);

  claimProject() {
    if (this.projectName && this.reraNumber) {
      const sub = this.projectName.toLowerCase().replace(/\s+/g, '-') + '.urbanx.in';
      this.claimedSubdomain.set(sub);
    }
  }
}
