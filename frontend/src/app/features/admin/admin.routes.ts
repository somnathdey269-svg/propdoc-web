import { Component } from '@angular/core';
import { Routes } from '@angular/router';

@Component({
  standalone: true,
  template: `<div class="p-6"><h1 class="text-2xl font-bold text-slate-100">Super Admin Panel</h1></div>`
})
export class AdminComponent {}

export const ADMIN_ROUTES: Routes = [{ path: '', component: AdminComponent }];

