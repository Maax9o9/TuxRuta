import { Component, ViewChild, AfterViewInit, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CreateColectiveFormComponent } from '../../../components/forms/create-colective/create-colective-form.component';
import { ColectiveTableComponent } from '../../../components/tables/colective-table/colective-table.component';
import { ConfirmSaveAlertComponent } from '../../../components/alerts/confirm-save-alert/confirm-save-alert.component';
import { SaveAlertComponent } from '../../../components/alerts/save-alert/save-alert.component';
@Component({
  selector: 'app-add-colectives-page',
  standalone: true,
  imports: [CommonModule, CreateColectiveFormComponent, ColectiveTableComponent, ConfirmSaveAlertComponent, SaveAlertComponent],
  templateUrl: './add-colectives-page.component.html',
  styleUrls: ['./add-colectives-page.component.scss'],
})
export class AddColectivesPageComponent implements OnInit, AfterViewInit, OnDestroy {
  showSaveAlert = false;
  @ViewChild(CreateColectiveFormComponent) formComponent!: CreateColectiveFormComponent;
  token: string | undefined = undefined;
  showConfirmAlert = false;
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
  }

  onColectiveSaved() {
    this.showSaveAlert = true;
  }

  onCloseSaveAlert() {
    this.showSaveAlert = false;
  }

  onCancelSave() {
    if (this.formComponent) {
      this.formComponent.onCancelSave();
    }
    this.showConfirmAlert = false;
  }

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storedToken = localStorage.getItem('jwt_token');
      this.token = storedToken ? storedToken : undefined;
      this.disablePageScroll();
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setupComponentCommunication();
      if (this.formComponent) {
        (this.formComponent as any).token = this.token;
      }
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

  }

  onFormCompleted(): void {
  }
}
