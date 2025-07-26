
import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDeleteAlertComponent } from '../../alerts/confirm-delete-alert/confirm-delete-alert.component';
import { DeleteAlertComponent } from '../../alerts/delete-alert/delete-alert.component';
import { StopRepository } from '../../../data/repository/stop-repository';
import { Stop } from '../../../data/models/stop.model';


@Component({
  selector: 'app-stop-table',
  standalone: true,
  imports: [CommonModule, ConfirmDeleteAlertComponent, DeleteAlertComponent],
  templateUrl: './stop-table.component.html',
  styleUrls: ['./stop-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class StopTableComponent implements OnInit, OnChanges {
  @Input() token: string | undefined;
  stops: Stop[] = [];
  showConfirmDelete = false;
  showDeleteAlert = false;
  indexToDelete: number | null = null;

  constructor(private repository: StopRepository, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (!this.token) {
      this.token = localStorage.getItem('jwt_token') ?? undefined;
    }
    this.loadStops();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['token'] && !changes['token'].firstChange) {
      this.loadStops();
    }
  }

  private getToken(): string | undefined {
    return this.token ?? localStorage.getItem('jwt_token') ?? undefined;
  }

  loadStops(): void {
    this.repository.getAll().subscribe({
      next: (data) => {
        this.stops = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[StopTable] Error al obtener paradas', err);
      }
    });
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
      const id = this.stops[this.indexToDelete].id;
      this.repository.delete(id).subscribe({
        next: () => {
          this.loadStops();
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
}

