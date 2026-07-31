import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: `<div class="p-6"><h1 class="text-2xl font-bold text-slate-100">Workflow Studio</h1></div>`
})
export class WorkflowComponent {}

export const WORKFLOW_ROUTES = [{ path: '', component: WorkflowComponent }];
