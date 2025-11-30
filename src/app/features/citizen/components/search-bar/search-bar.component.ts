
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import type { Route } from '../../../admin/data/models/route.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss'
})
export class SearchBarComponent implements OnInit, OnDestroy, AfterViewInit {
  private _routes: Route[] = [];
  @Input() disabledInput: boolean = false;
  @Input() set routes(value: Route[]) {
    this._routes = value;
    this.searchTextChange.emit(this.searchText);
  }
  get routes(): Route[] {
    return this._routes;
  }
  @Output() searchTextChange = new EventEmitter<string>();
  @Output() routeSelected = new EventEmitter<Route>();
  constructor(private router: Router) {}
  // control para mostrar/ocultar el botón de búsqueda según la ruta
  showSearchButton = false;
  private routerSubscription?: Subscription;
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
  filteredRoutes: Route[] = [];

  onSearchTextChange() {
    this.searchTextChange.emit(this.searchText);
    if (this.searchText && this.routes.length > 0) {
      const search = this.searchText.toLowerCase();
      this.filteredRoutes = this.routes.filter(r => r.nombre.toLowerCase().includes(search));
      if (this.filteredRoutes.length === 1) {
        this.routeSelected.emit(this.filteredRoutes[0]);
      }
    } else {
      this.filteredRoutes = [];
    }
  }

  onSelectRoute(route: Route) {
    this.searchText = route.nombre;
    this.filteredRoutes = [];
    this.routeSelected.emit(route);
    this.searchExpanded = false;
  }

  private searchBarElement: HTMLElement | null = null;

  ngAfterViewInit() {
    this.searchBarElement = document.querySelector('.search-bar');
    document.addEventListener('click', this.handleClickOutside, true);
  }

  ngOnInit(): void {
    // valor inicial
    this.updateShowButton(this.router.url);
    // suscribirse a cambios de ruta
    this.routerSubscription = this.router.events.subscribe(event => {
      // NavigationEnd es el más adecuado, pero import por simplicidad usamos url actualizado
      // Si el evento tiene url, podemos extraerlo; para robustez, recalculamos desde router.url
      this.updateShowButton(this.router.url);
    });
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.handleClickOutside, true);
    this.routerSubscription?.unsubscribe();
  }

  toggleSearch() {
    this.searchExpanded = !this.searchExpanded;
    if (!this.searchExpanded) {
      this.searchText = '';
      this.searchTextChange.emit('');
    }
  }

  private updateShowButton(url: string) {
    // Mostrar botón sólo en la página de Rutas
    // Rutas definidas en app.routes.ts como 'routes'
    try {
      const path = url.split('?')[0] || url;
      this.showSearchButton = path === '/routes' || path.startsWith('/routes/');
    } catch (e) {
      this.showSearchButton = false;
    }
  }

  handleClickOutside = (event: MouseEvent) => {
    if (!this.searchExpanded) return;
    const target = event.target as HTMLElement;
    if (
      this.searchBarElement &&
      !this.searchBarElement.contains(target) &&
      target.tagName !== 'INPUT'
    ) {
      this.searchExpanded = false;
      this.searchText = '';
      this.searchTextChange.emit('');
    }
  }
}
