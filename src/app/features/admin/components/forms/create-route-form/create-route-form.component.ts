import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CreateRouteUseCase } from '../../../domain/create-route-use-case';
import { Route, RoutePoint } from '../../../data/models/route.model';

@Component({
  selector: 'app-create-route-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

  // Estados del proceso de creación de ruta
  currentStep: 'form' | 'route' | 'save' = 'form';
  formCompleted = false;
  routeTraced = false;
  canSave = false;

  constructor(
    private formBuilder: FormBuilder,
    private createRouteUseCase: CreateRouteUseCase
  ) {
    this.routeForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });

    // Suscribirse a cambios en el formulario
    this.routeForm.valueChanges.subscribe(() => {
      this.updateFormStatus();
    });
  }

  ngOnInit(): void {
    console.log('CreateRouteFormComponent: Componente inicializado');
    this.updateFormStatus();
  }

  // Método para actualizar el estado del formulario
  private updateFormStatus(): void {
    this.formCompleted = this.routeForm.valid;
    this.updateCurrentStep();
    
    // Habilitar automáticamente el modo de creación de rutas cuando se complete el formulario
    if (this.formCompleted && !this.routeTraced) {
      this.enableRouteCreation();
    }
  }

  // Método para actualizar el paso currente
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

  // Método para habilitar automáticamente el modo de creación de rutas
  private enableRouteCreation(): void {
    // Emitir un evento para que el componente padre active el modo de creación
    if (typeof window !== 'undefined' && (window as any).enableRouteCreation) {
      (window as any).enableRouteCreation();
    }
  }

  // Método para notificar que la ruta ha sido trazada
  public onRouteTraced(): void {
    this.routeTraced = true;
    this.updateCurrentStep();
  }

  // Método para notificar que la ruta ha sido eliminada
  public onRouteCleared(): void {
    this.routeTraced = false;
    this.canSave = false;
    this.updateCurrentStep();
  }

  // Método para obtener el mensaje de alerta actual
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

  // Método para obtener el tipo de alerta
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

  // Getters para facilitar el acceso a los controles del formulario
  get nombre() {
    return this.routeForm.get('nombre');
  }

  get descripcion() {
    return this.routeForm.get('descripcion');
  }

  // Método para obtener errores de validación
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

  // Método para verificar si un campo tiene errores
  hasFieldError(fieldName: string): boolean {
    const field = this.routeForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  // Método para enviar el formulario
  async onSubmit(): Promise<void> {
    if (this.routeForm.valid && this.canSave) {
      this.isSubmitting = true;
      this.submitError = false;
      this.submitSuccess = false;
      this.errorMessage = '';

      try {
        const formData = this.routeForm.value;
        const routePoints = this.getFormattedRoutePointsFromMap();
        
        console.log('CreateRouteFormComponent: Enviando datos del formulario', formData);
        console.log('CreateRouteFormComponent: Puntos de la ruta formateados', routePoints);

        // Crear el objeto de ruta completo con puntos
        const routeData = {
          ...formData,
          points: routePoints
        };

        console.log('=====================================');
        console.log('📍 INFORMACIÓN DE LA RUTA GUARDADA:');
        console.log('=====================================');
        console.log('📋 Datos del formulario:');
        console.log('   - Nombre:', routeData.nombre);
        console.log('   - Descripción:', routeData.descripcion);
        console.log('🗺️ Puntos de la ruta (' + routeData.points.length + ' puntos):');
        routeData.points.forEach((point: any, index: number) => {
          console.log(`   ${index + 1}. Lat: ${point.lat}, Lng: ${point.lng}, Orden: ${point.order}`);
        });
        console.log('📦 Objeto completo de la ruta:');
        console.log(JSON.stringify(routeData, null, 2));
        console.log('=====================================');
        
        // Mostrar una alerta simple de confirmación
        alert(`✅ RUTA GUARDADA EXITOSAMENTE!\n\nNombre: ${routeData.nombre}\nPuntos guardados: ${routeData.points.length}\n\n👀 Ver consola para detalles completos`);

        const result = await this.createRouteUseCase.execute(routeData);

        if (result) {
          this.submitSuccess = true;
          this.createdRoute = result;
          this.routeForm.reset();
          this.resetForm(); // Resetear todos los estados
          console.log('CreateRouteFormComponent: Ruta creada exitosamente', result);
          
          // Limpiar la ruta del mapa
          if (typeof window !== 'undefined' && (window as any).clearRouteFromMap) {
            (window as any).clearRouteFromMap();
          }
          
          // Limpiar el mensaje de éxito después de 5 segundos
          setTimeout(() => {
            this.submitSuccess = false;
            this.createdRoute = null;
          }, 5000);
        } else {
          this.submitError = true;
          this.errorMessage = 'Error al crear la ruta. Por favor, intenta nuevamente.';
          console.error('CreateRouteFormComponent: Error al crear la ruta');
        }
      } catch (error) {
        this.submitError = true;
        this.errorMessage = 'Error inesperado. Por favor, intenta nuevamente.';
        console.error('CreateRouteFormComponent: Error inesperado', error);
      } finally {
        this.isSubmitting = false;
      }
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.routeForm.controls).forEach(key => {
        this.routeForm.get(key)?.markAsTouched();
      });
      console.log('CreateRouteFormComponent: Formulario inválido', this.routeForm.errors);
    }
  }

  // Método para limpiar mensajes de error
  clearMessages(): void {
    this.submitError = false;
    this.submitSuccess = false;
    this.errorMessage = '';
  }

  // Método para resetear el formulario
  resetForm(): void {
    this.routeForm.reset();
    this.clearMessages();
    this.createdRoute = null;
    this.formCompleted = false;
    this.routeTraced = false;
    this.canSave = false;
    this.currentStep = 'form';
  }

  // Método para obtener los puntos de la ruta desde el mapa en formato RoutePoint
  public getFormattedRoutePointsFromMap(): RoutePoint[] {
    if (typeof window !== 'undefined' && (window as any).getFormattedRoutePoints) {
      return (window as any).getFormattedRoutePoints();
    }
    return [];
  }

  // Método para obtener los puntos de la ruta desde el mapa (formato google maps)
  public getRoutePointsFromMap(): google.maps.LatLngLiteral[] {
    if (typeof window !== 'undefined' && (window as any).getRoutePoints) {
      return (window as any).getRoutePoints();
    }
    return [];
  }
}
