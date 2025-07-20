import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule], 
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss']
})
export class AdminSidebarComponent {
  currentRoute: string = '';
  isMetricasExpanded: boolean = false;

  faRightFromBracket = faRightFromBracket;

  constructor(private router: Router) {
    this.currentRoute = this.router.url;
  }

  navigateTo(route: string): void {
    // Temporary handling for metrics routes until they are created
    if (route.includes('/admin/metricas/')) {
      console.log(`Navegando a: ${route} (Ruta pendiente por crear)`);
      return;
    }
    
    this.router.navigate([route]);
    this.currentRoute = route;
  }

  isActiveRoute(route: string): boolean {
    return this.currentRoute.includes(route);
  }

  toggleMetricas(): void {
    this.isMetricasExpanded = !this.isMetricasExpanded;
  }

  onSubmenuItemClick(option: string): void {
    console.log(`Navigating to metric: ${option}`);
    
    // Mapear las opciones a rutas específicas
    const routeMap: { [key: string]: string } = {
      'Alta Ocupación': '/admin/metrics/high-occupancy',
      'Distribución Normal': '/admin/metrics/normal-distribution', 
      'Intervalo de Confianza': '/admin/metrics/confidence-interval',
      'Total de Pasajeros': '/admin/metrics/passengers-total',
      'Horas Pico': '/admin/metrics/rush-hour',
      'Promedio de Viaje': '/admin/metrics/travel-average'
    };
    
    const route = routeMap[option];
    if (route === '/admin/metrics/confidence-interval' || 
        route === '/admin/metrics/high-occupancy' || 
        route === '/admin/metrics/normal-distribution' ||
        route === '/admin/metrics/passengers-total' ||
        route === '/admin/metrics/rush-hour' ||
        route === '/admin/metrics/travel-average') {
      // Todas las páginas de métricas ya están implementadas
      this.router.navigate([route]);
      this.currentRoute = route;
    } else {
      // Esto ya no debería ocurrir, pero lo mantenemos por seguridad
      console.log(`Página para ${option} aún no implementada. Ruta: ${route}`);
    }
  }

  logout(): void {
    console.log('Cerrar sesión');
    this.router.navigate(['/new-login']); 
  }
}
