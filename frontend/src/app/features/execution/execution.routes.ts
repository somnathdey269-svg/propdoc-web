import { Component } from '@angular/core';
import { Routes } from '@angular/router';

@Component({
  standalone: true,
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-slate-100">Execution Center</h1>
      <p class="text-sm text-slate-400">Trigger manual jobs, observe SSE real-time logs, and monitor execution progress.</p>
    </div>
  `
})
export class ExecutionControlComponent {}

export const EXECUTION_ROUTES: Routes = [{ path: '', component: ExecutionControlComponent }];

