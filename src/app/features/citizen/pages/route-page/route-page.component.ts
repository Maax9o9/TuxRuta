import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CardContainerComponent } from '../../components/card-container/card-container.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { CitizenMapComponent } from '../../components/citizen-map/citizen-map.component';
import { HeaderComponent } from '../../components/header/header.component';
import { RouteRepository } from '../../../admin/data/repository/route-repository';
import { ColectiveRepository } from '../../../admin/data/repository/colective-repository';
import { Route } from '../../../admin/data/models/route.model';
import { Colective } from '../../../admin/data/models/colective.model';

@Component({
  selector: 'app-route-page',
  standalone: true,
  imports: [CardContainerComponent, SearchBarComponent, CitizenMapComponent, HeaderComponent],
  templateUrl: './route-page.component.html',
  styleUrls: ['./route-page.component.scss']
})

export class RoutePageComponent implements OnInit {
  routes: Route[] = [];
  filteredRoutes: Route[] = [];
  colectives: Colective[] = [];
  selectedRoute: Route | null = null;

  constructor(
    private routeRepository: RouteRepository,
    private colectiveRepository: ColectiveRepository,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.routeRepository.getAll().subscribe((routes) => {
      // Mapear points si vienen en path_data.points
      routes.forEach((r: any) => {
        if (!r.points && r.path_data && Array.isArray(r.path_data.points)) {
          r.points = r.path_data.points;
        }
      });
      this.routes = routes;
      this.filteredRoutes = routes;
      console.log('[RoutePage] Todas las rutas cargadas:', routes);
      routes.forEach((r, i) => {
        console.log(`[RoutePage] Ruta[${i}]: id=${r.id}, nombre=${r.nombre}, puntos=`, r.points);
      });
      this.onSearchTextChange('');
      this.cdr.detectChanges();
    });
    this.colectiveRepository.getAll().subscribe((colectives: Colective[]) => {
      this.colectives = colectives;
      this.cdr.detectChanges();
    });
  }

  onSearchTextChange(searchText: string) {
    if (searchText === undefined || searchText === null || searchText === '') {
      this.filteredRoutes = this.routes;
      this.selectedRoute = null;
      console.log('[RoutePage] Filtro vacío, mostrando todas las rutas');
      this.filteredRoutes.forEach((r, i) => {
        console.log(`[RoutePage] [Filtro vacío] Ruta[${i}]: id=${r.id}, nombre=${r.nombre}, puntos=`, r.points);
      });
    } else {
      this.filteredRoutes = this.routes.filter(route =>
        route.nombre.toLowerCase().includes(searchText.toLowerCase())
      );
      console.log('[RoutePage] Rutas filtradas:', this.filteredRoutes);
      this.filteredRoutes.forEach((r, i) => {
        console.log(`[RoutePage] [Filtrado] Ruta[${i}]: id=${r.id}, nombre=${r.nombre}, puntos=`, r.points);
      });
      if (this.filteredRoutes.length === 1) {
        const routeId = this.filteredRoutes[0].id;
        this.routeRepository.getById(routeId).subscribe((fullRoute: any) => {
          if (!fullRoute.points && fullRoute.path_data && Array.isArray(fullRoute.path_data.points)) {
            fullRoute.points = fullRoute.path_data.points;
          }
          this.selectedRoute = fullRoute;
          console.log('[RoutePage] selectedRoute (por filtro):', fullRoute);
          console.log('[RoutePage] selectedRoute.points:', fullRoute.points);
          this.cdr.detectChanges();
        });
      } else {
        this.selectedRoute = null;
        console.log('[RoutePage] Más de una ruta filtrada o ninguna, selectedRoute = null');
      }
    }
  }

  onRouteSelected(route: Route) {
    this.routeRepository.getById(route.id).subscribe((fullRoute: any) => {
      // Mapear points si vienen en path_data.points
      if (!fullRoute.points && fullRoute.path_data && Array.isArray(fullRoute.path_data.points)) {
        fullRoute.points = fullRoute.path_data.points;
      }
      this.selectedRoute = fullRoute;
      console.log('[RoutePage] selectedRoute (por card/search):', fullRoute);
      console.log('[RoutePage] selectedRoute.points:', fullRoute.points);
      this.cdr.detectChanges();
    });
  }

  getColectivesForRoute(routeId: number): Colective[] {
    return this.colectives.filter(c => c.ruta_id === routeId);
  }
}
