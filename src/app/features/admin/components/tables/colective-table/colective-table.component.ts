
import { DeleteAlertComponent } from '../../alerts/delete-alert/delete-alert.component';
import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { ConfirmDeleteAlertComponent } from '../../alerts/confirm-delete-alert/confirm-delete-alert.component';
import { CommonModule } from '@angular/common';
import { ColectiveRepository } from '../../../data/repository/colective-repository';
import { Colective } from '../../../data/models/colective.model';

@Component({
  selector: 'app-colective-table',
  standalone: true,
  imports: [CommonModule, ConfirmDeleteAlertComponent, DeleteAlertComponent],
  templateUrl: './colective-table.component.html',
  styleUrls: ['./colective-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ColectiveTableComponent implements OnInit, OnChanges {
  showDeleteAlert = false;

  setDeleteAlert(open: boolean) {
    this.showDeleteAlert = open;
    if (open) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }

  onCloseDeleteAlert() {
    this.setDeleteAlert(false);
  }
  @Output() showConfirmDelete = new EventEmitter<number>();
  @Output() deleteSuccess = new EventEmitter<void>();
  indexToDelete: number | null = null;
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['token'] && !changes['token'].firstChange) {
      this.loadColectivos();
    }
  }
  @Input() token: string | undefined;
  colectivos: Colective[] = [];

  constructor(private repository: ColectiveRepository, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (!this.token) {
      this.token = localStorage.getItem('jwt_token') ?? undefined;
      console.log('[ColectiveTable] ngOnInit token from localStorage:', this.token);
    } else {
      console.log('[ColectiveTable] ngOnInit token from input:', this.token);
    }
    this.loadColectivos();
  }

  private getToken(): string | undefined {
    return this.token ?? localStorage.getItem('jwt_token') ?? undefined;
  }

  loadColectivos(): void {
    const tokenToUse = this.getToken();
    console.log('[ColectiveTable] getAll called with token:', tokenToUse);
    this.repository.getAll(tokenToUse).subscribe({
      next: (data) => {
        console.log('[ColectiveTable] getAll success:', data);
        this.colectivos = data;
        console.log('[ColectiveTable] colectivos after assignment:', this.colectivos);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[ColectiveTable] Error al obtener colectivos', err);
      }
    });
  }

  onDeleteClick(index: number) {
    this.showConfirmDelete.emit(index);
  }

  // Llamado desde la página para eliminar
  onConfirmDeleteFromPage(index: number) {
    this.indexToDelete = index;
    if (this.indexToDelete !== null) {
      const id = this.colectivos[this.indexToDelete].id;
      const tokenToUse = this.getToken();
      this.repository.delete(id, tokenToUse).subscribe({
        next: (res) => {
          this.loadColectivos();
          this.setDeleteAlert(true);
        },
        error: (err) => {
        }
      });
    }
  }

  onCancelDelete() {
    // El control del modal ahora lo maneja la página
    this.indexToDelete = null;
  }

  onConfirmDelete() {
    if (this.indexToDelete !== null) {
      const id = this.colectivos[this.indexToDelete].id;
      const tokenToUse = this.getToken();
      this.repository.delete(id, tokenToUse).subscribe({
        next: (res) => {
          this.loadColectivos();
          this.setDeleteAlert(true);
          this.indexToDelete = null;
        },
        error: (err) => {
          this.indexToDelete = null;
        }
      });
    }
  }
}
