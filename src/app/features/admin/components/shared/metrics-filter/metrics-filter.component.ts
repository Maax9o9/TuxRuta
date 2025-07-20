import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterData {
  filterType: 'month' | 'week';
  selectedYear: number;
  selectedMonth: number;
  selectedRoute: number;
}

@Component({
  selector: 'app-metrics-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './metrics-filter.component.html',
  styleUrls: ['./metrics-filter.component.scss']
})
export class MetricsFilterComponent {
  @Input() title: string = 'Filtros de Métricas';
  @Input() initialFilterData: FilterData = {
    filterType: 'month',
    selectedYear: 2025,
    selectedMonth: 7,
    selectedRoute: 1
  };
  
  @Output() filterChange = new EventEmitter<FilterData>();

  // Filter properties
  filterType: 'month' | 'week' = 'month';
  selectedYear: number = 2025;
  selectedMonth: number = 7;
  selectedRoute: number = 1;
  
  // Dropdown state management
  openDropdowns: Set<string> = new Set();
  
  // Available options
  availableYears: number[] = [2024, 2025];
  availableRoutes = [
    { id: 1, name: 'Ruta 1 - Centro-Norte' },
    { id: 2, name: 'Ruta 2 - Este-Oeste' },
    { id: 3, name: 'Ruta 3 - Sur-Centro' }
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

  constructor() {}

  ngOnInit(): void {
    // Initialize with input data
    if (this.initialFilterData) {
      this.filterType = this.initialFilterData.filterType;
      this.selectedYear = this.initialFilterData.selectedYear;
      this.selectedMonth = this.initialFilterData.selectedMonth;
      this.selectedRoute = this.initialFilterData.selectedRoute;
    }
  }

  onFilterTypeChange(): void {
    this.emitFilterChange();
  }

  onYearChange(): void {
    this.emitFilterChange();
  }

  onMonthChange(): void {
    this.emitFilterChange();
  }

  onRouteChange(): void {
    this.emitFilterChange();
  }

  private emitFilterChange(): void {
    const filterData: FilterData = {
      filterType: this.filterType,
      selectedYear: this.selectedYear,
      selectedMonth: this.selectedMonth,
      selectedRoute: this.selectedRoute
    };
    this.filterChange.emit(filterData);
  }

  getFilterDescription(): string {
    const routeName = this.availableRoutes.find(r => r.id === this.selectedRoute)?.name || 'Ruta desconocida';
    switch (this.filterType) {
      case 'month':
        const monthName = this.availableMonths.find(m => m.value === this.selectedMonth)?.name || '';
        return `Datos mensuales - ${monthName} ${this.selectedYear} (±3 meses) - ${routeName}`;
      case 'week':
        return `Datos semanales - Últimas 7 semanas - ${routeName}`;
      default:
        return 'Filtro no especificado';
    }
  }

  // Dropdown methods
  toggleDropdown(dropdownName: string): void {
    if (this.openDropdowns.has(dropdownName)) {
      this.openDropdowns.delete(dropdownName);
    } else {
      this.openDropdowns.clear(); // Close all other dropdowns
      this.openDropdowns.add(dropdownName);
    }
  }

  isDropdownOpen(dropdownName: string): boolean {
    return this.openDropdowns.has(dropdownName);
  }

  selectFilterType(type: 'month' | 'week'): void {
    this.filterType = type;
    this.openDropdowns.delete('filterType');
    this.emitFilterChange();
  }

  selectYear(year: number): void {
    this.selectedYear = year;
    this.openDropdowns.delete('year');
    this.emitFilterChange();
  }

  selectMonth(month: number): void {
    this.selectedMonth = month;
    this.openDropdowns.delete('month');
    this.emitFilterChange();
  }

  selectRoute(routeId: number): void {
    this.selectedRoute = routeId;
    this.openDropdowns.delete('route');
    this.emitFilterChange();
  }

  getFilterTypeLabel(): string {
    return this.filterType === 'month' ? 'Por Mes' : 'Por Semana';
  }

  getSelectedMonthName(): string {
    return this.availableMonths.find(m => m.value === this.selectedMonth)?.name || '';
  }

  getSelectedRouteName(): string {
    return this.availableRoutes.find(r => r.id === this.selectedRoute)?.name || '';
  }

  // Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.openDropdowns.clear();
    }
  }
}
