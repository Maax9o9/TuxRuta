import { Component, OnInit } from '@angular/core';
import { ConfirmSaveAlertComponent } from '../../alerts/confirm-save-alert/confirm-save-alert.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CreateRouteUseCase } from '../../../domain/route/create-route-use-case';
import { Route, Point } from '../../../data/models/route.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-route-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmSaveAlertComponent],
  templateUrl: './create-route-form.component.html',
  styleUrl: './create-route-form.component.scss'
})
export class CreateRouteFormComponent implements OnInit {

  routeForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = false;
  errorMessage = '';
  createdRoute: Route | null = null;

  currentStep: 'form' | 'route' | 'save' = 'form';
  formCompleted = false;
  routeTraced = false;
  canSave = false;
  showConfirmAlert = false;

  constructor(
    private formBuilder: FormBuilder,
    private createRouteUseCase: CreateRouteUseCase
  ) {
    this.routeForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });

    this.routeForm.valueChanges.subscribe(() => {
      this.updateFormStatus();
    });
  }

  ngOnInit(): void {
    console.log('CreateRouteFormComponent: Componente inicializado');
    this.updateFormStatus();
  }

  private updateFormStatus(): void {
    this.formCompleted = this.routeForm.valid;
    this.updateCurrentStep();
    
    if (this.formCompleted && !this.routeTraced) {
      this.enableRouteCreation();
    }
  }

  private updateCurrentStep(): void {
    if (!this.formCompleted) {
      this.currentStep = 'form';
    } else if (this.formCompleted && !this.routeTraced) {
      this.currentStep = 'route';
    } else if (this.formCompleted && this.routeTraced) {
      this.currentStep = 'save';
      this.canSave = true;
    }
  }

  private enableRouteCreation(): void {
    if (typeof window !== 'undefined' && (window as any).enableRouteCreation) {
      (window as any).enableRouteCreation();
    }
  }

  public onRouteTraced(): void {
    this.routeTraced = true;
    this.updateCurrentStep();
  }

  public onRouteCleared(): void {
    this.routeTraced = false;
    this.canSave = false;
    this.updateCurrentStep();
  }

  public getCurrentStepMessage(): string {
    switch (this.currentStep) {
      case 'form':
        return 'Completa el formulario para poder trazar la ruta en el mapa';
      case 'route':
        return 'Formulario completado. Ahora puedes trazar la ruta en el mapa';
      case 'save':
        return 'Ruta trazada exitosamente. Ya puedes guardar la ruta completa';
      default:
        return '';
    }
  }

  public getAlertType(): string {
    switch (this.currentStep) {
      case 'form':
        return 'warning';
      case 'route':
        return 'info';
      case 'save':
        return 'success';
      default:
        return 'info';
    }
  }

  get nombre() {
    return this.routeForm.get('nombre');
  }

  get descripcion() {
    return this.routeForm.get('descripcion');
  }

  getFieldError(fieldName: string): string {
    const field = this.routeForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName === 'nombre' ? 'El nombre' : 'La descripción'} es requerido`;
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${fieldName === 'nombre' ? 'El nombre' : 'La descripción'} debe tener al menos ${requiredLength} caracteres`;
      }
      if (field.errors['maxlength']) {
        const requiredLength = field.errors['maxlength'].requiredLength;
        return `${fieldName === 'nombre' ? 'El nombre' : 'La descripción'} no puede exceder ${requiredLength} caracteres`;
      }
    }
    return '';
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.routeForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  onSubmit(): void {
    if (this.routeForm.valid && this.canSave) {
      this.showConfirmAlert = true;
    } else {
      Object.keys(this.routeForm.controls).forEach(key => {
        this.routeForm.get(key)?.markAsTouched();
      });
      console.log('CreateRouteFormComponent: Formulario inválido', this.routeForm.errors);
    }
  }

  onConfirmSave(): void {
    this.isSubmitting = true;
    this.submitError = false;
    this.submitSuccess = false;
    this.errorMessage = '';

    const formData = this.routeForm.value;
    const routePoints = this.getFormattedRoutePointsFromMap();

    // Crear el objeto de ruta completo con puntos
    const routeData = {
      ...formData,
      points: routePoints
    };

    const sub: Subscription = this.createRouteUseCase.execute(routeData).subscribe({
      next: (result) => {
        if (result) {
          this.submitSuccess = true;
          this.createdRoute = result;
          this.routeForm.reset();
          this.resetForm(); 
          if (typeof window !== 'undefined' && (window as any).clearRouteFromMap) {
            (window as any).clearRouteFromMap();
          }
          setTimeout(() => {
            this.submitSuccess = false;
            this.createdRoute = null;
          }, 5000);
        } else {
          this.submitError = true;
          this.errorMessage = 'Error al crear la ruta. Por favor, intenta nuevamente.';
          console.error('CreateRouteFormComponent: Error al crear la ruta');
        }
        this.isSubmitting = false;
        this.showConfirmAlert = false;
      },
      error: (error) => {
        this.submitError = true;
        this.errorMessage = 'Error inesperado. Por favor, intenta nuevamente.';
        console.error('CreateRouteFormComponent: Error inesperado', error);
        this.isSubmitting = false;
        this.showConfirmAlert = false;
      }
    });
  }

  onCancelSave(): void {
    this.showConfirmAlert = false;
  }

  clearMessages(): void {
    this.submitError = false;
    this.submitSuccess = false;
    this.errorMessage = '';
  }

  resetForm(): void {
    this.routeForm.reset();
    this.clearMessages();
    this.createdRoute = null;
    this.formCompleted = false;
    this.routeTraced = false;
    this.canSave = false;
    this.currentStep = 'form';
  }

  public getFormattedRoutePointsFromMap(): Point[] {
    if (typeof window !== 'undefined' && (window as any).getFormattedRoutePoints) {
      return (window as any).getFormattedRoutePoints();
    }
    return [];
  }

  public getRoutePointsFromMap(): google.maps.LatLngLiteral[] {
    if (typeof window !== 'undefined' && (window as any).getRoutePoints) {
      return (window as any).getRoutePoints();
    }
    return [];
  }
}
