import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-save-alert',
  templateUrl: './confirm-save-alert.component.html',
  styleUrls: ['./confirm-save-alert.component.scss']
})
export class ConfirmSaveAlertComponent {
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();

  onCancel(): void {
    this.cancel.emit();
  }

  onSave(): void {
    this.save.emit();
  }
}
