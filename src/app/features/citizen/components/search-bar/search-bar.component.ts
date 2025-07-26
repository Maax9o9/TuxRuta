import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { NgIf } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [NgIf, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss'
})
export class SearchBarComponent {
  @Input() disabledInput: boolean = false;
  constructor(private router: Router) {}
  goToHome() {
    this.router.navigate(['/home']);
  }
  goToRoutes() {
    this.router.navigate(['/routes']);
  }

  goToAboutUs() {
    this.router.navigate(['/about-us']);
  }
  searchExpanded = false;
  searchText = '';

  private searchBarElement: HTMLElement | null = null;

  ngAfterViewInit() {
    this.searchBarElement = document.querySelector('.search-bar');
    document.addEventListener('click', this.handleClickOutside, true);
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.handleClickOutside, true);
  }

  toggleSearch() {
    this.searchExpanded = !this.searchExpanded;
  }

  handleClickOutside = (event: MouseEvent) => {
    if (!this.searchExpanded) return;
    const target = event.target as HTMLElement;
    // Solo cerrar si el click es fuera del input y fuera de la barra
    if (
      this.searchBarElement &&
      !this.searchBarElement.contains(target) &&
      target.tagName !== 'INPUT'
    ) {
      this.searchExpanded = false;
    }
  }
}
