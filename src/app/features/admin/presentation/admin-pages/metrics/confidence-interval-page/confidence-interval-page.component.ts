import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfidenceIntervalComponent } from '../../../../components/dashboard/confidence-interval/confidence-interval.component';
import { MetricsFilterComponent, FilterData } from '../../../../components/shared/metrics-filter/metrics-filter.component';

@Component({
  selector: 'app-confidence-interval-page',
  standalone: true,
  imports: [CommonModule, ConfidenceIntervalComponent, MetricsFilterComponent],
  templateUrl: './confidence-interval-page.component.html',
  styleUrls: ['./confidence-interval-page.component.scss']
})
export class ConfidenceIntervalPageComponent implements AfterViewInit {
  @ViewChild(ConfidenceIntervalComponent) confidenceIntervalComponent!: ConfidenceIntervalComponent;

  // Initial filter data
  initialFilterData: FilterData = {
    filterType: 'month',
    selectedYear: 2025,
    selectedMonth: 7,
    selectedRoute: 1
  };

  constructor() {}

  ngAfterViewInit(): void {
    // Initial load with default filters
    setTimeout(() => {
      this.onFilterChange(this.initialFilterData);
    }, 500);
  }

  onFilterChange(filterData: FilterData): void {
    console.log(`Confidence Interval Page: Filter changed`, filterData);
    
    if (this.confidenceIntervalComponent) {
      this.applyFilterToComponent(filterData);
    } else {
      console.log('Confidence Interval Page: Component not available yet');
    }
  }

  private applyFilterToComponent(filterData: FilterData): void {
    const component = this.confidenceIntervalComponent;
    
    switch (filterData.filterType) {
      case 'month':
        console.log(`Confidence Interval Page: Applying month filter - Year: ${filterData.selectedYear}, Month: ${filterData.selectedMonth}, Route: ${filterData.selectedRoute}`);
        if (component.loadDataByMonthRange) {
          component.loadDataByMonthRange(filterData.selectedYear, filterData.selectedMonth, filterData.selectedRoute);
        } else if (component.switchToMonthly) {
          component.switchToMonthly();
        }
        break;
      case 'week':
        console.log(`Confidence Interval Page: Applying week filter - Route: ${filterData.selectedRoute}`);
        if (component.switchToDaily) {
          component.switchToDaily();
        }
        break;
    }
  }
}
