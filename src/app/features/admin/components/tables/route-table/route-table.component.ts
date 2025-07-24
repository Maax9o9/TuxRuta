import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-route-table',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './route-table.component.html',
  styleUrls: ['./route-table.component.scss']
})
export class RouteTableComponent {
  rutas = [
    { nombre: 'Suchiapa-Tuxtla', paradas: 12 },
    { nombre: 'Ruta 20', paradas: 8 },
    { nombre: 'Ruta 3', paradas: 15 },
    { nombre: 'Ruta 5', paradas: 10 },
    { nombre: 'Ruta 7', paradas: 9 },
    { nombre: 'Ruta 9', paradas: 11 },
  ];

  eliminar(index: number) {
    this.rutas.splice(index, 1);
  }
}
