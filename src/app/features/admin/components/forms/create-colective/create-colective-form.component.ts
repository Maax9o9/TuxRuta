import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-create-colective-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-colective-form.component.html',
  styleUrls: ['./create-colective-form.component.scss']
})
export class CreateColectiveFormComponent {
  colectiveForm: FormGroup;
  alertVisible = true;

  constructor(private fb: FormBuilder) {
    this.colectiveForm = this.fb.group({
      matricula: [''],
      ruta: [''],
      activo: [false]
    });
  }

  getAlertType(): string {
    return 'warning';
  }

  clearMessages(): void {
    this.alertVisible = false;
  }

  onSubmit(): void {
    if (this.colectiveForm.valid) {
      console.log('Formulario enviado:', this.colectiveForm.value);
    }
  }

  resetForm(): void {
    this.colectiveForm.reset();
    this.alertVisible = true;
  }
}
