import { Component, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PropertyDataService } from '../../../core/services/property-data.service';
import { PropertyProject } from '../../../types';

@Component({
  selector: 'app-header-nav',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <header class="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between pointer-events-none">
      <!-- Left Capsule: Logo & Search -->
      <div class="pointer-events-auto flex items-center gap-3 p-2 rounded-full bg-slate-950/90 backdrop-blur-2xl border border-cyan-500/30 shadow-2xl">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 shrink-0">
          <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 via-teal-300 to-emerald-400 flex items-center justify-center font-black text-slate-950 text-xs shadow-md">
            UX
          </div>
          <span class="text-xs font-black text-white tracking-wider">UrbanX</span>
        </div>

        <div class="relative w-48 sm:w-64">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange($event)"
            placeholder="Search projects, developers, localities..."
            class="w-full bg-slate-900/90 border border-white/10 rounded-full px-3.5 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 font-medium"
          />

          <!-- Live Search Dropdown -->
          <div *ngIf="matchingProjects().length > 0" class="absolute top-10 left-0 right-0 bg-slate-950/98 border border-slate-800 rounded-2xl p-2 shadow-2xl space-y-1 max-h-60 overflow-y-auto">
            <div
              *ngFor="let p of matchingProjects()"
              (click)="selectProject(p)"
              class="p-2 hover:bg-slate-900 rounded-xl cursor-pointer flex items-center justify-between text-xs"
            >
              <div>
                <div class="font-bold text-white">{{ p.name }}</div>
                <div class="text-[10px] text-slate-400">{{ p.locality }} • ₹ {{ (p.priceRangeMinInr / 100000).toFixed(2) }} L</div>
              </div>
              <span class="text-cyan-400 text-[10px]">View →</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Capsule: AI Bot, Builder, Admin Navigation -->
      <div class="pointer-events-auto flex items-center gap-2">
        <button
          (click)="openAiChat.emit()"
          class="px-4 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-purple-500/40 text-xs font-bold text-purple-300 flex items-center gap-2 shadow-xl hover:scale-105 transition-all"
        >
          <span>✨ AI Assistant</span>
        </button>

        <button
          (click)="openBuilderPortal.emit()"
          class="px-4 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/40 text-xs font-bold text-emerald-300 flex items-center gap-2 shadow-xl hover:scale-105 transition-all"
        >
          <span>🏢 Builder Portal</span>
        </button>

        <a
          routerLink="/admin"
          class="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 via-cyan-600 to-teal-500 text-white font-bold text-xs shadow-xl flex items-center gap-2 hover:scale-105 transition-all"
        >
          <span>⚙️ Admin Scraper</span>
        </a>
      </div>
    </header>
  `
})
export class HeaderNavComponent {
  dataService = inject(PropertyDataService);

  @Output() openAiChat = new EventEmitter<void>();
  @Output() openBuilderPortal = new EventEmitter<void>();
  @Output() projectSelected = new EventEmitter<PropertyProject>();

  searchQuery = '';
  matchingProjects = signal<PropertyProject[]>([]);

  onSearchChange(query: string) {
    if (query.trim().length < 1) {
      this.matchingProjects.set([]);
      return;
    }
    const q = query.toLowerCase();
    const matches = this.dataService.properties().filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.locality.toLowerCase().includes(q) ||
      p.builder.name.toLowerCase().includes(q)
    ).slice(0, 8);

    this.matchingProjects.set(matches);
  }

  selectProject(p: PropertyProject) {
    this.projectSelected.emit(p);
    this.searchQuery = '';
    this.matchingProjects.set([]);
  }
}
