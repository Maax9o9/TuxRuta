import { Component, ViewChild, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapComponent } from '../../../components/google-map/google_map.component';
import { CreateRouteFormComponent } from '../../../components/forms/create-route-form/create-route-form.component';

@Component({
  selector: 'app-add-routes-page',
  standalone: true,
  imports: [CommonModule, GoogleMapComponent, CreateRouteFormComponent],
  templateUrl: './add-routes-page.html',
  styleUrls: ['./add-routes-page.scss'],
})
export class AddRoutesPageComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(CreateRouteFormComponent) formComponent!: CreateRouteFormComponent;
  @ViewChild(GoogleMapComponent) mapComponent!: GoogleMapComponent;

  constructor() {}

  ngOnInit(): void {
    this.disablePageScroll();
  }

  ngAfterViewInit(): void {
    this.setupComponentCommunication();
    
    (window as any).enableRouteCreation = () => {
      this.enableRouteCreationMode();
    };
  }

  ngOnDestroy(): void {
    this.enablePageScroll();
  }

  private disablePageScroll(): void {
    document.documentElement.classList.add('no-scroll');
    document.body.classList.add('no-scroll');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }

  private enablePageScroll(): void {
    document.documentElement.classList.remove('no-scroll');
    document.body.classList.remove('no-scroll');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }

  private setupComponentCommunication(): void {
    console.log('Configurando comunicación entre formulario y mapa');
    
    setInterval(() => {
      if (this.isFormCompleted() && this.mapComponent && !this.mapComponent.isRouteCreationMode) {
        this.enableRouteCreationMode();
      }
    }, 1000);
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
