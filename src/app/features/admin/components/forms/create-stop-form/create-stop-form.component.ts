import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StopRepository } from '../../../data/repository/stop-repository';
import { Stop, Ubicacion } from '../../../data/models/stop.model';

@Component({
  selector: 'app-create-stop-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-stop-form.component.html',
  styleUrls: ['./create-stop-form.component.scss']
})
export class CreateStopFormComponent {
  @Input() ubicacion: Ubicacion | null = null;
  @Input() rutaId: number | null = null;
  @Input() token: string | undefined;
  @Output() save = new EventEmitter<Stop>();
  @Output() cancel = new EventEmitter<void>();

  stopForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(private fb: FormBuilder, private stopRepository: StopRepository) {
    this.stopForm = this.fb.group({
      nombre: ['', Validators.required],
      activa: [true, Validators.required]
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onSave(): void {
    if (this.stopForm.valid && this.ubicacion && this.rutaId !== null) {
      this.loading = true;
      this.error = null;
      const stopData: Omit<Stop, 'id'> = {
        nombre: this.stopForm.value.nombre,
        ubicacion: this.ubicacion,
        ruta_id: this.rutaId,
        activa: this.stopForm.value.activa,
        creado_por: 1,
        creado_en: new Date().toISOString()
      };
      this.stopRepository.create(stopData, this.token).subscribe({
        next: (result) => {
          if (result) {
            this.save.emit(result);
          } else {
            this.error = 'No se pudo crear la parada.';
          }
          this.loading = false;
        },
        error: (e) => {
          this.error = 'Error al crear la parada.';
          this.loading = false;
        }
      });
    } else {
      this.stopForm.markAllAsTouched();
    }
  }
}
