import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NormalDistributionComponent } from '../../../components/dashboard/normal-point/normal-point.component';
import { HighOccupancyComponent } from '../../../components/dashboard/high-occupancy/high-occupancy.component';
import { ConfidenceIntervalComponent } from '../../../components/dashboard/confidence-interval/confidence-interval.component';
import { PassengersTotalComponent } from '../../../components/dashboard/passengers-total/passengers-total.component';
import { RushHourComponent } from '../../../components/dashboard/rush-hour/rush-hour.component';
import { TravelPromedyComponent } from '../../../components/dashboard/travel-promedy/travel-promedy.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NormalDistributionComponent, HighOccupancyComponent, ConfidenceIntervalComponent, PassengersTotalComponent, RushHourComponent, TravelPromedyComponent],
  templateUrl: './dash-board-page.html',
  styleUrls: ['./dash-board-page.scss'],
})
export class DashboardPageComponent implements AfterViewInit {
  @ViewChild(NormalDistributionComponent) normalDistributionComponent!: NormalDistributionComponent;
  @ViewChild(HighOccupancyComponent) highOccupancyComponent!: HighOccupancyComponent;
  @ViewChild(ConfidenceIntervalComponent) confidenceIntervalComponent!: ConfidenceIntervalComponent;
  @ViewChild(PassengersTotalComponent) passengersTotalComponent!: PassengersTotalComponent;
  @ViewChild(RushHourComponent) rushHourComponent!: RushHourComponent;
  @ViewChild(TravelPromedyComponent) travelPromedyComponent!: TravelPromedyComponent;

  // Filter properties
  filterType: 'month' | 'week' = 'month'; // Cambiar a 'month' por defecto
  selectedYear: number = 2025;
  selectedMonth: number = 7; // Julio
  selectedRoute: number = 1; // Ruta por defecto
  
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

  ngAfterViewInit(): void {
    // Initial load with default filters
    setTimeout(() => {
      this.applyFilters();
    }, 500);
  }

  onFilterTypeChange(): void {
    console.log(`Dashboard: Filter type changed to ${this.filterType}`);
    this.applyFilters();
  }

  onYearChange(): void {
    console.log(`Dashboard: Year changed to ${this.selectedYear}`);
    this.applyFilters();
  }

  onMonthChange(): void {
    console.log(`Dashboard: Month changed to ${this.selectedMonth}`);
    this.applyFilters();
  }

  onRouteChange(): void {
    console.log(`Dashboard: Route changed to ${this.selectedRoute}`);
    this.applyFilters();
  }

  private applyFilters(): void {
    console.log(`Dashboard: Applying filters - Type: ${this.filterType}, Year: ${this.selectedYear}, Month: ${this.selectedMonth}, Route: ${this.selectedRoute}`);
    
    const components = [
      this.normalDistributionComponent,
      this.highOccupancyComponent,
      this.confidenceIntervalComponent,
      this.passengersTotalComponent,
      this.rushHourComponent,
      this.travelPromedyComponent
    ];

    components.forEach((component, index) => {
      if (component) {
        console.log(`Dashboard: Applying filter to component ${index + 1} (${component.constructor.name})`);
        switch (this.filterType) {
          case 'month':
            this.applyMonthFilter(component);
            break;
          case 'week':
            this.applyWeekFilter(component);
            break;
        }
      } else {
        console.log(`Dashboard: Component ${index + 1} not available yet`);
      }
    });
  }

  private applyMonthFilter(component: any): void {
    // For month filter, use monthly data with 7-month range around selected month
    console.log(`Dashboard: Applying month filter to component - Year: ${this.selectedYear}, Month: ${this.selectedMonth}, Route: ${this.selectedRoute}`);
    if (component.loadDataByMonthRange) {
      component.loadDataByMonthRange(this.selectedYear, this.selectedMonth, this.selectedRoute);
    } else if (component.switchToMonthly) {
      // Fallback for components that don't have loadDataByMonthRange
      component.switchToMonthly();
    }
  }

  private applyWeekFilter(component: any): void {
    // For week filter, use daily data (which represents weekly data)
    console.log(`Dashboard: Applying week filter to component - Route: ${this.selectedRoute}`);
    if (component.switchToDaily) {
      component.switchToDaily();
    }
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
}
