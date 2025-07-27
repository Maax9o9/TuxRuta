import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PassengersTotalComponent } from '../../../../components/dashboard/passengers-total/passengers-total.component';
import { MetricsRangeFilterComponent, FilterData } from '../../../../components/shared/metrics-filter-range/metrics-filter-range.component';
// Asegúrate de importar tu repositorio real:
import { DailyResumeRepository } from '../../../../data/repository/daily-resume-repository';

@Component({
  selector: 'app-passenger-total-page',
  standalone: true,
  imports: [CommonModule, PassengersTotalComponent, MetricsRangeFilterComponent],
  templateUrl: './passenger-total-page.component.html',
  styleUrls: ['./passenger-total-page.component.scss']
})
export class PassengerTotalPageComponent implements AfterViewInit {
  token: string | null = null;
  @ViewChild(PassengersTotalComponent) passengersTotalComponent!: PassengersTotalComponent;
  chartData: any; 
  // Initial filter data
  initialFilterData: FilterData = {
    selectedYear: 2024,
    selectedMonth: 1,
    selectedRoute: 1,
    startDay: 1,
    endDay: 31
  };

  constructor(private DailyRepository: DailyResumeRepository) {}

  setToken(token: string) {
    this.token = token;
    if (this.passengersTotalComponent && 'setToken' in this.passengersTotalComponent) {
      (this.passengersTotalComponent as any).setToken(token);
    }
  }

  ngAfterViewInit(): void {
    // Initial load with default filters
    setTimeout(() => {
      this.onFilterChange(this.initialFilterData);
    }, 500);
  }

  onFilterChange(filterData: FilterData): void {
  console.log('NormalPointPageComponent: Received filter data', filterData);

  if (
    filterData.startDay !== undefined &&
    filterData.endDay !== undefined &&
    filterData.selectedMonth !== undefined &&
    filterData.selectedYear !== undefined
  ) {
    // Construir fechas en formato YYYY-MM-DD
    const startDate = `${filterData.selectedYear}-${filterData.selectedMonth.toString().padStart(2, '0')}-${filterData.startDay.toString().padStart(2, '0')}`;
    const endDate = `${filterData.selectedYear}-${filterData.selectedMonth.toString().padStart(2, '0')}-${filterData.endDay.toString().padStart(2, '0')}`;

    this.DailyRepository
      .getByDateRange(
        startDate,
        endDate,
        filterData.selectedRoute
      )
      .subscribe(data => {
        console.log('NormalPointPageComponent: Data fetched from repository (range)', data);
        this.chartData = data;
        if (this.passengersTotalComponent) {
          this.passengersTotalComponent.updateChartData(this.chartData);
        }
      });
  } else {
    console.warn('NormalPointPageComponent: Rango de días no definido en el filtro');
  }
}
}