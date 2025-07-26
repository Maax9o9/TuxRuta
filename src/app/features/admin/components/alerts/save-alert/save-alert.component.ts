import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-save-alert',
  templateUrl: './save-alert.component.html',
  styleUrls: ['./save-alert.component.scss']
})
export class SaveAlertComponent {
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
