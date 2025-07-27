import { Component, Inject, PLATFORM_ID, OnInit, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ColectiveTableComponent } from '../../../../components/tables/colective-table/colective-table.component';
import { ConfirmDeleteAlertComponent } from '../../../../components/alerts/confirm-delete-alert/confirm-delete-alert.component';
import { DeleteAlertComponent } from '../../../../components/alerts/delete-alert/delete-alert.component';

@Component({
  selector: 'app-colective-table-page',
  standalone: true,
  imports: [CommonModule, ColectiveTableComponent, ConfirmDeleteAlertComponent, DeleteAlertComponent],
  templateUrl: './colective-table-page.component.html',
  styleUrls: ['./colective-table-page.component.scss']
})
export class ColectiveTablePageComponent implements OnInit {
  token: string | undefined = undefined;
  showConfirmDelete = false;
  showDeleteAlert = false;
  indexToDelete: number | null = null;
  @ViewChild(ColectiveTableComponent) tableComponent!: ColectiveTableComponent;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storedToken = localStorage.getItem('jwt_token');
      this.token = storedToken ? storedToken : undefined;
    }
  }

  onShowConfirmDelete(index: number) {
    this.indexToDelete = index;
    this.showConfirmDelete = true;
  }

  onCancelDelete() {
    this.showConfirmDelete = false;
    this.indexToDelete = null;
  }

  onConfirmDelete() {
    if (this.tableComponent && this.indexToDelete !== null) {
      this.tableComponent.onConfirmDeleteFromPage(this.indexToDelete);
    }
    this.showConfirmDelete = false;
    this.indexToDelete = null;
  }

  onCloseDeleteAlert() {
    this.showDeleteAlert = false;
  }
}

