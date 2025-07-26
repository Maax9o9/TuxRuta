import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-delete-alert',
  templateUrl: './confirm-delete-alert.component.html',
  styleUrls: ['./confirm-delete-alert.component.scss']
})
export class ConfirmDeleteAlertComponent {
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  onCancel(): void {
    this.cancel.emit();
  }

  onDelete(): void {
    this.delete.emit();
  }
}
