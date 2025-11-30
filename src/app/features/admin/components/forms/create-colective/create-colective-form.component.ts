import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ConfirmSaveAlertComponent } from '../../alerts/confirm-save-alert/confirm-save-alert.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColectiveRepository } from '../../../data/repository/colective-repository';
import { RouteRepository } from '../../../data/repository/route-repository';
import { Route } from '../../../data/models/route.model';
import { Colective } from '../../../data/models/colective.model';

@Component({
  selector: 'app-create-colective-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmSaveAlertComponent],
  templateUrl: './create-colective-form.component.html',
  styleUrls: ['./create-colective-form.component.scss']
})
export class CreateColectiveFormComponent {
  @Output() confirmSave = new EventEmitter<void>();
  @Output() cancelSave = new EventEmitter<void>();
  @Output() colectiveSaved = new EventEmitter<void>();
  colectiveForm: FormGroup;
  colectives: Colective[] = [];
  matriculaExists: boolean = false;
  alertVisible = true;
  showConfirmAlert = false;
  @Input() token: string | undefined;
  message: string = '';
  routes: Route[] = [];

  constructor(
    private fb: FormBuilder,
    private repository: ColectiveRepository,
    private routeRepository: RouteRepository
  ) {
    this.colectiveForm = this.fb.group({
      matricula: ['', { nonNullable: true, validators: [Validators.required] }],
      ruta: ['', { nonNullable: true, validators: [Validators.required] }],
      activo: [false, { nonNullable: true }]
    });
  }

  ngOnInit(): void {
    this.routeRepository.getAll().subscribe({
      next: (routes) => {
        this.routes = routes;
      },
      error: (err) => {
        console.error('Error al obtener rutas', err);
      }
    });
    // Obtener colectivos para validar duplicados
    this.repository.getAll(this.token).subscribe({
      next: (colectives) => {
        this.colectives = colectives;
      },
      error: (err) => {
        console.error('Error al obtener colectivos', err);
      }
    });

    // Suscribir cambios en matricula para validar existencia
    const matriculaControl = this.colectiveForm.get('matricula');
    if (matriculaControl) {
      matriculaControl.valueChanges.subscribe(value => {
        this.checkMatriculaExists(value);
      });
    }
  }

  getAlertType(): string {
    return 'warning';
  }

  clearMessages(): void {
    this.alertVisible = false;
  }

  onSubmit(): void {
    if (this.colectiveForm.valid && !this.matriculaExists) {
      this.confirmSave.emit();
    }
  }

  // Esta función ya no se llama directamente desde el modal, sino desde la página
  // onConfirmSave(): void { ... }

  onConfirmSave(): void {
    const formValue = this.colectiveForm.value;
    const colectiveData: Omit<import('../../../data/models/colective.model').Colective, 'id'> = {
      matricula: formValue.matricula,
      ruta_id: Number(formValue.ruta),
      activo: formValue.activo,
      creado_por: 1,
      creado_en: new Date()
    };
    this.repository.create(colectiveData, this.token).subscribe({
      next: (result) => {
        this.message = 'Colectivo creado correctamente';
        this.resetForm();
        this.colectiveSaved.emit();
      },
      error: (err) => {
        this.message = 'Error al crear el colectivo';
        console.error(err);
      }
    });
  }

  onCancelSave(): void {
    this.cancelSave.emit();
  }

  resetForm(): void {
    this.colectiveForm.reset();
    this.alertVisible = true;
  }

  private checkMatriculaExists(value: any) {
    const val = (value || '').toString().trim().toUpperCase();
    if (!val) {
      this.matriculaExists = false;
      const control = this.colectiveForm.get('matricula');
      if (control && control.errors) {
        const { exists, ...rest } = control.errors as any;
        const hasOther = Object.keys(rest || {}).length > 0;
        control.setErrors(hasOther ? rest : null);
      }
      return;
    }
    const found = this.colectives.some(c => (c.matricula || '').toString().trim().toUpperCase() === val);
    this.matriculaExists = found;
    const control = this.colectiveForm.get('matricula');
    if (control) {
      if (found) {
        control.setErrors({ ...(control.errors || {}), exists: true });
      } else {
        if (control.errors) {
          const { exists, ...rest } = control.errors as any;
          const hasOther = Object.keys(rest || {}).length > 0;
          control.setErrors(hasOther ? rest : null);
        }
      }
    }
  }
}
