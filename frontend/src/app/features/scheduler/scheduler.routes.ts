import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: `<div class="p-6"><h1 class="text-2xl font-bold text-slate-100">Quartz Schedules</h1></div>`
})
export class SchedulerComponent {}

export const SCHEDULER_ROUTES = [{ path: '', component: SchedulerComponent }];
