import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HighOccupancyComponent } from '../../../../components/dashboard/high-occupancy/high-occupancy.component';
import { MetricsFilterComponent, FilterData } from '../../../../components/shared/metrics-filter/metrics-filter.component';
import { MonthlyResumeRepository } from '../../../../data/repository/monthly-resume-repository';
import { DailyResumeRepository } from '../../../../data/repository/daily-resume-repository';

@Component({
  selector: 'app-high-occupancy-page',
  standalone: true,
  imports: [CommonModule, HighOccupancyComponent, MetricsFilterComponent],
  templateUrl: './high-occupancy-page.component.html',
  styleUrls: ['./high-occupancy-page.component.scss']
})
export class HighOccupancyPageComponent implements AfterViewInit {
  token: string | null = null;
  @ViewChild(HighOccupancyComponent) highOccupancyComponent!: HighOccupancyComponent;
  chartData: any; // Datos para la gráfica

  // Initial filter data
  initialFilterData: FilterData = {
    filterType: 'month',
    selectedYear: 2025,
    selectedMonth: 7,
    selectedRoute: 1
  };

   constructor(private monthlyResumeRepository: MonthlyResumeRepository,
      private dailyResumeRepository: DailyResumeRepository
    ) {}

  setToken(token: string) {
    this.token = token;
    if (this.highOccupancyComponent && 'setToken' in this.highOccupancyComponent) {
      (this.highOccupancyComponent as any).setToken(token);
    }
  }

  ngAfterViewInit(): void {
    // Initial load with default filters
    setTimeout(() => {
      this.onFilterChange(this.initialFilterData);
    }, 500);
  }

 onFilterChange(filterData: FilterData): void {
  console.log('ConfidenceIntervalPageComponent: Received filter data', filterData);

  if (filterData.filterType === 'month') {
    this.monthlyResumeRepository
      .getByRouteId(filterData.selectedYear, filterData.selectedMonth, filterData.selectedRoute)
      .subscribe(data => {
        console.log('ConfidenceIntervalPageComponent: Data fetched from repository (monthly)', data);
        this.chartData = data;
        if (this.highOccupancyComponent) {
          this.highOccupancyComponent.updateChartData(this.chartData);
        }
      });
  } else if (filterData.filterType === 'daily') {
    const day = filterData.selectedDay;
    if (typeof day === 'number') {
      this.dailyResumeRepository
        .getByDateAndRoute(
          `${filterData.selectedYear}-${filterData.selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
          filterData.selectedRoute
        )
        .subscribe(data => {
          console.log('ConfidenceIntervalPageComponent: Data fetched from repository (daily)', data);
          this.chartData = data;
          if (this.highOccupancyComponent) {
            this.highOccupancyComponent.updateChartData(this.chartData);
          }
        });
    } else {
      console.warn('ConfidenceIntervalPageComponent: selectedDay is undefined for daily filter');
    }
  }
}

}