import { Component, ViewChild, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateColectiveFormComponent } from '../../../components/forms/create-colective/create-colective-form.component';

@Component({
  selector: 'app-add-colectives-page',
  standalone: true,
  imports: [CommonModule, CreateColectiveFormComponent],
  templateUrl: './add-colectives-page.component.html',
  styleUrls: ['./add-colectives-page.component.scss'],
})
export class AddColectivesPageComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(CreateColectiveFormComponent) formComponent!: CreateColectiveFormComponent;

  constructor() {}

  ngOnInit(): void {
    this.disablePageScroll();
  }

  ngAfterViewInit(): void {
    this.setupComponentCommunication();
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
    // Aquí puedes agregar lógica de comunicación si el formulario lo requiere
    // Por ejemplo, escuchar eventos del formulario para habilitar acciones
  }

  onFormCompleted(): void {
    // Lógica para cuando el formulario esté completo
  }
}
