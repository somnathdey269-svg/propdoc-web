import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScraperConfigService, ScraperPortal } from '../../core/services/scraper-config.service';

@Component({
  selector: 'app-portal-manager',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-slate-100">Scraper Portals</h1>
          <p class="text-sm text-slate-400">Configure website targets, URL strategies, field selectors, and action pipelines.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let portal of portals()" class="bg-slate-950 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 transition-all shadow-lg flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="font-bold text-lg text-slate-100">{{ portal.displayName || portal.portalName }}</span>
              <span [class]="portal.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'"
                    class="px-2 py-0.5 rounded text-xs border font-mono">
                {{ portal.isActive ? 'ACTIVE' : 'INACTIVE' }}
              </span>
            </div>

            <div class="space-y-1.5 text-xs text-slate-400 font-mono mb-4">
              <div><span class="text-slate-500">Base URL:</span> {{ portal.baseUrl || 'Not configured' }}</div>
              <div><span class="text-slate-500">Source Role:</span> {{ portal.sourceRole || 'PRIMARY' }}</div>
              <div><span class="text-slate-500">Rate Limit:</span> {{ portal.rateLimitMs }}ms</div>
              <div><span class="text-slate-500">Max Pages:</span> {{ portal.maxPages }}</div>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-900 flex space-x-2">
            <button class="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold transition-all">
              Configure Selectors
            </button>
            <button (click)="togglePortal(portal.id)" class="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-all">
              Toggle
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PortalManagerComponent implements OnInit {
  private configService = inject(ScraperConfigService);
  portals = signal<ScraperPortal[]>([]);

  ngOnInit() {
    this.loadPortals();
  }

  loadPortals() {
    this.configService.listPortals().subscribe(res => {
      this.portals.set(res.content);
    });
  }

  togglePortal(id: string) {
    this.configService.togglePortal(id).subscribe(() => this.loadPortals());
  }
}
