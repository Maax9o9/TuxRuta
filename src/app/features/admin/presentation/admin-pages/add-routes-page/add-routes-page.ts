import { Component, ViewChild, AfterViewInit, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { GoogleMapComponent } from '../../../components/google-map/google_map.component';
import { CreateRouteFormComponent } from '../../../components/forms/create-route-form/create-route-form.component';
import { ConfirmSaveAlertComponent } from '../../../components/alerts/confirm-save-alert/confirm-save-alert.component';
import { SaveAlertComponent } from '../../../components/alerts/save-alert/save-alert.component';

@Component({
  selector: 'app-add-routes-page',
  standalone: true,
  imports: [CommonModule, GoogleMapComponent, CreateRouteFormComponent, ConfirmSaveAlertComponent, SaveAlertComponent],
  templateUrl: './add-routes-page.html',
  styleUrls: ['./add-routes-page.scss'],
})
export class AddRoutesPageComponent implements OnInit, AfterViewInit, OnDestroy {
  showConfirmAlert = false;
  showSaveAlert = false;

  onShowConfirmAlert() {
    this.showConfirmAlert = true;
  }

  onHideConfirmAlert() {
    this.showConfirmAlert = false;
  }

  onConfirmSave() {
    this.showConfirmAlert = false;
    if (this.formComponent) {
      this.formComponent.onConfirmSave();
    }
    // La alerta de guardado exitoso se mostrará cuando el form emita el evento de éxito
  }

  onCancelSave() {
    if (this.formComponent) {
      this.formComponent.onCancelSave();
    }
    this.showConfirmAlert = false;
  }

  onRouteSaved() {
    this.showConfirmAlert = false;
    this.showSaveAlert = true;
  }

  onCloseSaveAlert() {
    this.showSaveAlert = false;
  }
  @ViewChild(CreateRouteFormComponent) formComponent!: CreateRouteFormComponent;
  @ViewChild(GoogleMapComponent) mapComponent!: GoogleMapComponent;

  token: string | null = null;
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.token = localStorage.getItem('jwt_token');
      this.disablePageScroll();
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setupComponentCommunication();
      (window as any).enableRouteCreation = () => {
        this.enableRouteCreationMode();
      };
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.enablePageScroll();
    }
  }

  private disablePageScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.classList.add('no-scroll');
      document.body.classList.add('no-scroll');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
  }

  private enablePageScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.classList.remove('no-scroll');
      document.body.classList.remove('no-scroll');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  }

  private setupComponentCommunication(): void {
    console.log('Configurando comunicación entre formulario y mapa');
    setInterval(() => {
      if (this.isFormCompleted() && this.mapComponent && !this.mapComponent.isRouteCreationMode) {
        this.enableRouteCreationMode();
      }
    }, 1000);
    // Opcional: puedes pasar el token a los componentes hijos si lo requieren
    if (this.formComponent) {
      (this.formComponent as any).token = this.token;
    }
    if (this.mapComponent) {
      (this.mapComponent as any).token = this.token;
    }
  }

  private enableRouteCreationMode(): void {
    if (this.mapComponent && this.isFormCompleted()) {
      console.log('Habilitando modo de creación de rutas automáticamente');
      this.mapComponent.enableRouteCreationMode();
    }
  }

  onFormCompleted(): void {
    if (this.formComponent) {
      this.formComponent.onRouteTraced();
    }
  }

  onRouteCleared(): void {
    if (this.formComponent) {
      this.formComponent.onRouteCleared();
    }
  }

  isFormCompleted(): boolean {
    return this.formComponent?.formCompleted || false;
  }
}
