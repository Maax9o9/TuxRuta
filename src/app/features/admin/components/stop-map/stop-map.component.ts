import {
  Component,
  Inject,
  PLATFORM_ID,
  OnInit,
  AfterViewInit,
  ViewChild,
  Input
} from '@angular/core';
import {
  CommonModule,
  isPlatformBrowser,
} from '@angular/common';
import { GoogleMapsModule, GoogleMap } from '@angular/google-maps';
import { CreateStopFormComponent } from '../forms/create-stop-form/create-stop-form.component';
import { Stop } from '../../data/models/stop.model';
import { StopRepository } from '../../data/repository/stop-repository';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-stop-map',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule, CreateStopFormComponent],
  templateUrl: './stop-map.component.html',
  styleUrls: ['./stop-map.component.scss'],
})
export class StopMapComponent implements OnInit, AfterViewInit {
  @Input() token: string | undefined;
  @Input() rutaId: number | null = null;
  isBrowser = false;
  zoom = 15;
  center: google.maps.LatLngLiteral = { lat: -17.3935, lng: -66.1570 };

  @ViewChild('mapElement', { static: false }) mapElement!: GoogleMap;
  public mapInstance!: google.maps.Map;

  markers: google.maps.Marker[] = [];
  markerIconUrl: string = 'bus-stopR.png';

  // ...existing code...
  currentOrder: number = 1;

  mapOptions: google.maps.MapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    mapId: 'DEMO_MAP_ID',
    draggable: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    gestureHandling: 'auto',
    clickableIcons: true,
    keyboardShortcuts: true,
  };

  showStopForm = false;
  clickedLatLng: google.maps.LatLngLiteral | null = null;


  stops: Stop[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private stopRepository: StopRepository
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.getCurrentLocation();
      // No cargar paradas existentes, solo permitir agregar nuevas
      this.stops = [];
      this.markers = [];
      this.currentOrder = 1;
    }
  }

  // Removed: getAllStopsWithToken, now handled in ngOnInit with subscribe

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.waitForGoogleMapsAPI().then(() => {
        setTimeout(() => {
          this.initializeMapFallback();
        }, 0);
      });
    }
  }

  onMapReady(event: Event): void {
    const target = event.target as any;
    if (target && target.googleMap) {
      this.mapInstance = target.googleMap;
      // Siempre agregar el listener de click aquí también
      this.mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          this.addStopMarker(e.latLng);
        }
      });
    }
  }

  private waitForGoogleMapsAPI(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof google !== 'undefined' && google.maps && google.maps.Map) {
        resolve();
        return;
      }

      const checkInterval = setInterval(() => {
        if (typeof google !== 'undefined' && google.maps && google.maps.Map) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 10000);
    });
  }

  private initializeMapFallback(): void {
    let attempts = 0;
    const maxAttempts = 10;

    const checkMap = () => {
      attempts++;
      if (this.mapElement && this.mapElement.googleMap) {
        this.mapInstance = this.mapElement.googleMap;

        this.mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            this.addStopMarker(e.latLng);
          }
        });

        return;
      }

      if (attempts < maxAttempts) {
        setTimeout(checkMap, 500);
      }
    };

    setTimeout(checkMap, 100);
  }

  private getCurrentLocation(): void {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        if (this.mapInstance) {
          this.mapInstance.setCenter(this.center);
        }
      },
      () => {},
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000,
      }
    );
  }

  addStopMarker(latLng: google.maps.LatLng | google.maps.LatLngLiteral): void {
    // Solo mostrar el modal, no crear el marker aún
    this.clickedLatLng = latLng instanceof google.maps.LatLng
      ? { lat: latLng.lat(), lng: latLng.lng() }
      : latLng;
    this.showStopForm = true;
  }

  createStop(stopData: Omit<Stop, 'id'>) {
    // Construir ubicacion con lat/lng y order
    if (!this.clickedLatLng) return;
    const ubicacion = {
      lat: this.clickedLatLng.lat,
      lng: this.clickedLatLng.lng,
      order: this.currentOrder
    };
    const stopToSave = {
      ...stopData,
      ubicacion,
      ruta_id: this.rutaId ?? 0
    };
    this.stopRepository.create(stopToSave, this.token).subscribe({
      next: (newStop) => {
        if (newStop) {
          // Agregar marker solo si el backend responde OK
          const marker = new google.maps.Marker({
            position: { lat: ubicacion.lat, lng: ubicacion.lng },
            map: this.mapInstance,
            icon: {
              url: this.markerIconUrl,
              scaledSize: new google.maps.Size(40, 40),
            },
          });
          this.markers.push(marker);
          this.stops.push(newStop);
          this.currentOrder++;
        }
        this.showStopForm = false;
        this.clickedLatLng = null;
      },
      error: (err) => {
        this.showStopForm = false;
        this.clickedLatLng = null;
      }
    });
  }

  removeLastStop(): void {
    const lastMarker = this.markers.pop();
    if (lastMarker) {
      lastMarker.setMap(null);
    }
  }

  clearAllStops(): void {
    this.markers.forEach((marker) => marker.setMap(null));
    this.markers = [];
  }

  onCloseStopForm(): void {
    this.showStopForm = false;
  }
}
