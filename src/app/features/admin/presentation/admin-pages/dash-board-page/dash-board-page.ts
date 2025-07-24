import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dash-board-page.html',
  styleUrls: ['./dash-board-page.scss']
})
export class DashboardPageComponent {
  currentTime = new Date().toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit'
  });

  metrics = [
    {
      title: 'Total de rutas',
      value: '85',
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
      route: '/admin/create-colective'
    }
  ];

  constructor() {
    // Update time every minute
    setInterval(() => {
      this.currentTime = new Date().toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit'
      });
    }, 60000);
  }
}
