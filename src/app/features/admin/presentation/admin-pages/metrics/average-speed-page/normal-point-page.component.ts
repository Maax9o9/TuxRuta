import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NormalDistributionComponent } from '../../../../components/dashboard/average-speed/normal-point.component';
import { MetricsRangeFilterComponent,FilterData} from '../../../../components/shared/metrics-filter-range/metrics-filter-range.component';
import { DailyResumeRepository } from '../../../../data/repository/daily-resume-repository';

@Component({
  selector: 'app-normal-point-page',
  standalone: true,
  imports: [CommonModule, NormalDistributionComponent, MetricsRangeFilterComponent],
  templateUrl: './normal-point-page.component.html',
  styleUrls: ['./normal-point-page.component.scss']
})
export class AverageSpeedPageComponent implements AfterViewInit {
  token: string | null = null;
  @ViewChild(NormalDistributionComponent) normalDistributionComponent!: NormalDistributionComponent;
 chartData: any; // Datos para la gráfica

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
    if (this.normalDistributionComponent && 'setToken' in this.normalDistributionComponent) {
      (this.normalDistributionComponent as any).setToken(token);
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
        if (this.normalDistributionComponent) {
          this.normalDistributionComponent.updateChartData(this.chartData);
        }
      });
  } else {
    console.warn('NormalPointPageComponent: Rango de días no definido en el filtro');
  }
}
}