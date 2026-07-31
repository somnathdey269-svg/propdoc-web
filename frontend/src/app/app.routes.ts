import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Auth
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // Shell layout (authenticated)
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [

      // Default redirect
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // Admin Dashboard (Super Admin)
      {
        path: 'dashboard',
        loadChildren: () => import('./features/admin/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ORG_ADMIN'] }
      },

      // Admin Panel (Super Admin only)
      {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN'] }
      },

      // Scraper Configuration
      {
        path: 'scraper',
        loadChildren: () => import('./features/scraper/scraper.routes').then(m => m.SCRAPER_ROUTES),
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ORG_ADMIN', 'BUILDER'] }
      },

      // Execution Center
      {
        path: 'execution',
        loadChildren: () => import('./features/execution/execution.routes').then(m => m.EXECUTION_ROUTES),
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ORG_ADMIN', 'BUILDER'] }
      },

      // Data Center
      {
        path: 'data',
        loadChildren: () => import('./features/data/data.routes').then(m => m.DATA_ROUTES),
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ORG_ADMIN', 'BUILDER', 'VIEWER'] }
      },

      // Scheduler
      {
        path: 'scheduler',
        loadChildren: () => import('./features/scheduler/scheduler.routes').then(m => m.SCHEDULER_ROUTES),
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ORG_ADMIN'] }
      },

      // Workflow Studio
      {
        path: 'workflows',
        loadChildren: () => import('./features/workflow/workflow.routes').then(m => m.WORKFLOW_ROUTES),
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ORG_ADMIN', 'BUILDER'] }
      },

      // User Portal (property listing — replaces React app)
      {
        path: 'properties',
        loadChildren: () => import('./features/user-portal/user-portal.routes').then(m => m.USER_PORTAL_ROUTES)
      },
    ]
  },

  // 404
  { path: '**', redirectTo: 'dashboard' }
];
