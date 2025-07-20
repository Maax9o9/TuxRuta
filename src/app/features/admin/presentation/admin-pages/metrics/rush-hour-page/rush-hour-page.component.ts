import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RushHourComponent } from '../../../../components/dashboard/rush-hour/rush-hour.component';
import { MetricsFilterComponent, FilterData } from '../../../../components/shared/metrics-filter/metrics-filter.component';

@Component({
  selector: 'app-rush-hour-page',
  standalone: true,
  imports: [CommonModule, RushHourComponent, MetricsFilterComponent],
  templateUrl: './rush-hour-page.component.html',
  styleUrls: ['./rush-hour-page.component.scss']
})
export class RushHourPageComponent implements AfterViewInit {
  @ViewChild(RushHourComponent) rushHourComponent!: RushHourComponent;

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
    console.log(`Rush Hour Page: Filter changed`, filterData);
    
    if (this.rushHourComponent) {
      this.applyFilterToComponent(filterData);
    } else {
      console.log('Rush Hour Page: Component not available yet');
    }
  }

  private applyFilterToComponent(filterData: FilterData): void {
    const component = this.rushHourComponent;
    
    switch (filterData.filterType) {
      case 'month':
        console.log(`Rush Hour Page: Applying month filter - Year: ${filterData.selectedYear}, Month: ${filterData.selectedMonth}, Route: ${filterData.selectedRoute}`);
        if (component.loadDataByMonthRange) {
          component.loadDataByMonthRange(filterData.selectedYear, filterData.selectedMonth, filterData.selectedRoute);
        } else if (component.switchToMonthly) {
          component.switchToMonthly();
        }
        break;
      case 'week':
        console.log(`Rush Hour Page: Applying week filter - Route: ${filterData.selectedRoute}`);
        if (component.switchToDaily) {
          component.switchToDaily();
        }
        break;
    }
  }
}
