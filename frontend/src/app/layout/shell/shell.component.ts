import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="shell-container flex h-screen bg-slate-900 text-slate-100 font-sans">
      <!-- Sidebar -->
      <aside class="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between p-4">
        <div>
          <!-- Logo -->
          <div class="flex items-center space-x-3 mb-8 px-2">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-500/30">
              D
            </div>
            <div>
              <div class="font-bold text-lg leading-tight tracking-wide">DataAcq</div>
              <div class="text-xs text-cyan-400 font-mono">Enterprise Platform</div>
            </div>
          </div>

          <!-- Navigation Links -->
          <nav class="space-y-1">
            <a routerLink="/dashboard" routerLinkActive="bg-indigo-600/20 text-cyan-400 border-l-4 border-cyan-400"
               class="flex items-center space-x-3 px-3 py-2.5 rounded-r-lg hover:bg-slate-800 text-slate-300 transition-all font-medium text-sm">
              <span>📊</span>
              <span>Dashboard</span>
            </a>

            <a routerLink="/scraper" routerLinkActive="bg-indigo-600/20 text-cyan-400 border-l-4 border-cyan-400"
               class="flex items-center space-x-3 px-3 py-2.5 rounded-r-lg hover:bg-slate-800 text-slate-300 transition-all font-medium text-sm">
              <span>⚙️</span>
              <span>Scraper Config</span>
            </a>

            <a routerLink="/execution" routerLinkActive="bg-indigo-600/20 text-cyan-400 border-l-4 border-cyan-400"
               class="flex items-center space-x-3 px-3 py-2.5 rounded-r-lg hover:bg-slate-800 text-slate-300 transition-all font-medium text-sm">
              <span>🚀</span>
              <span>Execution Center</span>
            </a>

            <a routerLink="/data" routerLinkActive="bg-indigo-600/20 text-cyan-400 border-l-4 border-cyan-400"
               class="flex items-center space-x-3 px-3 py-2.5 rounded-r-lg hover:bg-slate-800 text-slate-300 transition-all font-medium text-sm">
              <span>🔎</span>
              <span>Match Review Queue</span>
            </a>

            <a routerLink="/scheduler" routerLinkActive="bg-indigo-600/20 text-cyan-400 border-l-4 border-cyan-400"
               class="flex items-center space-x-3 px-3 py-2.5 rounded-r-lg hover:bg-slate-800 text-slate-300 transition-all font-medium text-sm">
              <span>⏱️</span>
              <span>Scheduler</span>
            </a>
          </nav>
        </div>

        <!-- User Profile Footer -->
        <div class="border-t border-slate-800 pt-4 flex items-center justify-between px-2" *ngIf="authService.currentUser() as user">
          <div class="truncate">
            <div class="text-sm font-semibold text-slate-200 truncate">{{ user.email }}</div>
            <div class="text-xs text-cyan-400 font-mono">{{ user.platformRole }}</div>
          </div>
          <button (click)="authService.signOut()" class="text-slate-400 hover:text-rose-400 text-sm">🚪</button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 flex flex-col overflow-hidden">
        <header class="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur px-6 flex items-center justify-between">
          <div class="text-sm text-slate-400 font-mono">Enterprise Data Acquisition Platform v2.0</div>
          <div class="flex items-center space-x-4">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ● Backend Active (Supabase Connected)
            </span>
          </div>
        </header>

        <div class="flex-1 overflow-auto p-6 bg-slate-900">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `
})
export class ShellComponent {
  authService = inject(AuthService);
}
