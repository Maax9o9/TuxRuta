import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { AdminUserRepository } from '../../data/repository/admin-user-repository';

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
  isTablasExpanded: boolean = false;

  faRightFromBracket = faRightFromBracket;

  constructor(private router: Router, private adminUserRepository: AdminUserRepository) {
    this.currentRoute = this.router.url;
  }

  navigateTo(route: string): void {
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

  toggleTablas(): void {
    this.isTablasExpanded = !this.isTablasExpanded;
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
      this.router.navigate([route]);
      this.currentRoute = route;
    } else {
      console.log(`Página para ${option} aún no implementada. Ruta: ${route}`);
    }
  }

  logout(): void {
    this.adminUserRepository.removeToken();
    this.adminUserRepository.removeUser();
    localStorage.clear(); 
    this.router.navigate(['/new-login']);
  }
}
