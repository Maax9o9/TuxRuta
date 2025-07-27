
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import type { Route } from '../../../admin/data/models/route.model';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss'
})
export class SearchBarComponent {
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

  ngOnDestroy() {
    document.removeEventListener('click', this.handleClickOutside, true);
  }

  toggleSearch() {
    this.searchExpanded = !this.searchExpanded;
    if (!this.searchExpanded) {
      this.searchText = '';
      this.searchTextChange.emit('');
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
