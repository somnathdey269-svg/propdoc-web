import { Routes } from '@angular/router';
import { UserPortalComponent } from './features/user-portal/user-portal.component';
import { BuilderPortalComponent } from './features/builder/builder-portal.component';
import { ShellComponent } from './layout/shell/shell.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // 1. PUBLIC REAL ESTATE WEBSITE & PROPERTY SHOWCASE (Default /)
  {
    path: '',
    component: UserPortalComponent
  },

  // 2. BUILDER & DEVELOPER PORTAL (/builder)
  {
    path: 'builder',
    component: BuilderPortalComponent
  },

  // 3. AUTHENTICATION (/auth)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // 4. ENTERPRISE DATA ACQUISITION & SUPER ADMIN PLATFORM (/admin)
  {
    path: 'admin',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () => import('./features/admin/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ORG_ADMIN'] }
      },
      {
        path: 'scraper',
        loadChildren: () => import('./features/scraper/scraper.routes').then(m => m.SCRAPER_ROUTES),
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ORG_ADMIN', 'BUILDER'] }
      },
      {
        path: 'execution',
        loadChildren: () => import('./features/execution/execution.routes').then(m => m.EXECUTION_ROUTES),
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ORG_ADMIN', 'BUILDER'] }
      },
      {
        path: 'data',
        loadChildren: () => import('./features/data/data.routes').then(m => m.DATA_ROUTES),
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ORG_ADMIN', 'BUILDER', 'VIEWER'] }
      },
      {
        path: 'scheduler',
        loadChildren: () => import('./features/scheduler/scheduler.routes').then(m => m.SCHEDULER_ROUTES),
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ORG_ADMIN'] }
      },
      {
        path: 'workflows',
        loadChildren: () => import('./features/workflow/workflow.routes').then(m => m.WORKFLOW_ROUTES),
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ORG_ADMIN', 'BUILDER'] }
      }
    ]
  },

  // 404 Fallback
  { path: '**', redirectTo: '' }
];
