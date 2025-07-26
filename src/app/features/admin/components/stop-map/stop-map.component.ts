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
import { Route } from '../../data/models/route.model';
import { RouteRepository } from '../../data/repository/route-repository';

@Component({
  selector: 'app-stop-map',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule, CreateStopFormComponent],
  templateUrl: './stop-map.component.html',
  styleUrls: ['./stop-map.component.scss'],
})
export class StopMapComponent implements OnInit, AfterViewInit {
  stopsByRoute: Stop[] = [];
  // Guarda los puntos originales de la ruta para DirectionsService
  routePoints: { lat: number; lng: number; order: number }[] = [];
  polylinePath: google.maps.LatLngLiteral[] = [];
  polylineOptions: google.maps.PolylineOptions = {
    strokeColor: '#A7C957',
    strokeOpacity: 0.9,
    strokeWeight: 5,
    clickable: false,
    editable: false,
    geodesic: false
  };
  directionsRenderer: google.maps.DirectionsRenderer | null = null;
  onMapClick(event: google.maps.MapMouseEvent) {
    console.log('[ANGULAR mapClick]', event, event.latLng ? event.latLng.toJSON() : null, 'showStopForm:', this.showStopForm);
    if (event.latLng && !this.showStopForm) {
      this.addStopMarker(event.latLng);
    }
  }
  @Input() token: string | undefined;
  @Input() rutaId: number | null = null;
  isBrowser = false;
  zoom = 15;
  center: google.maps.LatLngLiteral = { lat: 16.7531, lng: -93.1156 }; // Se actualizará a la ubicación del usuario si se permite
  geolocationDenied: boolean = false;

  @ViewChild('mapElement', { static: false }) mapElement!: GoogleMap;
  public mapInstance!: google.maps.Map;

  stopMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
  tempMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
  markerIconUrl: string = '/bus-stopR.png';

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
  private mapReady = false;


  // No-op: Centralizado en ensureMarkers
  private checkAndDrawStopMarkers() {
    // Intencionalmente vacío para compatibilidad
  }

