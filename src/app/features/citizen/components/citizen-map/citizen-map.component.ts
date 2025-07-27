
import {
  Component,
  Inject,
  PLATFORM_ID,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  Input
} from '@angular/core';
import type { Route } from '../../../admin/data/models/route.model';
import { Stop } from '../../../admin/data/models/stop.model';
import { StopRepository } from '../../../admin/data/repository/stop-repository';
import { environments } from '../../../../../core/enviroments';
import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';
import { GoogleMapsModule, GoogleMap } from '@angular/google-maps';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-citizen-map',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './citizen-map.component.html',
  styleUrls: ['./citizen-map.component.scss'],
})
export class CitizenMapComponent implements OnInit, OnDestroy, AfterViewInit {
  private _selectedRoute: Route | null = null;
  @Input() set selectedRoute(route: Route | null) {
    this._selectedRoute = route;
    this.updateRoutePolyline();
    if (route && Array.isArray((route as any).points) && (route as any).points.length > 0) {
      const firstPoint = (route as any).points[0];
      if (firstPoint && typeof firstPoint.lat === 'number' && typeof firstPoint.lng === 'number' && this.mapInstance) {
        this.mapInstance.setCenter({ lat: firstPoint.lat, lng: firstPoint.lng });
      }
    }
  }
  get selectedRoute(): Route | null {
    return this._selectedRoute;
  }
  isBrowser = false;
  zoom = 15;
  center: google.maps.LatLngLiteral = { lat: -17.3935, lng: -66.1570 }; // Cochabamba center

