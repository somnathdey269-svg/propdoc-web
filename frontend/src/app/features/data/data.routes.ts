import { Component } from '@angular/core';
import { Routes } from '@angular/router';

@Component({
  standalone: true,
  template: `<div class="p-6"><h1 class="text-2xl font-bold text-slate-100">Match Review Queue</h1></div>`
})
export class ReviewQueueComponent {}

export const DATA_ROUTES: Routes = [{ path: '', component: ReviewQueueComponent }];

