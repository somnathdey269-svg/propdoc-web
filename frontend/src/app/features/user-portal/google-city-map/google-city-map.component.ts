import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyProject } from '../../../types';

declare var google: any;

@Component({
  selector: 'app-google-city-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full h-full min-h-[500px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
      <!-- Map Container -->
      <div #mapContainer class="w-full h-full min-h-[500px]"></div>

      <!-- Map Level Overlay Badge -->
      <div class="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/90 backdrop-blur-md border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-xl">
        <span>📍</span>
        <span>Google Maps Platform API Live Overlay</span>
      </div>

      <!-- Selected Property Quick Overlay -->
      <div *ngIf="selectedProject" class="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-20 p-4 rounded-2xl bg-slate-950/95 backdrop-blur-2xl border border-cyan-500/40 text-white shadow-2xl space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-cyan-400">{{ selectedProject.locality }}</span>
          <span class="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">₹ {{ selectedProject.pricePerSqFt }}/sq.ft</span>
        </div>
        <h4 class="text-sm font-bold text-white">{{ selectedProject.name }}</h4>
        <div class="text-xs text-slate-300 font-mono">Starts at ₹ {{ (selectedProject.priceRangeMinInr / 100000).toFixed(2) }} Lacs</div>
        <button (click)="selectProject.emit(selectedProject)" class="w-full py-2 bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg mt-1">
          Open Property Detail Modal →
        </button>
      </div>
    </div>
  `
})
export class GoogleCityMapComponent implements OnInit, OnChanges {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  @Input() projects: PropertyProject[] = [];
  @Input() selectedProject: PropertyProject | null = null;
  @Output() selectProject = new EventEmitter<PropertyProject>();

  private map: any = null;
  private markers: any[] = [];

  ngOnInit() {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['projects'] && this.map) {
      this.updateMarkers();
    }
  }

  private initMap() {
    const center = { lat: 23.0225, lng: 72.5714 }; // Ahmedabad Centroid
    try {
      if (typeof google !== 'undefined' && google.maps) {
        this.map = new google.maps.Map(this.mapContainer.nativeElement, {
          center,
          zoom: 12,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
            { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#38bdf8' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
            { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#334155' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0284c7' }] }
          ]
        });
        this.updateMarkers();
      }
    } catch (e) {
      console.warn('Google Maps API initialization fallback:', e);
    }
  }

  private updateMarkers() {
    if (!this.map || typeof google === 'undefined') return;

    this.markers.forEach(m => m.setMap(null));
    this.markers = [];

    this.projects.forEach(p => {
      const marker = new google.maps.Marker({
        position: { lat: p.coordinates.lat, lng: p.coordinates.lng },
        map: this.map,
        title: `${p.name} - ₹${p.pricePerSqFt}/sq.ft`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#38bdf8',
          fillOpacity: 0.9,
          strokeWeight: 2,
          strokeColor: '#ffffff'
        }
      });

      marker.addListener('click', () => {
        this.selectProject.emit(p);
      });

      this.markers.push(marker);
    });
  }
}
