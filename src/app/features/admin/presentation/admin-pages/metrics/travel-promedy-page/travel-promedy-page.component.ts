import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TravelPromedyComponent } from '../../../../components/dashboard/travel-promedy/travel-promedy.component';
import { DailyResumeRepository } from '../../../../data/repository/daily-resume-repository';
import { MetricsRangeFilterComponent,FilterData} from '../../../../components/shared/metrics-filter-range/metrics-filter-range.component';

@Component({
  selector: 'app-travel-promedy-page',
  standalone: true,
  imports: [CommonModule, TravelPromedyComponent, MetricsRangeFilterComponent],
  templateUrl: './travel-promedy-page.component.html',
  styleUrls: ['./travel-promedy-page.component.scss']
})
export class TravelPromedyPageComponent implements AfterViewInit {
  token: string | null = null;
  @ViewChild(TravelPromedyComponent) travelPromedyComponent!: TravelPromedyComponent;
 chartData: any; // Datos para la gráfica

  // Initial filter data

  // Initial filter data
  initialFilterData: FilterData = {
    selectedYear: 2024,
    selectedMonth: 1,
    selectedRoute: 1,
    startDay: 1,
    endDay: 31
  };

  constructor(private dailyResumeRepository: DailyResumeRepository) {}

  setToken(token: string) {
    this.token = token;
    if (this.travelPromedyComponent && 'setToken' in this.travelPromedyComponent) {
      (this.travelPromedyComponent as any).setToken(token);
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

    this.dailyResumeRepository
      .getByDateRange(
        startDate,
        endDate,
        filterData.selectedRoute
      )
      .subscribe(data => {
        console.log('NormalPointPageComponent: Data fetched from repository (range)', data);
        this.chartData = data;
        if (this.travelPromedyComponent) {
          this.travelPromedyComponent.updateChartData(this.chartData);
        }
      });
  } else {
    console.warn('NormalPointPageComponent: Rango de días no definido en el filtro');
  }
}
}
