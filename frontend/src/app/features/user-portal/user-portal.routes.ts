import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: `<div class="p-6"><h1 class="text-2xl font-bold text-slate-100">Property Showcase (User Portal)</h1></div>`
})
export class UserPortalComponent {}

export const USER_PORTAL_ROUTES = [{ path: '', component: UserPortalComponent }];
