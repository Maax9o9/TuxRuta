import { Component, Input, OnInit, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RouteRepository } from '../../../data/repository/route-repository';
import { Route } from '../../../data/models/route.model';

@Component({
  selector: 'app-route-table',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './route-table.component.html',
  styleUrls: ['./route-table.component.scss']
})
export class RouteTableComponent implements OnInit {
  @Output() asignarParadas = new EventEmitter<number>();
  @Input() token: string | undefined;
  rutas: Route[] = [];
  selectedIndex: number | null = null;

  constructor(private repository: RouteRepository, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (!this.token) {
      this.token = localStorage.getItem('jwt_token') ?? undefined;
    }
    this.loadRutas();
  }

  private getToken(): string | undefined {
    return this.token ?? localStorage.getItem('jwt_token') ?? undefined;
  }

  loadRutas(): void {
    const tokenToUse = this.getToken();
    this.repository.getAll().subscribe({
      next: (data) => {
        this.rutas = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[RouteTable] Error al obtener rutas', err);
      }
    });
  }

  seleccionar(index: number) {
    this.selectedIndex = index;
  }

  eliminar(index: number) {
    const id = this.rutas[index].id;
    const tokenToUse = this.getToken();
    this.repository.delete(id).subscribe({
      next: () => {
        this.loadRutas();
        if (this.selectedIndex === index) {
          this.selectedIndex = null;
        }
      },
      error: (err) => {
        console.error('[RouteTable] Error al eliminar ruta', err);
      }
    });
  }

  get selectedRoute() {
    return this.selectedIndex !== null ? this.rutas[this.selectedIndex] : null;
  }
}
