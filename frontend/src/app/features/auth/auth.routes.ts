import { Component } from '@angular/core';
import { Routes } from '@angular/router';

@Component({
  standalone: true,
  template: `
    <div class="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100">
      <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <h2 class="text-2xl font-bold text-center mb-2">Platform Sign In</h2>
        <p class="text-xs text-slate-400 text-center mb-6">Enter your Supabase credentials to access the data acquisition platform.</p>
        <button routerLink="/dashboard" class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/20">
          Demo Sign In
        </button>
      </div>
    </div>
  `
})
export class LoginComponent {}

export const AUTH_ROUTES: Routes = [{ path: 'login', component: LoginComponent }, { path: '', redirectTo: 'login', pathMatch: 'full' }];

