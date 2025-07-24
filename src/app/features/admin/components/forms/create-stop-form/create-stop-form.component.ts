import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-stop-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-stop-form.component.html',
  styleUrls: ['./create-stop-form.component.scss']
})
export class CreateStopFormComponent {
  stopForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.stopForm = this.fb.group({
      stopName: ['', Validators.required]
    });
  }

  onCancel(): void {
    console.log('Cancelado');
  }

  onSave(): void {
    if (this.stopForm.valid) {
      console.log('Guardado:', this.stopForm.value);
    } else {
      this.stopForm.markAllAsTouched();
    }
  }
}
