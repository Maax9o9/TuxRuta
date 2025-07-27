import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import type { Route } from '../../../admin/data/models/route.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [SearchBarComponent],
})
export class HeaderComponent {
  currentTime: string = '';

  private timer: any;

  @Input() routes: Route[] = [];
  @Output() searchTextChange = new EventEmitter<string>();
  @Output() routeSelected = new EventEmitter<Route>();

  constructor() {
    this.updateClock();
  }

  ngOnInit() {
    this.timer = setInterval(() => this.updateClock(), 1000);
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private updateClock() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  onSearchTextChange(event: string) {
    this.searchTextChange.emit(event);
  }
  onRouteSelected(route: Route) {
    this.routeSelected.emit(route);
  }
}
