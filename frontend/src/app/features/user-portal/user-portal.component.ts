import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyDataService } from '../../core/services/property-data.service';
import { PropertyProject } from '../../types';

import { HeaderNavComponent } from './header-nav/header-nav.component';
import { LandingHeroComponent } from './landing-hero/landing-hero.component';
import { FilterBarComponent } from './filter-bar/filter-bar.component';
import { GoogleCityMapComponent } from './google-city-map/google-city-map.component';
import { PropertyPreviewCardComponent } from './property-preview-card/property-preview-card.component';
import { PropertyDetailModalComponent } from './property-detail-modal/property-detail-modal.component';
import { AiChatbotDrawerComponent } from './ai-chatbot-drawer/ai-chatbot-drawer.component';

@Component({
  selector: 'app-user-portal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderNavComponent,
    LandingHeroComponent,
    FilterBarComponent,
    GoogleCityMapComponent,
    PropertyPreviewCardComponent,
    PropertyDetailModalComponent,
    AiChatbotDrawerComponent
  ],
  template: `
    <div class="min-h-screen bg-[#030712] text-slate-100 font-sans relative">
      
      <!-- Top Sticky Navigation Bar -->
      <app-header-nav
        (openAiChat)="showAiChat.set(true)"
        (openBuilderPortal)="showHeroSection.set(false)"
        (projectSelected)="openProjectDetails($event)"
      ></app-header-nav>

      <!-- Hero Section (Toggleable or Landing view) -->
      <app-landing-hero
        *ngIf="showHeroSection()"
        (exploreCity)="showHeroSection.set(false)"
        (openAiSearch)="showAiChat.set(true)"
      ></app-landing-hero>

      <!-- Main Property Discovery Platform -->
      <div *ngIf="!showHeroSection()" class="pt-20 px-4 md:px-8 space-y-6 max-w-7xl mx-auto pb-24">
        
        <!-- Filter Bar & View Toggle -->
        <div class="flex items-center justify-between gap-4">
          <app-filter-bar></app-filter-bar>

          <div class="flex items-center gap-2 p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
            <button
              (click)="viewMode.set('grid')"
              [class.bg-cyan-500]="viewMode() === 'grid'"
              [class.text-slate-950]="viewMode() === 'grid'"
              [class.text-slate-400]="viewMode() !== 'grid'"
              class="px-3.5 py-1.5 rounded-xl font-bold transition-all"
            >
              📊 Grid View
            </button>

            <button
              (click)="viewMode.set('map')"
              [class.bg-cyan-500]="viewMode() === 'map'"
              [class.text-slate-950]="viewMode() === 'map'"
              [class.text-slate-400]="viewMode() !== 'map'"
              class="px-3.5 py-1.5 rounded-xl font-bold transition-all"
            >
              📍 Interactive Map
            </button>
          </div>
        </div>

        <!-- Interactive Google Map View -->
        <div *ngIf="viewMode() === 'map'" class="h-[75vh]">
          <app-google-city-map
            [projects]="dataService.filteredProperties()"
            [selectedProject]="selectedPreviewProject()"
            (selectProject)="openProjectDetails($event)"
          ></app-google-city-map>
        </div>

        <!-- Property Grid View -->
        <div *ngIf="viewMode() === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            *ngFor="let p of dataService.filteredProperties()"
            class="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-3xl overflow-hidden transition-all duration-300 shadow-xl flex flex-col justify-between group"
          >
            <div>
              <!-- Cover Image & Badges -->
              <div class="relative h-48 bg-slate-800 overflow-hidden">
                <img [src]="p.coverImage" [alt]="p.name" class="w-full h-full object-cover group-hover:scale-105 transition-all duration-500">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>

                <div class="absolute top-3 left-3 flex flex-wrap gap-2">
                  <span class="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/90 text-white backdrop-blur">
                    ✓ GujRERA Verified
                  </span>
                  <span class="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-950/80 text-cyan-300 border border-cyan-500/30 backdrop-blur">
                    {{ p.category }}
                  </span>
                </div>

                <div class="absolute bottom-3 left-3 right-3">
                  <h3 (click)="openProjectDetails(p)" class="text-lg font-bold text-white cursor-pointer hover:text-cyan-300 transition-colors">
                    {{ p.name }}
                  </h3>
                  <div class="text-xs text-slate-300">{{ p.builder.name }} • {{ p.locality }}, {{ p.city }}</div>
                </div>
              </div>

              <!-- Body Details -->
              <div class="p-5 space-y-4 text-xs">
                <div class="flex items-center justify-between font-mono bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                  <span class="text-slate-400">GujRERA Reg:</span>
                  <span class="text-cyan-400 font-bold">{{ p.reraNumber }}</span>
                </div>

                <!-- 4-Portal Price Comparison Matrix -->
                <div class="space-y-2">
                  <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live 4-Portal Price Match</div>
                  <div class="grid grid-cols-2 gap-2 font-mono">
                    <div class="bg-indigo-950/40 border border-indigo-500/30 p-2 rounded-xl">
                      <div class="text-indigo-400 text-[10px]">GujRERA Base</div>
                      <div class="text-white font-bold mt-0.5">₹ {{ (p.multiSourcePricing.gujReraPriceInr! / 100000).toFixed(2) }} L</div>
                    </div>
                    <div class="bg-slate-950 border border-slate-800 p-2 rounded-xl">
                      <div class="text-slate-400 text-[10px]">99acres</div>
                      <div class="text-emerald-400 font-bold mt-0.5">₹ {{ (p.multiSourcePricing.acres99PriceInr! / 100000).toFixed(2) }} L</div>
                    </div>
                    <div class="bg-slate-950 border border-slate-800 p-2 rounded-xl">
                      <div class="text-slate-400 text-[10px]">MagicBricks</div>
                      <div class="text-purple-400 font-bold mt-0.5">₹ {{ (p.multiSourcePricing.magicbricksPriceInr! / 100000).toFixed(2) }} L</div>
                    </div>
                    <div class="bg-slate-950 border border-slate-800 p-2 rounded-xl">
                      <div class="text-slate-400 text-[10px]">SquareYards</div>
                      <div class="text-amber-400 font-bold mt-0.5">₹ {{ (p.multiSourcePricing.squareYardsPriceInr! / 100000).toFixed(2) }} L</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer CTA -->
            <div class="p-5 pt-0">
              <button
                (click)="openProjectDetails(p)"
                class="w-full py-3 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-bold text-xs rounded-2xl shadow-lg transition-all"
              >
                Inspect Specs & Floor Plans →
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- Quick Preview Card Popup -->
      <app-property-preview-card
        *ngIf="selectedPreviewProject()"
        [project]="selectedPreviewProject()"
        (closeCard)="selectedPreviewProject.set(null)"
        (openDetails)="openProjectDetails($event)"
      ></app-property-preview-card>

      <!-- Deep Property Detail Modal -->
      <app-property-detail-modal
        *ngIf="selectedModalProject()"
        [project]="selectedModalProject()"
        (closeModal)="selectedModalProject.set(null)"
      ></app-property-detail-modal>

      <!-- Floating AI Chatbot Drawer -->
      <app-ai-chatbot-drawer
        *ngIf="showAiChat()"
        [projects]="dataService.properties()"
        (closeDrawer)="showAiChat.set(false)"
        (selectProject)="openProjectDetails($event)"
      ></app-ai-chatbot-drawer>

    </div>
  `
})
export class UserPortalComponent {
  dataService = inject(PropertyDataService);

  showHeroSection = signal<boolean>(true);
  viewMode = signal<'grid' | 'map'>('grid');
  showAiChat = signal<boolean>(false);

  selectedPreviewProject = signal<PropertyProject | null>(null);
  selectedModalProject = signal<PropertyProject | null>(null);

  openProjectDetails(p: PropertyProject) {
    this.selectedModalProject.set(p);
  }
}
