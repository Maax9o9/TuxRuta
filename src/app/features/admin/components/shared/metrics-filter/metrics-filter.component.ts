import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouteRepository } from '../../../data/repository/route-repository';

export interface FilterData {
  filterType: 'month' | 'daily';
  selectedYear: number;
  selectedMonth: number;
  selectedRoute: number;
  selectedDay?: number;
}

@Component({
  selector: 'app-metrics-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './metrics-filter.component.html',
  styleUrls: ['./metrics-filter.component.scss']
})
export class MetricsFilterComponent implements OnInit {
  @Input() title: string = 'Filtros de Métricas';
  @Output() filterChange = new EventEmitter<FilterData>();

  // Filter properties
  filterType: 'month' | 'daily' = 'month';
  selectedYear: number = 2024;
  selectedMonth: number = 1;
  selectedRoute: number = 1;
  selectedDay?: number;

  // Dropdown state management
  openDropdowns: Set<string> = new Set();

  // Available options
  availableDays: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
  availableYears: number[] = [2024, 2025];
  availableRoutes: { id: number; nombre: string }[] = [];
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

selectFilterType(type: 'month' | 'daily'): void {
  this.filterType = type;
  this.openDropdowns.delete('filterType');
}

selectYear(year: number): void {
  this.selectedYear = year;
  this.openDropdowns.delete('year');
}

selectMonth(month: number): void {
  this.selectedMonth = month;
  this.openDropdowns.delete('month');
}

selectDay(day: number): void {
  this.selectedDay = day;
  this.openDropdowns.delete('day');
}

selectRoute(routeId: number): void {
  this.selectedRoute = routeId;
  this.openDropdowns.delete('route');
}

applyFilters(): void {
  const filterData: FilterData = {
    filterType: this.filterType,
    selectedYear: this.selectedYear,
    selectedMonth: this.selectedMonth,
    selectedRoute: this.selectedRoute,
    selectedDay: this.filterType === 'daily' ? this.selectedDay : undefined
  };
  console.log('MetricsFilterComponent: Emitting filter data', filterData); // Verifica los datos aquí
  this.filterChange.emit(filterData);
}

  getSelectedMonthName(): string {
    return this.availableMonths.find(m => m.value === this.selectedMonth)?.name || '';
  }

  getSelectedRouteName(): string {
    return this.availableRoutes.find(r => r.id === this.selectedRoute)?.nombre || 'Selecciona una ruta';
  }

  toggleDropdown(dropdownName: string): void {
    if (this.openDropdowns.has(dropdownName)) {
      this.openDropdowns.delete(dropdownName);
    } else {
      this.openDropdowns.clear();
      this.openDropdowns.add(dropdownName);
    }
  }

  isDropdownOpen(dropdownName: string): boolean {
    return this.openDropdowns.has(dropdownName);
  }
}