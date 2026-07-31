import { Component } from '@angular/core';
import { Routes } from '@angular/router';

@Component({
  standalone: true,
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-slate-100">Platform Overview & Metrics</h1>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-slate-950 p-5 rounded-xl border border-slate-800">
          <div class="text-xs text-slate-400 font-mono">Active Portals</div>
          <div class="text-3xl font-bold text-cyan-400 mt-1">4</div>
        </div>
        <div class="bg-slate-950 p-5 rounded-xl border border-slate-800">
          <div class="text-xs text-slate-400 font-mono">Jobs Today</div>
          <div class="text-3xl font-bold text-indigo-400 mt-1">12</div>
        </div>
        <div class="bg-slate-950 p-5 rounded-xl border border-slate-800">
          <div class="text-xs text-slate-400 font-mono">Discovered Properties</div>
          <div class="text-3xl font-bold text-emerald-400 mt-1">1,482</div>
        </div>
        <div class="bg-slate-950 p-5 rounded-xl border border-slate-800">
          <div class="text-xs text-slate-400 font-mono">Pending Review</div>
          <div class="text-3xl font-bold text-amber-400 mt-1">7</div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {}

export const DASHBOARD_ROUTES: Routes = [{ path: '', component: DashboardComponent }];

