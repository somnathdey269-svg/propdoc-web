import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyProject } from '../../../types';

@Component({
  selector: 'app-property-preview-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="project" class="p-4 rounded-3xl bg-slate-950/98 backdrop-blur-3xl border border-cyan-500/40 text-slate-100 shadow-2xl space-y-3">
      <div class="relative flex items-center gap-3.5">
        <!-- Close Button -->
        <button
          (click)="closeCard.emit()"
          class="absolute -top-2 -right-2 p-1.5 rounded-full bg-slate-900 border border-white/20 text-slate-400 hover:text-white transition-all shadow-md z-10"
        >
          ✕
        </button>

        <!-- Cover Photo -->
        <div
          (click)="openDetails.emit(project)"
          class="relative w-28 h-24 rounded-2xl overflow-hidden shrink-0 cursor-pointer border border-white/10 group"
        >
          <img [src]="project.coverImage" [alt]="project.name" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
          <span class="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[9px] font-bold text-cyan-300">
            {{ project.category }}
          </span>
        </div>

        <!-- Details & Multi Source Pricing -->
        <div class="flex-1 min-w-0 space-y-1">
          <div class="flex items-center gap-1.5">
            <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-cyan-400 text-slate-950">
              {{ project.valuationTier || 'Fair Market Value' }}
            </span>
            <span class="text-[10px] text-slate-400 truncate">{{ project.locality }}</span>
          </div>

          <h3
            (click)="openDetails.emit(project)"
            class="text-sm font-bold text-white truncate cursor-pointer hover:text-cyan-300 transition-colors"
          >
            {{ project.name }}
          </h3>

          <p class="text-[11px] text-slate-300 font-mono flex items-center gap-2">
            <span>Start: <strong class="text-emerald-400 font-bold">₹ {{ (project.priceRangeMinInr / 10000000).toFixed(2) }} Cr</strong></span>
            <span class="text-slate-500">|</span>
            <span class="text-slate-400">₹ {{ project.pricePerSqFt }}/sq.ft</span>
          </p>

          <div class="flex flex-wrap items-center gap-1 pt-0.5">
            <span class="text-[9px] font-bold text-slate-400">5 Portals Sync:</span>
            <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">SquareYards</span>
            <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/5 text-slate-400">GujRERA</span>
            <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/5 text-slate-400">99acres</span>
            <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/5 text-slate-400">MagicBricks</span>
          </div>
        </div>
      </div>

      <button
        (click)="openDetails.emit(project)"
        class="w-full py-2 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
      >
        View Full Specs & Floor Plans →
      </button>
    </div>
  `
})
export class PropertyPreviewCardComponent {
  @Input() project: PropertyProject | null = null;
  @Output() closeCard = new EventEmitter<void>();
  @Output() openDetails = new EventEmitter<PropertyProject>();
}
