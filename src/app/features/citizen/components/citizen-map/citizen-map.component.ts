import {
  Component,
  Inject,
  PLATFORM_ID,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef
} from '@angular/core';
import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';
import { GoogleMapsModule, GoogleMap } from '@angular/google-maps';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-citizen-map',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './citizen-map.component.html',
  styleUrls: ['./citizen-map.component.scss'],
})
export class CitizenMapComponent implements OnInit, OnDestroy, AfterViewInit {
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
  private combiMarker?: google.maps.marker.AdvancedMarkerElement;
  private subscription?: Subscription;
  private simulationSubscription?: Subscription;
  
  // Propiedades para la simulación de la combi
  private routePolyline?: google.maps.Polyline;
  private routeStops: google.maps.LatLngLiteral[] = [];
  private currentStopIndex = 0;
  private isSimulationRunning = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
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
      this.addCombiMarker();
      this.drawRoutePolyline();
      
      setTimeout(() => {
        console.log('🚀 CitizenMap: Iniciando simulación automática...');
        this.startCombiSimulation();
      }, 1000);
      
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
    this.routeStops = [
      { lat: -17.3935, lng: -66.1570 }, // Centro
      { lat: -17.3850, lng: -66.1500 }, // Zona Norte
      { lat: -17.3800, lng: -66.1450 }, // Parada 1
      { lat: -17.3750, lng: -66.1400 }, // Parada 2
      { lat: -17.3700, lng: -66.1350 }, // Parada 3
      { lat: -17.3650, lng: -66.1300 }, // Parada 4
      { lat: -17.3600, lng: -66.1250 }, // Terminal
      { lat: -17.3650, lng: -66.1300 }, // Regreso
      { lat: -17.3700, lng: -66.1350 }, // Regreso
      { lat: -17.3750, lng: -66.1400 }, // Regreso
      { lat: -17.3800, lng: -66.1450 }, // Regreso
      { lat: -17.3850, lng: -66.1500 }, // Regreso
    ];
    console.log('CitizenMap: Paradas de ruta inicializadas:', this.routeStops.length, 'paradas');
  }

  private drawRoutePolyline(): void {
    if (!this.mapInstance || this.routeStops.length === 0) return;

    if (typeof google === 'undefined' || !google.maps) {
      console.error('❌ CitizenMap: Google Maps API no está disponible para polyline');
      return;
    }

    this.routePolyline = new google.maps.Polyline({
      path: this.routeStops,
      geodesic: true,
      strokeColor: '#6A994E',
      strokeOpacity: 1.0,
      strokeWeight: 4,
    });

    this.routePolyline.setMap(this.mapInstance);
    console.log('CitizenMap: Ruta dibujada en el mapa');
  }

  private addCombiMarker(): void {
    if (!this.mapInstance || this.routeStops.length === 0) return;

    if (typeof google === 'undefined' || !google.maps || !google.maps.marker) {
      console.error('❌ CitizenMap: Google Maps marker API no está disponible');
      return;
    }

    try {
      console.log('CitizenMap: Añadiendo marcador de combi');
      
      // Usar la misma imagen que el componente admin
      const icon = document.createElement('img');
      icon.src = 'combi.png';
      icon.style.width = '40px';
      icon.style.height = '40px';
      
      // Agregar manejo de errores para la imagen igual que en el admin
      icon.onerror = () => {
        console.warn('CitizenMap: No se pudo cargar combi.png, usando marcador por defecto');
        // Si falla la imagen, crear un marcador personalizado con CSS como fallback
        const markerDiv = document.createElement('div');
        markerDiv.style.width = '40px';
        markerDiv.style.height = '40px';
        markerDiv.style.backgroundColor = '#6A994E';
        markerDiv.style.borderRadius = '50%';
        markerDiv.style.border = '3px solid white';
        markerDiv.style.display = 'flex';
        markerDiv.style.alignItems = 'center';
        markerDiv.style.justifyContent = 'center';
        markerDiv.style.fontSize = '20px';
        markerDiv.innerHTML = '🚐';
        
        if (this.combiMarker) {
          this.combiMarker.content = markerDiv;
        }
      };

      this.combiMarker = new google.maps.marker.AdvancedMarkerElement({
        map: this.mapInstance,
        position: this.routeStops[0],
        title: 'Combi en tiempo real',
        content: icon,
      });
      
      console.log('CitizenMap: Marcador de combi añadido exitosamente');
    } catch (error) {
      console.error('CitizenMap: Error al añadir marcador de combi:', error);
    }
  }

  private startCombiSimulation(): void {
    if (this.isSimulationRunning) return;
    
    this.isSimulationRunning = true;
    console.log('CitizenMap: Iniciando simulación de combi');
    
    this.simulationSubscription = interval(3000).subscribe(() => {
      this.moveCombiToNextStop();
    });
  }

  private moveCombiToNextStop(): void {
    if (!this.combiMarker || this.routeStops.length === 0) return;

    this.currentStopIndex = (this.currentStopIndex + 1) % this.routeStops.length;
    const nextPosition = this.routeStops[this.currentStopIndex];
    
    this.animateMarkerMovement(nextPosition);
    
    console.log(`CitizenMap: Combi movida a parada ${this.currentStopIndex + 1}/${this.routeStops.length}`);
  }

  private animateMarkerMovement(targetPosition: google.maps.LatLngLiteral): void {
    if (!this.combiMarker) return;

    const currentPosition = this.combiMarker.position as google.maps.LatLngLiteral;
    const steps = 20;
    let stepCount = 0;

    const latIncrement = (targetPosition.lat - currentPosition.lat) / steps;
    const lngIncrement = (targetPosition.lng - currentPosition.lng) / steps;

    const animate = () => {
      if (stepCount < steps && this.combiMarker) {
        const newLat = currentPosition.lat + (latIncrement * stepCount);
        const newLng = currentPosition.lng + (lngIncrement * stepCount);
        
        this.combiMarker.position = { lat: newLat, lng: newLng };
        stepCount++;
        
        setTimeout(animate, 50);
      }
    };

    animate();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.simulationSubscription?.unsubscribe();
    this.isSimulationRunning = false;
  }
}
