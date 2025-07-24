import {
  Component,
  Inject,
  PLATFORM_ID,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';
import { GoogleMapsModule, GoogleMap } from '@angular/google-maps';
import { GetRealTimeLocationUseCase } from '../../domain/get-real-time-location-use-case';
import { GenerateRealTimeLocationUseCase } from '../../domain/generate-real-time-location-use-case';
import { ColectiveLocation } from '../../data/models/colective-location.model';
import { RoutePoint } from '../../data/models/route.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-google-map',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './google_map.component.html',
  styleUrls: ['./google_map.component.scss'],
})
export class GoogleMapComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() formCompleted: boolean = false;
  @Output() routeTraced = new EventEmitter<void>();
  @Output() routeCleared = new EventEmitter<void>();

  isBrowser = false;
  zoom = 15;
  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  
  darkModeStyle = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
  ];

  mapOptions: google.maps.MapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    styles: this.darkModeStyle,
    mapId: 'DEMO_MAP_ID', 
    draggable: true, 
    scrollwheel: true, 
    disableDoubleClickZoom: false, 
    gestureHandling: 'auto', 
    clickableIcons: true,
    keyboardShortcuts: true
  };

  @ViewChild('mapRef', { static: false }) mapRef!: ElementRef;
  @ViewChild('mapElement', { static: false }) mapElement!: GoogleMap;

  private mapInstance!: google.maps.Map;
  private advancedMarker?: google.maps.marker.AdvancedMarkerElement;
  private subscription?: Subscription;
  
  public isRouteCreationMode = false;
  public routePoints: google.maps.LatLngLiteral[] = [];
  public hasValidRoute = false; 
  private routeMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
  private directionsService!: google.maps.DirectionsService;
  private directionsRenderer!: google.maps.DirectionsRenderer;
  private tempPolyline?: google.maps.Polyline;
  public mapInitialized = false;
  private pendingRouteCreationMode = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private getRealTimeLocationUseCase: GetRealTimeLocationUseCase,
    private generateRealTimeLocationUseCase: GenerateRealTimeLocationUseCase,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.subscription = this.generateRealTimeLocationUseCase.execute().subscribe((loc: ColectiveLocation) => {
        this.center = { lat: loc.latitud, lng: loc.longitud };

        if (this.mapInstance) {
          this.mapInstance.setCenter(this.center);

          if (this.advancedMarker) {
            this.advancedMarker.position = this.center;
          } else {
            this.addMarker();
          }
        }
      });
      
      setTimeout(() => {
        if (!this.mapInstance) {
          console.error('Mapa no inicializado después de 3 segundos');
          this.checkMapInitialization();
        }
      }, 3000);

      (window as any).getRoutePoints = () => this.getRoutePoints();
      (window as any).getFormattedRoutePoints = () => this.getFormattedRoutePoints();
      
      (window as any).clearRouteFromMap = () => this.clearRoute();
    }
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit llamado');
    
    if (this.isBrowser) {
      setTimeout(() => {
        this.initializeMapFallback();
      }, 0);
    }
  }

  private initializeMapFallback(): void {
    let attempts = 0;
    const maxAttempts = 10;
    
    const checkMap = () => {
      attempts++;
      console.log(`Intento ${attempts} de inicialización del mapa`);
      
      if (this.mapElement && this.mapElement.googleMap) {
        console.log('Mapa encontrado en mapElement');
        this.mapInstance = this.mapElement.googleMap;
        this.onMapInitialized(this.mapInstance);
        return;
      }
      
      if (this.mapRef && this.mapRef.nativeElement) {
        console.log('Intentando inicializar mapa manualmente');
        this.initializeMapManually();
        return;
      }
      
      if (attempts < maxAttempts) {
        setTimeout(checkMap, 500);
      } else {
        console.error('No se pudo inicializar el mapa después de', maxAttempts, 'intentos');
      }
    };
    
    setTimeout(checkMap, 100);
  }

  private initializeMapManually(): void {
    if (!this.mapRef || !this.mapRef.nativeElement) {
      console.error('No se encontró el elemento del mapa');
      return;
    }

    try {
      this.mapInstance = new google.maps.Map(this.mapRef.nativeElement, {
        ...this.mapOptions,
        center: this.center,
        zoom: this.zoom,
        mapId: 'baefa76acca7ca22e8d2ba2e' // Required for Advanced Markers
      });
      
      this.mapInitialized = true;
      console.log('Mapa inicializado manualmente con map ID');
      this.onMapInitialized(this.mapInstance);
    } catch (error) {
      console.error('Error al inicializar mapa manualmente:', error);
    }
  }

  private checkMapInitialization(): void {
    if (this.isBrowser) {
      setTimeout(() => {
        if (this.mapElement && this.mapElement.googleMap && !this.mapInstance) {
          console.log('Mapa obtenido desde ViewChild');
          this.mapInstance = this.mapElement.googleMap;
          this.mapInitialized = true;
          this.addMarker();
          this.initializeRouteServices();
          
          // Check if route creation mode was pending
          if (this.pendingRouteCreationMode) {
            this.pendingRouteCreationMode = false;
            this.isRouteCreationMode = true;
            this.setupRouteCreationMode();
          }
        }
      }, 1000);
    }
  }

  onMapReady(event: Event): void {
    console.log('onMapReady llamado con evento:', event);
    
    this.mapInstance = event as unknown as google.maps.Map;
    console.log('Mapa inicializado:', this.mapInstance);
    
    if (!this.mapInstance) {
      console.error('Error: mapInstance es null después de la inicialización');
      return;
    }
    
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.mapInitialized = true;
      
      // Configurar opciones del mapa para asegurar funcionalidad completa
      if (this.mapInstance) {
        const baseMapOptions = {
          draggable: true,
          scrollwheel: true,
          disableDoubleClickZoom: false,
          gestureHandling: 'auto',
          clickableIcons: true,
          keyboardShortcuts: true,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true
        };
        
        this.mapInstance.setOptions(baseMapOptions);
        console.log('🗺️ Mapa configurado con opciones base:', baseMapOptions);
      }
      
      this.addMarker();
      
      // Esperar un poco antes de inicializar los servicios de ruta
      setTimeout(() => {
        this.initializeRouteServices();
        
        // Check if route creation mode was pending
        if (this.pendingRouteCreationMode) {
          console.log('Activando modo de creación de ruta pendiente...');
          this.pendingRouteCreationMode = false;
          this.isRouteCreationMode = true;
          this.setupRouteCreationMode();
        }
      }, 100);
    }, 0);
  }

  // Método alternativo para inicialización del mapa
  onMapInitialized(map: google.maps.Map): void {
    console.log('onMapInitialized llamado con mapa:', map);
    
    if (!this.mapInstance && map) {
      this.mapInstance = map;
      
      // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.mapInitialized = true;
        console.log('Mapa inicializado a través de mapInitialized');
        
        this.addMarker();
        
        setTimeout(() => {
          this.initializeRouteServices();
          
          // Check if route creation mode was pending
          if (this.pendingRouteCreationMode) {
            console.log('Activando modo de creación de ruta pendiente...');
            this.pendingRouteCreationMode = false;
            this.isRouteCreationMode = true;
            this.setupRouteCreationMode();
          }
        }, 100);
      }, 0);
    }
  }

  // Método para configurar correctamente el modo de creación de ruta
  private setupRouteCreationMode(): void {
    if (this.mapInstance) {
      const mapOptions = {
        draggable: true, // Permitir arrastrar el mapa
        scrollwheel: true, // Permitir zoom con scroll
        disableDoubleClickZoom: false, // Permitir zoom con doble clic
        gestureHandling: 'auto', // Gestión automática de gestos
        clickableIcons: true,
        keyboardShortcuts: true
      };
      
      this.mapInstance.setOptions(mapOptions);
      console.log('✅ Modo de creación de ruta configurado:', mapOptions);
      console.log('✅ Arrastre habilitado:', this.mapInstance.get('draggable'));
      console.log('✅ Scroll habilitado:', this.mapInstance.get('scrollwheel'));
    } else {
      console.error('❌ No se pudo configurar: mapInstance no disponible');
    }
  }

  private initializeRouteServices(): void {
    console.log('Inicializando servicios de ruta...');
    
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#4285f4',
        strokeWeight: 4,
        strokeOpacity: 0.8,
      },
    });
    this.directionsRenderer.setMap(this.mapInstance);
    
    // Detección de clics simplificada - solo usar click event
    this.mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
      // Condiciones para agregar punto:
      if (this.isRouteCreationMode && event.latLng && this.formCompleted && this.mapInitialized) {
        console.log('✅ Agregando punto de ruta:', event.latLng.toJSON());
        event.stop(); // Prevenir propagación
        this.addRoutePoint(event.latLng);
      }
    });
    
    console.log('Servicios de ruta inicializados');
  }

  // Método para activar/desactivar el modo de creación de rutas
  public toggleRouteCreationMode(): void {
    console.log('=== TOGGLE ROUTE CREATION MODE ===');
    console.log('Estado actual:', this.isRouteCreationMode);
    console.log('Mapa inicializado:', this.mapInitialized);
    console.log('Formulario completado:', this.formCompleted);
    console.log('Instancia del mapa:', !!this.mapInstance);
    
    // Verificar si el formulario está completado antes de permitir crear rutas
    if (!this.formCompleted) {
      console.warn('❌ Formulario no completado, no se puede crear ruta');
      return;
    }
    
    if (!this.mapInitialized) {
      console.log('⏳ Mapa no inicializado, configurando modo pendiente...');
      
      // Use setTimeout to avoid change detection issues
      setTimeout(() => {
        this.pendingRouteCreationMode = !this.isRouteCreationMode;
        this.isRouteCreationMode = !this.isRouteCreationMode;
        
        // Try to get the map instance if it exists
        if (this.mapElement && this.mapElement.googleMap) {
          console.log('🔍 Intentando obtener mapa desde ViewChild...');
          this.mapInstance = this.mapElement.googleMap;
          this.mapInitialized = true;
          this.addMarker();
          this.initializeRouteServices();
          
          // Now proceed with the mode change
          this.pendingRouteCreationMode = false;
          if (this.isRouteCreationMode) {
            this.setupRouteCreationMode();
          }
        }
      }, 0);
      return;
    }
    
    // Use setTimeout to avoid change detection issues
    setTimeout(() => {
      // Toggle the mode
      this.isRouteCreationMode = !this.isRouteCreationMode;
      console.log('Modo de creación de ruta:', this.isRouteCreationMode ? 'ACTIVADO' : 'DESACTIVADO');
      
      // Apply the mode changes
      if (this.isRouteCreationMode) {
        this.setupRouteCreationMode();
      } else {
        // Restore normal map interactions
        this.mapInstance.setOptions({
          draggable: true,
          scrollwheel: true,
          disableDoubleClickZoom: false,
          gestureHandling: 'auto'
        });
        
        // Clear route if directionsRenderer is initialized
        if (this.directionsRenderer) {
          this.clearRoute();
        }
      }
      
      // Log readiness status
      if (this.isRouteCreationMode && this.mapInstance) {
        console.log('Mapa listo para crear ruta');
        console.log('Centro del mapa:', this.mapInstance.getCenter()?.toJSON());
        console.log('Zoom del mapa:', this.mapInstance.getZoom());
      }
    }, 0);
  }

  // Método para habilitar el modo de creación de rutas automáticamente
  public enableRouteCreationMode(): void {
    console.log('🎯 enableRouteCreationMode llamado:', {
      formCompleted: this.formCompleted,
      isRouteCreationMode: this.isRouteCreationMode,
      mapInitialized: this.mapInitialized
    });
    
    if (this.formCompleted && !this.isRouteCreationMode) {
      console.log('✅ Habilitando modo de creación de rutas automáticamente');
      this.toggleRouteCreationMode();
    } else {
      console.log('❌ No se puede habilitar modo de creación:', {
        formNotCompleted: !this.formCompleted,
        alreadyInMode: this.isRouteCreationMode
      });
    }
  }

  // Agregar un punto a la ruta
  private addRoutePoint(latLng: google.maps.LatLng): void {
    if (!this.mapInstance) {
      console.error('❌ Mapa no inicializado');
      return;
    }
    
    const point = { lat: latLng.lat(), lng: latLng.lng() };
    this.routePoints.push(point);
    console.log('✅ Punto agregado. Total:', this.routePoints.length);
    
    // Crear marcador para el punto
    const marker = this.createRouteMarker(point, this.routePoints.length);
    this.routeMarkers.push(marker);
    
    // Si tenemos al menos 2 puntos, calcular la ruta
    if (this.routePoints.length >= 2) {
      console.log('🛣️ Calculando ruta con', this.routePoints.length, 'puntos');
      this.calculateRoute();
    }
  }

  // Crear marcador para punto de ruta
  private createRouteMarker(position: google.maps.LatLngLiteral, index: number): google.maps.marker.AdvancedMarkerElement {
    console.log('🏷️ Creando marcador:', { position, index });
    console.log('🔍 Verificando disponibilidad de Advanced Markers:', {
      googleMaps: !!google.maps,
      marker: !!google.maps.marker,
      AdvancedMarkerElement: !!google.maps.marker?.AdvancedMarkerElement
    });
    
    if (!google.maps.marker?.AdvancedMarkerElement) {
      throw new Error('AdvancedMarkerElement no está disponible');
    }
    
    try {
      const markerElement = document.createElement('div');
      markerElement.className = 'route-marker';
      
      // Styling más robusto y visible
      markerElement.style.cssText = `
        width: 30px !important;
        height: 30px !important;
        background-color: ${index === 1 ? '#4CAF50' : index === this.routePoints.length ? '#f44336' : '#2196F3'} !important;
        border: 3px solid white !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        color: white !important;
        font-weight: bold !important;
        font-size: 14px !important;
        box-shadow: 0 4px 8px rgba(0,0,0,0.5) !important;
        cursor: pointer !important;
        position: relative !important;
        z-index: 1000 !important;
        transform: translate(-50%, -50%) !important;
      `;
      markerElement.textContent = index.toString();
      
      // Agregar atributo para facilitar debugging
      markerElement.setAttribute('data-marker-index', index.toString());
      markerElement.setAttribute('data-marker', 'route-point');
      
      console.log('🎨 Elemento del marcador creado:', markerElement);
      
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: this.mapInstance,
        position: position,
        title: `Punto ${index} de la ruta`,
        content: markerElement,
        zIndex: 1000
      });
      
      console.log('✅ Marcador creado exitosamente');
      console.log('🗺️ Marcador agregado al mapa:', !!marker.map);
      console.log('📍 Posición del marcador:', marker.position);
      console.log('🎨 Contenido del marcador:', marker.content);
      
      // Verificar que el marcador sea visible
      setTimeout(() => {
        console.log('🔍 Verificando marcador después de 1 segundo:', {
          map: !!marker.map,
          position: marker.position,
          visible: marker.content ? 'tiene contenido' : 'sin contenido'
        });
      }, 1000);
      
      // Agregar listener para eliminar punto
      marker.addListener('click', () => {
        this.removeRoutePoint(index - 1);
      });
      
      return marker;
      
    } catch (error) {
      console.error('❌ Error al crear marcador:', error);
      throw error;
    }
  }

  // Calcular ruta entre los puntos
  private calculateRoute(): void {
    if (this.routePoints.length < 2 || !this.directionsService || !this.directionsRenderer) {
      console.log('No se puede calcular ruta: puntos insuficientes o servicios no inicializados');
      return;
    }
    
    console.log('Calculando ruta con puntos:', this.routePoints);
    
    const origin = this.routePoints[0];
    const destination = this.routePoints[this.routePoints.length - 1];
    const waypoints = this.routePoints.slice(1, -1).map(point => ({
      location: point,
      stopover: true
    }));
    
    const request: google.maps.DirectionsRequest = {
      origin: origin,
      destination: destination,
      waypoints: waypoints,
      travelMode: google.maps.TravelMode.DRIVING,
      optimizeWaypoints: false, // Mantener el orden de los puntos
      avoidHighways: false,
      avoidTolls: false,
    };
    
    this.directionsService.route(request, (result, status) => {
      console.log('Resultado del cálculo de ruta:', status);
      
      if (status === google.maps.DirectionsStatus.OK && result) {
        this.directionsRenderer.setDirections(result);
        this.hasValidRoute = true;
        console.log('Ruta calculada exitosamente');
        // Emitir evento de ruta trazada
        this.routeTraced.emit();
      } else {
        console.error('Error calculando la ruta:', status);
        // Fallback: crear línea recta entre puntos
        this.createStraightLineRoute();
        this.hasValidRoute = true; // Aceptar línea recta como ruta válida
        // Emitir evento de ruta trazada
        this.routeTraced.emit();
      }
    });
  }

  // Crear línea recta como fallback
  private createStraightLineRoute(): void {
    if (this.tempPolyline) {
      this.tempPolyline.setMap(null);
    }
    
    this.tempPolyline = new google.maps.Polyline({
      path: this.routePoints,
      geodesic: true,
      strokeColor: '#FF6B6B',
      strokeOpacity: 0.8,
      strokeWeight: 3,
    });
    
    this.tempPolyline.setMap(this.mapInstance);
  }

  // Eliminar punto de la ruta
  private removeRoutePoint(index: number): void {
    if (index >= 0 && index < this.routePoints.length) {
      this.routePoints.splice(index, 1);
      
      // Eliminar marcador
      if (this.routeMarkers[index]) {
        this.routeMarkers[index].map = null;
        this.routeMarkers.splice(index, 1);
      }
      
      // Actualizar numeración de marcadores
      this.updateMarkerNumbers();
      
      // Recalcular ruta
      if (this.routePoints.length >= 2) {
        this.calculateRoute();
      } else {
        this.hasValidRoute = false;
        if (this.directionsRenderer) {
          this.directionsRenderer.setDirections({ routes: [] } as any);
        }
        if (this.tempPolyline) {
          this.tempPolyline.setMap(null);
        }
      }
    }
  }

  // Actualizar numeración de marcadores
  private updateMarkerNumbers(): void {
    this.routeMarkers.forEach((marker, index) => {
      const element = marker.content as HTMLElement;
      element.textContent = (index + 1).toString();
      
      // Actualizar color según posición
      const isStart = index === 0;
      const isEnd = index === this.routeMarkers.length - 1;
      element.style.backgroundColor = isStart ? '#4CAF50' : isEnd ? '#f44336' : '#2196F3';
    });
  }

  // Limpiar ruta
  public clearRoute(): void {
    // Use setTimeout to avoid change detection issues
    setTimeout(() => {
      this.routePoints = [];
      this.hasValidRoute = false;
      this.routeMarkers.forEach(marker => {
        marker.map = null;
      });
      this.routeMarkers = [];
      
      // Verificar que directionsRenderer esté inicializado antes de usarlo
      if (this.directionsRenderer) {
        this.directionsRenderer.setDirections({ routes: [] } as any);
      }
      
      if (this.tempPolyline) {
        this.tempPolyline.setMap(null);
      }
      console.log('Ruta limpiada');
      
      // Emitir evento de ruta limpiada
      this.routeCleared.emit();
    }, 0);
  }

  // Eliminar el último marcador
  public removeLastMarker(): void {
    if (this.routePoints.length > 0) {
      const lastIndex = this.routePoints.length - 1;
      console.log('Eliminando último marcador, índice:', lastIndex);
      
      // Use setTimeout to avoid change detection issues
      setTimeout(() => {
        // Eliminar el último punto
        this.routePoints.pop();
        
        // Eliminar el último marcador
        const lastMarker = this.routeMarkers.pop();
        if (lastMarker) {
          lastMarker.map = null;
        }
        
        // Recalcular ruta si hay suficientes puntos
        if (this.routePoints.length >= 2) {
          this.calculateRoute();
        } else {
          this.hasValidRoute = false;
          if (this.directionsRenderer) {
            this.directionsRenderer.setDirections({ routes: [] } as any);
          }
          if (this.tempPolyline) {
            this.tempPolyline.setMap(null);
          }
          // Emitir evento de ruta limpiada si ya no hay ruta válida
          this.routeCleared.emit();
        }
        
        console.log('Puntos restantes:', this.routePoints.length);
      }, 0);
    }
  }

  // Obtener puntos de la ruta
  public getRoutePoints(): google.maps.LatLngLiteral[] {
    return [...this.routePoints];
  }

  // Obtener puntos de ruta en formato RoutePoint para el modelo
  public getFormattedRoutePoints(): RoutePoint[] {
    return this.routePoints.map((point, index) => ({
      lat: point.lat,
      lng: point.lng,
      order: index + 1
    }));
  }

  // Finalizar creación de ruta
  public finishRouteCreation(): void {
    if (!this.hasValidRoute || this.routePoints.length < 2) {
      console.error('No se puede finalizar: no hay una ruta válida trazada');
      return;
    }
    
    // Use setTimeout to avoid change detection issues
    setTimeout(() => {
      this.isRouteCreationMode = false;
      
      const routePoints: RoutePoint[] = this.routePoints.map((point, index) => ({
        lat: point.lat,
        lng: point.lng,
        order: index + 1
      }));

      const routeRequest = {
        name: `Ruta ${new Date().toLocaleDateString()}`,
        description: `Ruta creada con ${routePoints.length} puntos`,
        points: routePoints
      };

      console.log('Ruta trazada exitosamente:', routeRequest);
      console.log('Puntos de la ruta:', routePoints);
      
      // Emitir evento para notificar al componente padre
      this.routeTraced.emit();
    }, 0);
  }

  private addMarker(): void {
    try {
      console.log('Añadiendo marcador en posición:', this.center);
      
      const icon = document.createElement('img');
      icon.src = 'combi.png';
      icon.style.width = '40px';
      icon.style.height = '40px';
      
      // Agregar manejo de errores para la imagen
      icon.onerror = () => {
        console.warn('No se pudo cargar combi.png, usando marcador por defecto');
      };

      if (this.mapInstance && google.maps.marker) {
        this.advancedMarker = new google.maps.marker.AdvancedMarkerElement({
          map: this.mapInstance,
          position: this.center,
          title: 'Ubicación actual',
          content: icon,
        });
        console.log('Marcador añadido exitosamente');
      } else {
        console.error('No se pudo crear el marcador: mapInstance o google.maps.marker no disponible');
      }
    } catch (error) {
      console.error('Error al añadir marcador:', error);
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.clearRoute();
  }
}
