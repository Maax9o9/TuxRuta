import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RouteRepository } from '../../../data/repository/route-repository';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dash-board-page.html',
  styleUrls: ['./dash-board-page.scss'],
  providers: [RouteRepository]
})
export class DashboardPageComponent {
  currentTime = new Date().toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit'
  });

  metrics = [
    {
      title: 'Total de rutas',
      value: '...', 
      subtitle: 'Rutas activas'
    },
    {
      title: 'Velocidad promedio',
      value: '53 km/h',
      subtitle: 'Última semana'
    },
    {
      title: 'Promedio de pasajeros',
      value: '14 p/unidad',
      subtitle: 'Promedio diario'
    },
    {
      title: 'Hora pico',
      value: '7:23 AM',
      subtitle: 'Mayor tráfico de pasajeros'
    }
  ];

  quickActions = [
    {
      title: 'Crear Rutas',
      description: 'Agregar nueva ruta al sistema',
      route: '/admin/add-routes'
    },
    {
      title: 'Crear Colectivo',
      description: 'Registrar nuevo vehículo',
      route: '/admin/add-colectives'
    }
  ];

  constructor(private routeRepository: RouteRepository, private cdr: ChangeDetectorRef) {
    setInterval(() => {
      this.currentTime = new Date().toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit'
      });
    }, 60000);

    this.routeRepository.getAll().subscribe((routes) => {
      let count = 0;
      if (Array.isArray(routes)) {
        for (let i = 0; i < routes.length; i++) {
          count++;
        }
      }
      this.metrics[0].value = count.toString();
      this.cdr.detectChanges();
    });
  }
}