  mapOptions: google.maps.MapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    mapId: 'baefa76acca7ca22e8d2ba2e',
    draggable: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    gestureHandling: 'auto',
    clickableIcons: true,
    keyboardShortcuts: true
  };

  @ViewChild('mapElement', { static: false }) mapElement!: GoogleMap;

  public mapInstance!: google.maps.Map;
  // Marcadores de combis en tiempo real por ruta seleccionada
  private combiMarkers: { [combiId: string]: google.maps.marker.AdvancedMarkerElement } = {};
  private combisByRoute: any[] = []; // [{ id, lat, lng, ... }]
  private ws?: WebSocket;
  // wsUrl ahora viene de environments
  private subscription?: Subscription;
  // private simulationSubscription?: Subscription;
  
  private routePolyline?: google.maps.Polyline;
  private directionsRenderer?: google.maps.DirectionsRenderer;
  private routeStops: google.maps.LatLngLiteral[] = [];
  private stopMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
  private stopsByRoute: Stop[] = [];
  // private currentStopIndex = 0;
  // private isSimulationRunning = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private stopRepository: StopRepository
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    console.log('🗺️ CitizenMapComponent: ngOnInit ejecutado');
    
    if (this.isBrowser) {
      this.getCurrentLocation();
      this.initializeRouteStops();
    }
  }

  ngAfterViewInit(): void {
    console.log('🔄 CitizenMapComponent: ngAfterViewInit llamado');
    
    if (this.isBrowser) {
      this.waitForGoogleMapsAPI().then(() => {
        setTimeout(() => {
          this.initializeMapFallback();
        }, 0);
      });
    }
  }

  private waitForGoogleMapsAPI(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof google !== 'undefined' && google.maps && google.maps.Map) {
        console.log('✅ CitizenMap: Google Maps API ya está disponible');
        resolve();
        return;
      }

      console.log('⏳ CitizenMap: Esperando a que se cargue Google Maps API...');
      
      const checkInterval = setInterval(() => {
        if (typeof google !== 'undefined' && google.maps && google.maps.Map) {
          console.log('✅ CitizenMap: Google Maps API cargado exitosamente');
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      
      setTimeout(() => {
        clearInterval(checkInterval);
        console.error('❌ CitizenMap: Timeout esperando Google Maps API');
        resolve();
      }, 10000);
    });
  }

  private initializeMapFallback(): void {
    let attempts = 0;
    const maxAttempts = 10;
    
    const checkMap = () => {
      attempts++;
      console.log(`🗺️ CitizenMap: Intento ${attempts} de inicialización del mapa`);
      
      if (this.mapElement && this.mapElement.googleMap) {
        console.log('✅ CitizenMap: Mapa encontrado en mapElement');
        this.mapInstance = this.mapElement.googleMap;
        this.onMapInitialized(this.mapInstance);
        return;
      }
      
      if (attempts < maxAttempts) {
        setTimeout(checkMap, 500);
      } else {
        console.error('❌ CitizenMap: No se pudo inicializar el mapa después de', maxAttempts, 'intentos');
      }
    };
    
    setTimeout(checkMap, 100);
  }

  public onMapInitialized(map: google.maps.Map): void {
    console.log('🎉 CitizenMap: Mapa inicializado exitosamente');
    this.mapInstance = map;
    
    if (!this.mapInstance) {
      console.error('❌ CitizenMap: mapInstance es null después de la inicialización');
      return;
    }
    
    setTimeout(() => {
      console.log('⚙️ CitizenMap: Configurando mapa...');
      this.clearCombiMarkers();
      this.connectCombiWebSocket();
      this.drawRoutePolyline();
      
      // Ya no se inicia simulación local, ahora se conecta al WebSocket
      
      this.cdr.detectChanges();
      console.log('✅ CitizenMap: Configuración del mapa completada');
    }, 0);
  }

  onMapReady(event: Event): void {
    console.log('🗺️ CitizenMap: onMapReady llamado');
    this.mapInstance = event as unknown as google.maps.Map;
    
    if (!this.mapInstance) {
      console.error('❌ CitizenMap: Error: mapInstance es null después de la inicialización en onMapReady');
      return;
    }
    
    this.onMapInitialized(this.mapInstance);
  }

  private getCurrentLocation(): void {
    if (!navigator.geolocation) {
      console.log('CitizenMap: Geolocalización no disponible, usando ubicación por defecto de Cochabamba');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        console.log('✅ CitizenMap: Ubicación actual obtenida:', this.center);
        
        if (this.mapInstance) {
          this.mapInstance.setCenter(this.center);
        }
      },
      (error) => {
        console.log(`🗺️ CitizenMap: No se pudo obtener ubicación. Usando ubicación por defecto de Cochabamba`);
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000
      }
    );
  }

  private initializeRouteStops(): void {
    if (this.selectedRoute && this.selectedRoute.id) {
      this.stopRepository.getByRouteId(this.selectedRoute.id).subscribe({
        next: (stops) => {
          this.stopsByRoute = Array.isArray(stops) ? stops : (stops && (stops as any).paradas ? (stops as any).paradas : []);
          // --- RUTAS ---
          let points: any[] = [];
          if (Array.isArray((this.selectedRoute as any).path_data) && (this.selectedRoute as any).path_data.length > 0) {
            points = (this.selectedRoute as any).path_data;
            console.log('[CitizenMap] Usando path_data para puntos:', points);
          } else if (Array.isArray(this.selectedRoute!.points) && this.selectedRoute!.points.length > 0) {
            points = this.selectedRoute!.points;
            console.log('[CitizenMap] Usando points para puntos:', points);
          } else {
            console.log('[CitizenMap] No se encontraron puntos en path_data ni points');
          }
          if (points.length > 0 && points[0].order !== undefined) {
            points = [...points].sort((a: any, b: any) => a.order - b.order);
          }
          this.routeStops = points.map(p => ({ lat: p.lat, lng: p.lng }));
          console.log('[CitizenMap] routeStops después de map:', this.routeStops);
          if (this.routeStops.length > 0 && this.mapInstance) {
            this.mapInstance.setCenter(this.routeStops[0]);
          }
          this.drawRoutePolyline();
          this.drawStopMarkers();
        },
        error: (err) => {
          console.error('CitizenMap: Error al obtener paradas por ruta:', err);
          this.stopsByRoute = [];
          let points: any[] = [];
          if (Array.isArray((this.selectedRoute as any).path_data) && (this.selectedRoute as any).path_data.length > 0) {
            points = (this.selectedRoute as any).path_data;
            console.log('[CitizenMap] (error) Usando path_data para puntos:', points);
          } else if (Array.isArray(this.selectedRoute!.points) && this.selectedRoute!.points.length > 0) {
            points = this.selectedRoute!.points;
            console.log('[CitizenMap] (error) Usando points para puntos:', points);
          } else {
            console.log('[CitizenMap] (error) No se encontraron puntos en path_data ni points');
          }
          if (points.length > 0 && points[0].order !== undefined) {
            points = [...points].sort((a: any, b: any) => a.order - b.order);
          }
          this.routeStops = points.map(p => ({ lat: p.lat, lng: p.lng }));
          console.log('[CitizenMap] (error) routeStops después de map:', this.routeStops);
          if (this.routeStops.length > 0 && this.mapInstance) {
            this.mapInstance.setCenter(this.routeStops[0]);
          }
          this.drawRoutePolyline();
          this.drawStopMarkers();
        }
      });
    } else {
      this.routeStops = [];
      this.stopsByRoute = [];
      this.drawRoutePolyline();
      this.drawStopMarkers();
    }
    console.log('CitizenMap: Paradas de ruta inicializadas:', this.routeStops.length, 'paradas');
  }
  private drawStopMarkers(): void {
    if (!this.mapInstance) return;
    this.stopMarkers.forEach(marker => marker.map = null);
    this.stopMarkers = [];
    if (!this.stopsByRoute || this.stopsByRoute.length === 0) return;
    this.stopsByRoute.forEach((stop, idx) => {
      const lat = typeof stop.ubicacion.lat === 'number' ? stop.ubicacion.lat : (typeof stop.ubicacion.latitud === 'number' ? stop.ubicacion.latitud : null);
      const lng = typeof stop.ubicacion.lng === 'number' ? stop.ubicacion.lng : (typeof stop.ubicacion.longitud === 'number' ? stop.ubicacion.longitud : null);
      if (lat === null || lng === null || lat === 0 || lng === 0) return;
      const iconImg = document.createElement('img');
      iconImg.src = 'bus-stopB.png';
      iconImg.style.width = '40px';
      iconImg.style.height = '40px';
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: this.mapInstance,
        position: { lat, lng },
        content: iconImg,
        title: stop.nombre,
      });
      this.stopMarkers.push(marker);
    });
  }

  private updateRoutePolyline(): void {
    this.initializeRouteStops();
  }

  private drawRoutePolyline(): void {
    console.log('[CitizenMap] drawRoutePolyline called. mapInstance:', this.mapInstance, 'routeStops:', this.routeStops);
    if (!this.mapInstance || this.routeStops.length === 0) {
      console.warn('[CitizenMap] No mapInstance o routeStops vacío, no se traza ruta');
      if (this.routePolyline) {
        this.routePolyline.setMap(null);
        this.routePolyline = undefined;
      }
      if (this.directionsRenderer) {
        this.directionsRenderer.setMap(null);
        this.directionsRenderer = undefined;
      }
      return;
    }

    if (this.routeStops.length > 0 && this.mapInstance) {
      console.log('[CitizenMap] Centrar mapa en primer punto:', this.routeStops[0]);
      this.mapInstance.setCenter(this.routeStops[0]);
    }

    if (this.routeStops.length > 1) {
      console.log('[CitizenMap] Trazando ruta con DirectionsService, puntos:', this.routeStops);
      this.traceRouteWithDirections(this.routeStops);
    } else {
      console.log('[CitizenMap] Solo un punto, trazando polyline recta:', this.routeStops);
      this.routePolyline = new google.maps.Polyline({
        path: this.routeStops,
        geodesic: true,
        strokeColor: '#6A994E',
        strokeOpacity: 1.0,
        strokeWeight: 4,
      });
      this.routePolyline.setMap(this.mapInstance);
    }
  }

  private traceRouteWithDirections(points: { lat: number, lng: number }[]): void {
    console.log('[CitizenMap] traceRouteWithDirections called. points:', points, 'mapInstance:', this.mapInstance);
    if (typeof google === 'undefined' || !google.maps || !google.maps.DirectionsService) {
      console.warn('[traceRouteWithDirections] Google Maps API no disponible, usando polyline recta');
      this.routePolyline = new google.maps.Polyline({
        path: points,
        geodesic: true,
        strokeColor: '#6A994E',
        strokeOpacity: 1.0,
        strokeWeight: 4,
      });
      this.routePolyline.setMap(this.mapInstance);
      return;
    }
    const directionsService = new google.maps.DirectionsService();
    if (this.directionsRenderer) {
      this.directionsRenderer.setMap(null);
    }
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#386641',
        strokeOpacity: 1.0,
        strokeWeight: 4
      }
    });
    const assignAndRoute = () => {
      if (this.mapInstance) {
        console.log('[CitizenMap] DirectionsRenderer setMap', this.mapInstance);
        this.directionsRenderer!.setMap(this.mapInstance);
      }
      const waypoints = points.slice(1, points.length - 1).map(p => ({ location: { lat: p.lat, lng: p.lng }, stopover: false }));
      console.log('[CitizenMap] DirectionsService.route', {
        origin: { lat: points[0].lat, lng: points[0].lng },
        destination: { lat: points[points.length - 1].lat, lng: points[points.length - 1].lng },
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING
      });
      directionsService.route({
        origin: { lat: points[0].lat, lng: points[0].lng },
        destination: { lat: points[points.length - 1].lat, lng: points[points.length - 1].lng },
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING
      }, (result, status) => {
        console.log('[CitizenMap] DirectionsService callback', status, result);
        if (status === 'OK' && result) {
          this.directionsRenderer!.setDirections(result);
        } else {
          console.warn('[traceRouteWithDirections] Error al trazar ruta, usando polyline recta:', status, result);
          this.routePolyline = new google.maps.Polyline({
            path: points,
            geodesic: true,
            strokeColor: '#6A994E',
            strokeOpacity: 1.0,
            strokeWeight: 4,
          });
          this.routePolyline.setMap(this.mapInstance);
        }
      });
    };
    if (this.mapInstance) {
      assignAndRoute();
    } else {
      const interval = setInterval(() => {
        if (this.mapInstance) {
          clearInterval(interval);
          assignAndRoute();
        }
      }, 100);
    }
  }


  private clearCombiMarkers(): void {
    Object.values(this.combiMarkers).forEach(marker => marker.map = null);
    this.combiMarkers = {};
    this.combisByRoute = [];
  }

  private connectCombiWebSocket(): void {
    this.clearCombiMarkers();
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
    if (!this.selectedRoute || !this.selectedRoute.id) return;
    try {
      this.ws = new WebSocket(environments.wsCombisUrl + `?routeId=${this.selectedRoute.id}`);
      this.ws.onopen = () => {
        console.log('[CitizenMap] WebSocket abierto para combis de ruta', this.selectedRoute!.id);
      };
      this.ws.onmessage = (event) => {
        let data: any[] = [];
        try {
          data = JSON.parse(event.data);
        } catch (e) {
          console.error('[CitizenMap] Error parseando datos de combis:', e, event.data);
          return;
        }
        this.updateCombiMarkers(data);
      };
      this.ws.onerror = (err) => {
        console.error('[CitizenMap] Error en WebSocket de combis:', err);
      };
      this.ws.onclose = () => {
        console.log('[CitizenMap] WebSocket de combis cerrado');
      };
    } catch (e) {
      console.error('[CitizenMap] No se pudo conectar al WebSocket de combis:', e);
    }
  }

  private updateCombiMarkers(combis: any[]): void {
    if (!this.mapInstance || typeof google === 'undefined' || !google.maps || !google.maps.marker) return;
    this.combisByRoute = combis.filter(c => c.routeId === this.selectedRoute?.id);
    Object.keys(this.combiMarkers).forEach(id => {
      if (!this.combisByRoute.find(c => c.id === id)) {
        this.combiMarkers[id].map = null;
        delete this.combiMarkers[id];
      }
    });
    this.combisByRoute.forEach(combi => {
      if (!combi.lat || !combi.lng) return;
      if (!this.combiMarkers[combi.id]) {
        const icon = document.createElement('img');
        icon.src = 'colectivo1.png';
        icon.style.width = '40px';
        icon.style.height = '40px';
        const marker = new google.maps.marker.AdvancedMarkerElement({
          map: this.mapInstance,
          position: { lat: combi.lat, lng: combi.lng },
          title: `Combi ${combi.id}`,
          content: icon,
        });
        this.combiMarkers[combi.id] = marker;
      } else {
        this.combiMarkers[combi.id].position = { lat: combi.lat, lng: combi.lng };
      }
    });
  }


  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
    this.clearCombiMarkers();
    this.stopMarkers.forEach(marker => marker.map = null);
    this.stopMarkers = [];
  }
}
