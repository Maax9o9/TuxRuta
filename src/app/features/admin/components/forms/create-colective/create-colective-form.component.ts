import { Component, Input } from '@angular/core';
import { ConfirmSaveAlertComponent } from '../../alerts/confirm-save-alert/confirm-save-alert.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColectiveRepository } from '../../../data/repository/colective-repository';
import { RouteRepository } from '../../../data/repository/route-repository';
import { Route } from '../../../data/models/route.model';

@Component({
  selector: 'app-create-colective-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmSaveAlertComponent],
  templateUrl: './create-colective-form.component.html',
  styleUrls: ['./create-colective-form.component.scss']
})
export class CreateColectiveFormComponent {
  colectiveForm: FormGroup;
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
  }

  getAlertType(): string {
    return 'warning';
  }

  clearMessages(): void {
    this.alertVisible = false;
  }

  onSubmit(): void {
    if (this.colectiveForm.valid) {
      this.showConfirmAlert = true;
    }
  }

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
        this.showConfirmAlert = false;
      },
      error: (err) => {
        this.message = 'Error al crear el colectivo';
        this.showConfirmAlert = false;
        console.error(err);
      }
    });
  }

  onCancelSave(): void {
    this.showConfirmAlert = false;
  }

  resetForm(): void {
    this.colectiveForm.reset();
    this.alertVisible = true;
  }
}
