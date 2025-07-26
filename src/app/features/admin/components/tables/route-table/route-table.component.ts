import { Component, Input, OnInit, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { ConfirmDeleteAlertComponent } from '../../alerts/confirm-delete-alert/confirm-delete-alert.component';
import { DeleteAlertComponent } from '../../alerts/delete-alert/delete-alert.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RouteRepository } from '../../../data/repository/route-repository';
import { Route } from '../../../data/models/route.model';

@Component({
  selector: 'app-route-table',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfirmDeleteAlertComponent, DeleteAlertComponent],
  templateUrl: './route-table.component.html',
  styleUrls: ['./route-table.component.scss']
})
export class RouteTableComponent implements OnInit {
  showConfirmDelete = false;
  showDeleteAlert = false;
  indexToDelete: number | null = null;
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

  onDeleteClick(index: number) {
    this.indexToDelete = index;
    this.showConfirmDelete = true;
  }

  onCancelDelete() {
    this.showConfirmDelete = false;
    this.indexToDelete = null;
  }

  onConfirmDelete() {
    if (this.indexToDelete !== null) {
      const id = this.rutas[this.indexToDelete].id;
      this.repository.delete(id).subscribe({
        next: () => {
          this.loadRutas();
          if (this.selectedIndex === this.indexToDelete) {
            this.selectedIndex = null;
          }
          this.showConfirmDelete = false;
          this.indexToDelete = null;
          this.showDeleteAlert = true;
        },
        error: (err) => {
          this.showConfirmDelete = false;
          this.indexToDelete = null;
        }
      });
    }
  }

  onCloseDeleteAlert() {
    this.showDeleteAlert = false;
  }

  get selectedRoute() {
    return this.selectedIndex !== null ? this.rutas[this.selectedIndex] : null;
  }
}