  // Método para asegurar que los marcadores se agregan solo cuando el canvas está visible y los datos listos
  private ensureMarkers = () => {
    if (!this.mapInstance) return;
    const mapDiv = this.mapInstance.getDiv();
    // Buscar el canvas interno de Google Maps
    const canvas = mapDiv ? mapDiv.querySelector('canvas') : null;
    if (mapDiv && (mapDiv.offsetWidth === 0 || mapDiv.offsetHeight === 0)) {
      mapDiv.style.width = '100%';
      mapDiv.style.height = '400px';
      mapDiv.style.minHeight = '400px';
      mapDiv.style.display = 'block';
      // log removido para no llenar la consola
    }
    if (
      mapDiv && mapDiv.offsetWidth > 0 && mapDiv.offsetHeight > 0 &&
      canvas && canvas.offsetWidth > 0 && canvas.offsetHeight > 0
    ) {
      console.log('[DEBUG] Canvas interno visible:', canvas.offsetWidth, canvas.offsetHeight);
      this.tryAddStopsByRouteMarkers();
    } else {
      // log removido para no llenar la consola
      setTimeout(this.ensureMarkers, 200);
    }
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private stopRepository: StopRepository,
    private routeRepository: RouteRepository
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    console.log('[StopMap] Constructor this:', this);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      // Limpiar solo marcadores y paradas temporales, no las asociadas a la ruta
      this.stops = [];
      this.stopMarkers = [];
      this.tempMarkers = [];
      this.currentOrder = 1;
      this.mapReady = false;

      if (this.rutaId != null) {
        // Primero obtenemos las paradas, luego la ruta, y solo después de trazar la ruta mostramos las paradas
        this.stopRepository.getByRouteId(this.rutaId, this.token).subscribe({
          next: (stops) => {
            if (Array.isArray(stops)) {
              this.stopsByRoute = stops;
            } else if (stops && typeof stops === 'object' && 'paradas' in stops && Array.isArray((stops as any).paradas)) {
              this.stopsByRoute = (stops as { paradas: Stop[] }).paradas;
            } else {
              this.stopsByRoute = [];
            }
            console.log('[StopMap] Paradas asociadas a la ruta:', this.stopsByRoute);
            // Ahora obtenemos la ruta y la trazamos
            this.routeRepository.getById(this.rutaId!).subscribe({
              next: (route: any) => {
                let points: { lat: number; lng: number; order: number }[] = [];
                if (Array.isArray(route.points)) {
                  points = route.points;
                } else if (route.path_data && Array.isArray(route.path_data.points)) {
                  points = route.path_data.points;
                }
                if (points.length > 0) {
                  const orderedPoints = [...points].sort((a: any, b: any) => a.order - b.order);
                  this.routePoints = orderedPoints;
                  this.center = { lat: orderedPoints[0].lat, lng: orderedPoints[0].lng };
                  if (this.mapInstance && this.routePoints.length > 1) {
                    this.traceRouteWithDirections([...this.routePoints]);
                  } else if (this.mapInstance && this.routePoints.length === 1) {
                    this.polylinePath = points.map((p: any) => ({ lat: p.lat, lng: p.lng }));
                    // Aseguramos mostrar las paradas aunque solo haya un punto
                    setTimeout(() => this.ensureMarkers(), 0);
                  }
                } else {
                  this.routePoints = [];
                  console.warn('[StopMap] Ruta sin puntos válidos:', route);
                  // Aseguramos mostrar las paradas aunque la ruta sea inválida
                  setTimeout(() => this.ensureMarkers(), 0);
                }
              },
              error: (err) => {
                console.error('[StopMap] Error al obtener ruta para trazar:', err);
                setTimeout(() => this.ensureMarkers(), 0);
              }
            });
          },
          error: (err) => {
            console.error('[StopMap] Error al obtener paradas por ruta:', err);
          }
        });
      } else {
        this.getCurrentLocation();
      }
    }
  }

  private traceRouteWithDirections(points: { lat: number, lng: number }[]): void {
    if (typeof google === 'undefined' || !google.maps || !google.maps.DirectionsService) {
      console.warn('[traceRouteWithDirections] Google Maps API no disponible, usando polyline recta');
      this.polylinePath = points.map(p => ({ lat: p.lat, lng: p.lng }));
      // Siempre mostrar las paradas aunque DirectionsService no esté disponible
      setTimeout(() => this.ensureMarkers(), 0);
      return;
    }
    const directionsService = new google.maps.DirectionsService();
    if (this.directionsRenderer) {
      this.directionsRenderer.setMap(null);
    }
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#A7C957',
        strokeOpacity: 0.9,
        strokeWeight: 5
      }
    });
    const assignAndRoute = () => {
      if (this.mapElement && this.mapElement.googleMap) {
        this.directionsRenderer!.setMap(this.mapElement.googleMap);
      } else {
        this.directionsRenderer!.setMap(this.mapInstance);
      }
      const waypoints = points.slice(1, points.length - 1).map(p => ({ location: { lat: p.lat, lng: p.lng }, stopover: false }));
      directionsService.route({
        origin: { lat: points[0].lat, lng: points[0].lng },
        destination: { lat: points[points.length - 1].lat, lng: points[points.length - 1].lng },
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING
      }, (result, status) => {
        if (status === 'OK' && result) {
          this.directionsRenderer!.setDirections(result);
        } else {
          console.warn('[traceRouteWithDirections] Error al trazar ruta, usando polyline recta:', status, result);
          this.polylinePath = points.map(p => ({ lat: p.lat, lng: p.lng }));
        }
        // Siempre mostrar las paradas después de intentar trazar la ruta
        setTimeout(() => this.ensureMarkers(), 0);
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

  // Removed: getAllStopsWithToken, now handled in ngOnInit with subscribe

  // ...existing code...

  ngAfterViewInit(): void {
    // Espera a que Google Maps esté disponible
    this.waitForGoogleMapsAPI().then(() => {
      if (this.mapElement && this.mapElement.googleMap) {
        this.mapInstance = this.mapElement.googleMap;
        this.mapReady = true;
        const mapDiv = this.mapInstance.getDiv();
        console.log('[DEBUG] mapInstance:', this.mapInstance, 'mapDiv:', mapDiv, 'visible:', mapDiv && mapDiv.offsetWidth, mapDiv && mapDiv.offsetHeight);
        if (mapDiv && (mapDiv.offsetWidth === 0 || mapDiv.offsetHeight === 0)) {
          mapDiv.style.width = '100%';
          mapDiv.style.height = '400px';
          mapDiv.style.minHeight = '400px';
          mapDiv.style.display = 'block';
          console.warn('[DEBUG] Forzando tamaño del mapa por SSR/hidratación');
        }
            // Si ya tienes puntos de ruta, traza la ruta
            if (this.routePoints && this.routePoints.length > 1) {
              this.traceRouteWithDirections([...this.routePoints]);
            }
            // Removed: Ensure markers call as it's no longer necessary
      }
    });
  }

  private tryAddStopsByRouteMarkers(): void {
    console.log('[tryAddStopsByRouteMarkers] called', {
      mapInstance: !!this.mapInstance,
      mapType: this.mapInstance ? this.mapInstance.constructor.name : null,
      stopsByRoute: this.stopsByRoute,
      stopMarkers: this.stopMarkers
    });
    if (!this.mapInstance) {
      console.warn('[tryAddStopsByRouteMarkers] mapInstance not ready');
      return;
    }
    // Log del DOM del mapa
    const mapDiv = this.mapInstance.getDiv();
    console.log('[DEBUG] tryAddStopsByRouteMarkers: mapDiv:', mapDiv, 'visible:', mapDiv && mapDiv.offsetWidth, mapDiv && mapDiv.offsetHeight, 'display:', mapDiv && mapDiv.style.display);
    // Limpiar todos los marcadores definitivos de paradas
    this.stopMarkers.forEach((marker) => marker.map = null);
    this.stopMarkers = [];
    if (!this.stopsByRoute || this.stopsByRoute.length === 0) {
      console.warn('[tryAddStopsByRouteMarkers] stopsByRoute empty or not ready');
      return;
    }
    console.log('[DEBUG] stopsByRoute before marker processing:', this.stopsByRoute);
    let firstLatLng: google.maps.LatLngLiteral | null = null;
    this.stopsByRoute.forEach((stop, idx) => {
      const lat = (typeof stop.ubicacion.lat === 'number') ? stop.ubicacion.lat :
                  (typeof stop.ubicacion.latitud === 'number' ? stop.ubicacion.latitud : null);
      const lng = (typeof stop.ubicacion.lng === 'number') ? stop.ubicacion.lng :
                  (typeof stop.ubicacion.longitud === 'number' ? stop.ubicacion.longitud : null);
      console.log(`[DEBUG] Marker ${idx} nombre: ${stop.nombre}, ubicacion:`, stop.ubicacion, 'lat:', lat, 'lng:', lng);
      if (lat === null || lng === null || lat === 0 || lng === 0) {
        console.warn(`[DEBUG] Marker ${idx} descartado por lat/lng inválido:`, { lat, lng, nombre: stop.nombre, ubicacion: stop.ubicacion });
        return;
      }
      const iconImg = document.createElement('img');
      iconImg.src = this.markerIconUrl;
      iconImg.style.width = '40px';
      iconImg.style.height = '40px';
      iconImg.onload = () => console.log('[MarkerIcon] Imagen cargada correctamente:', iconImg.src);
      iconImg.onerror = () => console.error('[MarkerIcon] Error al cargar imagen:', iconImg.src);
      console.log(`[DEBUG] Marker ${idx} agregado:`, { lat, lng, nombre: stop.nombre, ubicacion: stop.ubicacion });
      if (firstLatLng === null) firstLatLng = { lat, lng };
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: this.mapInstance,
        position: { lat, lng },
        content: iconImg,
        title: stop.nombre,
      });
      this.stopMarkers.push(marker);
    });
    // Centrar el mapa en la primera parada y ajustar zoom
    if (firstLatLng) {
      this.mapInstance.setCenter(firstLatLng);
      this.mapInstance.setZoom(16);
    }
    // Log overlays/markers en el mapa
    if (this.mapInstance && (window as any).google && (window as any).google.maps) {
      // No hay API pública para overlays, pero logueamos el estado del mapa
      console.log('[DEBUG] mapInstance after markers:', this.mapInstance, 'stopMarkers:', this.stopMarkers);
    }
    console.log('[tryAddStopsByRouteMarkers] Markers after operation:', this.stopMarkers);
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
    if (!navigator.geolocation) {
      this.geolocationDenied = true;
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        this.geolocationDenied = false;
        // Si el mapa ya está listo, centra el mapa; si no, espera a que esté listo
        if (this.mapInstance) {
          this.mapInstance.setCenter(this.center);
        } else {
          // Espera a que el mapa esté listo y luego centra
          const interval = setInterval(() => {
            if (this.mapInstance) {
              this.mapInstance.setCenter(this.center);
              clearInterval(interval);
            }
          }, 100);
        }
      },
      (error) => {
        this.geolocationDenied = true;
        console.warn('No se pudo obtener la ubicación actual, usando centro por defecto.', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  addStopMarker(latLng: google.maps.LatLng | google.maps.LatLngLiteral): void {
    if (this.showStopForm) {
      console.log('[addStopMarker] Ignorado: modal ya abierto');
      return;
    }
    const coords = latLng instanceof google.maps.LatLng
      ? { lat: latLng.lat(), lng: latLng.lng() }
      : latLng;
    console.log('[addStopMarker] Abriendo modal para coords:', coords);
    const iconImg = document.createElement('img');
    iconImg.src = this.markerIconUrl;
    iconImg.style.width = '40px';
    iconImg.style.height = '40px';
    const tempMarker = new google.maps.marker.AdvancedMarkerElement({
      map: this.mapInstance,
      position: coords,
      content: iconImg,
      title: 'Parada temporal',
    });
    this.tempMarkers.push(tempMarker);
    this.clickedLatLng = coords;
    this.showStopForm = true;
    if (!this.routePoints || this.routePoints.length === 0) {
      const allCoords = [...this.stopMarkers, ...this.tempMarkers].map((m: any) => {
        const pos = m.position as google.maps.LatLng | google.maps.LatLngLiteral;
        return pos instanceof google.maps.LatLng ? { lat: pos.lat(), lng: pos.lng() } : pos;
      });
      if (allCoords.length > 1) {
        this.traceRouteWithDirections(allCoords);
      }
    }
  }

  createStop(stopData: Omit<Stop, 'id'>) {
    if (!this.clickedLatLng) {
      console.log('[createStop] No hay clickedLatLng, no se puede crear parada');
      return;
    }
    console.log('[createStop] Guardando parada en:', this.clickedLatLng, 'con datos:', stopData);
    let latitud = (this.clickedLatLng as any).latitud ?? (this.clickedLatLng as any).lat;
    let longitud = (this.clickedLatLng as any).longitud ?? (this.clickedLatLng as any).lng;
    if (typeof latitud !== 'number' || typeof longitud !== 'number') {
      console.error('[createStop] clickedLatLng no tiene latitud/longitud válidos:', this.clickedLatLng);
      return;
    }
    const ubicacion = {
      latitud,
      longitud,
      order: this.currentOrder
    };
    const stopToSave = {
      ...stopData,
      ubicacion,
      ruta_id: this.rutaId ?? 0
    };
    this.stopRepository.create(stopToSave, this.token).subscribe({
      next: (newStop) => {
        // Limpiar marcadores temporales al guardar
        this.tempMarkers.forEach((marker) => marker.map = null);
        this.tempMarkers = [];
        if (newStop) {
          this.stops.push(newStop);
          this.currentOrder++;
        }
        // Actualizar la lista de paradas asociadas a la ruta
        if (this.rutaId != null) {
          this.stopRepository.getByRouteId(this.rutaId, this.token).subscribe({
            next: (stops) => {
              if (Array.isArray(stops)) {
                this.stopsByRoute = stops;
              } else if (stops && typeof stops === 'object' && 'paradas' in stops && Array.isArray((stops as any).paradas)) {
                this.stopsByRoute = (stops as { paradas: Stop[] }).paradas;
              } else {
                this.stopsByRoute = [];
              }
              // REMOVED: this.tryAddStopsByRouteMarkers();
            },
            error: (err) => {
              console.error('[StopMap] Error al refrescar paradas por ruta:', err);
            }
          });
        }
        this.showStopForm = false;
        this.clickedLatLng = null;
      },
      error: (err) => {
        this.tempMarkers.forEach((marker) => marker.map = null);
        this.tempMarkers = [];
        this.showStopForm = false;
        this.clickedLatLng = null;
      }
    });
  }

  removeLastStop(): void {
    const lastTemp = this.tempMarkers.pop();
    if (lastTemp) {
      lastTemp.map = null;
    }
  }

  clearAllStops(): void {
    this.stopMarkers.forEach((marker) => marker.map = null);
    this.stopMarkers = [];
    this.tempMarkers.forEach((marker) => marker.map = null);
    this.tempMarkers = [];
  }

  onCloseStopForm(): void {
    this.showStopForm = false;
    this.clickedLatLng = null;
    if (this.tempMarkers.length > 0) {
      const lastMarker = this.tempMarkers[this.tempMarkers.length - 1];
      if (lastMarker && !this.stops.find(s => s.ubicacion.lat === (lastMarker.position as any)?.lat && s.ubicacion.lng === (lastMarker.position as any)?.lng)) {
        lastMarker.map = null;
        this.tempMarkers.pop();
      }
    }
  }
}
