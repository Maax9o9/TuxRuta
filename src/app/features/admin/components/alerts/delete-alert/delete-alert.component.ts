import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-delete-alert',
  templateUrl: './delete-alert.component.html',
  styleUrls: ['./delete-alert.component.scss']
})
export class DeleteAlertComponent {
  @Output() close = new EventEmitter<void>();
  private autoCloseTimeout: any;

  ngOnInit(): void {
    this.autoCloseTimeout = setTimeout(() => {
      this.onClose();
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.autoCloseTimeout) {
      clearTimeout(this.autoCloseTimeout);
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
