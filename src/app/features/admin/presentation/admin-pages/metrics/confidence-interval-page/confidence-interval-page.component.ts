import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfidenceIntervalComponent } from '../../../../components/dashboard/confidence-interval/confidence-interval.component';
import { MetricsFilterComponent, FilterData } from '../../../../components/shared/metrics-filter/metrics-filter.component';
import { MonthlyResumeRepository } from '../../../../data/repository/monthly-resume-repository'; 
import { DailyResumeRepository } from '../../../../data/repository/daily-resume-repository';

@Component({
  selector: 'app-confidence-interval-page',
  standalone: true,
  imports: [CommonModule, ConfidenceIntervalComponent, MetricsFilterComponent],
  templateUrl: './confidence-interval-page.component.html',
  styleUrls: ['./confidence-interval-page.component.scss']
})
export class ConfidenceIntervalPageComponent implements AfterViewInit {
  token: string | null = null;
  @ViewChild(ConfidenceIntervalComponent) confidenceIntervalComponent!: ConfidenceIntervalComponent;

  chartData: any; // Datos para la gráfica

  constructor(private monthlyResumeRepository: MonthlyResumeRepository,
    private dailyResumeRepository: DailyResumeRepository
  ) {}

  setToken(token: string) {
    this.token = token;
    if (this.confidenceIntervalComponent && 'setToken' in this.confidenceIntervalComponent) {
      (this.confidenceIntervalComponent as any).setToken(token);
    }
  }

  ngAfterViewInit(): void {}

onFilterChange(filterData: FilterData): void {
  console.log('ConfidenceIntervalPageComponent: Received filter data', filterData);

  if (filterData.filterType === 'month') {
    this.monthlyResumeRepository
      .getByRouteId(filterData.selectedYear, filterData.selectedMonth, filterData.selectedRoute)
      .subscribe(data => {
        console.log('ConfidenceIntervalPageComponent: Data fetched from repository (monthly)', data);
        this.chartData = data;
        if (this.confidenceIntervalComponent) {
          this.confidenceIntervalComponent.updateChartData(this.chartData);
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
          if (this.confidenceIntervalComponent) {
            this.confidenceIntervalComponent.updateChartData(this.chartData);
          }
        });
    } else {
      console.warn('ConfidenceIntervalPageComponent: selectedDay is undefined for daily filter');
    }
  }
}
}