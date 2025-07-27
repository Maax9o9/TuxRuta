import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RouteRepository } from '../../../data/repository/route-repository';

export interface FilterData {
  selectedYear: number;
  selectedMonth: number;
    selectedRoute: number;
    startDay?: number;
    endDay?: number;
}
@Component({
  selector: 'app-metrics-range-filter',
  templateUrl: './metrics-filter-range.component.html',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./metrics-filter-range.component.scss'] // Usa el mismo SCSS
})
export class MetricsRangeFilterComponent implements OnInit {
  @Input() title: string = 'Filtros por Rango de Fechas';
  @Output() filterChange = new EventEmitter<any>();

  selectedYear: number = 2024;
  selectedMonth: number = 1;
  selectedRoute: number = 1;
  selectedStartDay?: number;
  selectedEndDay?: number;

  openDropdowns: Set<string> = new Set();

  availableDays: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
  availableYears: number[] = [2024, 2025];
  availableRoutes: { id: number; nombre: string }[] = [
    { id: 1, nombre: 'Ruta 1' },
    { id: 2, nombre: 'Ruta 2' }
    // ...agrega tus rutas
  ];
  availableMonths = [
    { value: 1, name: 'Enero' },
    { value: 2, name: 'Febrero' },
    { value: 3, name: 'Marzo' },
    { value: 4, name: 'Abril' },
    { value: 5, name: 'Mayo' },
    { value: 6, name: 'Junio' },
    { value: 7, name: 'Julio' },
    { value: 8, name: 'Agosto' },
    { value: 9, name: 'Septiembre' },
    { value: 10, name: 'Octubre' },
    { value: 11, name: 'Noviembre' },
    { value: 12, name: 'Diciembre' }
  ];
  constructor(private reposRoutes: RouteRepository) {}

   ngOnInit(): void {
    this.reposRoutes.getAll().subscribe({
      next: (routes) => {
        this.availableRoutes = routes;
      },
      error: (error) => {
        console.error('Error fetching routes:', error);
      }
    });
  }
  toggleDropdown(dropdown: string) {
    if (this.openDropdowns.has(dropdown)) {
      this.openDropdowns.delete(dropdown);
    } else {
      this.openDropdowns.add(dropdown);
    }
  }

  isDropdownOpen(dropdown: string): boolean {
    return this.openDropdowns.has(dropdown);
  }

  selectYear(year: number) {
    this.selectedYear = year;
    this.openDropdowns.delete('year');
  }

  selectMonth(month: number) {
    this.selectedMonth = month;
    this.openDropdowns.delete('month');
  }

  selectStartDay(day: number) {
    this.selectedStartDay = day;
    this.openDropdowns.delete('startDay');
  }

  selectEndDay(day: number) {
    this.selectedEndDay = day;
    this.openDropdowns.delete('endDay');
  }

  selectRoute(routeId: number) {
    this.selectedRoute = routeId;
    this.openDropdowns.delete('route');
  }

  getSelectedMonthName(): string {
    const found = this.availableMonths.find(m => m.value === this.selectedMonth);
    return found ? found.name : 'Seleccionar Mes';
  }

  getSelectedRouteName(): string {
    const found = this.availableRoutes.find(r => r.id === this.selectedRoute);
    return found ? found.nombre : 'Seleccionar Ruta';
  }

  applyFilters() {
    if (
      this.selectedStartDay &&
      this.selectedEndDay &&
      this.selectedStartDay <= this.selectedEndDay
    ) {
      this.filterChange.emit({
        selectedYear: this.selectedYear,
        selectedMonth: this.selectedMonth,
        selectedRoute: this.selectedRoute,
        startDay: this.selectedStartDay,
        endDay: this.selectedEndDay
      });
    } else {
      alert('Selecciona un rango de días válido.');
    }
  }
}