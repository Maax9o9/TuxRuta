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
  // Responsive sidebar state: collapsed=true => hidden on small screens
  isCollapsed: boolean = true;

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    // add/remove body class so page content can shift on mobile
    if (typeof document !== 'undefined') {
      if (this.isCollapsed) {
        document.body.classList.add('sidebar-collapsed-mobile');
      } else {
        document.body.classList.remove('sidebar-collapsed-mobile');
      }
    }
  }

  iconPaths = {
    dashboard: 'dashboard1.png',
    metricas: 'metricas.png', 
    colectivos: 'colectivo1.png', 
    rutas: 'rutas.png', 
    paradas: 'station.png', 
    logout: '' 
  };

  getIconStyle(): { [key: string]: string } {
    return {
      width: '24px',
      height: '24px',
      display: 'inline-block',
      objectFit: 'contain',
      marginRight: '12px'
    };
  }
  currentRoute: string = '';
  isMetricasExpanded: boolean = false;
  isColectivosExpanded: boolean = false;
  isRutasExpanded: boolean = false;
  isParadasExpanded: boolean = false;

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
    // Close sidebar on mobile after navigation for better UX
    this.isCollapsed = true;
    if (typeof document !== 'undefined') {
      document.body.classList.add('sidebar-collapsed-mobile');
    }
  }

  ngOnInit(): void {
    // ensure body class reflects initial collapsed state on client
    if (typeof document !== 'undefined') {
      if (this.isCollapsed) document.body.classList.add('sidebar-collapsed-mobile');
    }
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('sidebar-collapsed-mobile');
    }
  }

  isActiveRoute(route: string): boolean {
    return this.currentRoute.includes(route);
  }

  toggleMetricas(): void {
    this.isMetricasExpanded = !this.isMetricasExpanded;
    if (this.isMetricasExpanded) {
      this.isColectivosExpanded = false;
      this.isRutasExpanded = false;
      this.isParadasExpanded = false;
    }
  }

  toggleColectivos(): void {
    this.isColectivosExpanded = !this.isColectivosExpanded;
    if (this.isColectivosExpanded) {
      this.isMetricasExpanded = false;
      this.isRutasExpanded = false;
      this.isParadasExpanded = false;
    }
  }

  toggleRutas(): void {
    this.isRutasExpanded = !this.isRutasExpanded;
    if (this.isRutasExpanded) {
      this.isMetricasExpanded = false;
      this.isColectivosExpanded = false;
      this.isParadasExpanded = false;
    }
  }

  toggleParadas(): void {
    this.isParadasExpanded = !this.isParadasExpanded;
    if (this.isParadasExpanded) {
      this.isMetricasExpanded = false;
      this.isColectivosExpanded = false;
      this.isRutasExpanded = false;
    }
  }
  // Removed misplaced code block

  onSubmenuItemClick(option: string): void {
    // Example: handle submenu item click for metricas, colectivos, rutas, paradas
    // You can expand this logic as needed for other submenus
    const metricasRouteMap: { [key: string]: string } = {
      'Alta Ocupación': '/admin/metrics/high-occupancy',
      'Velocidad Promedio': '/admin/metrics/average-speed',
      'Intervalo de Confianza': '/admin/metrics/confidence-interval',
      'Total de Pasajeros': '/admin/metrics/passengers-total',
      'Horas Pico': '/admin/metrics/rush-hour',
      'Promedio de Viaje': '/admin/metrics/travel-average'
    };
    const colectivosRouteMap: { [key: string]: string } = {
      'Tabla de Colectivos': '/admin/colectivos/table',
      'Crear Colectivo': '/admin/colectivos/create'
    };
    const rutasRouteMap: { [key: string]: string } = {
      'Tabla de Rutas': '/admin/rutas/table',
      'Crear Ruta': '/admin/rutas/create'
    };
    const paradasRouteMap: { [key: string]: string } = {
      'Tabla de Paradas': '/admin/paradas/table'
    };
    let route = metricasRouteMap[option] || colectivosRouteMap[option] || rutasRouteMap[option] || paradasRouteMap[option];
    if (route) {
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
    this.router.navigate(['/home']);
  }
}
