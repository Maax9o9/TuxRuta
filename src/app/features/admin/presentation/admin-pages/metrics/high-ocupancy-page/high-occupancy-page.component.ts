import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HighOccupancyComponent } from '../../../../components/dashboard/high-occupancy/high-occupancy.component';
import { MetricsFilterComponent, FilterData } from '../../../../components/shared/metrics-filter/metrics-filter.component';

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

  // Initial filter data
  initialFilterData: FilterData = {
    filterType: 'month',
    selectedYear: 2025,
    selectedMonth: 7,
    selectedRoute: 1
  };

  constructor() {}

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
    console.log(`High Occupancy Page: Filter changed`, filterData);
    
    if (this.highOccupancyComponent) {
      this.applyFilterToComponent(filterData);
    } else {
      console.log('High Occupancy Page: Component not available yet');
    }
  }

  private applyFilterToComponent(filterData: FilterData): void {
    const component = this.highOccupancyComponent;
    
    switch (filterData.filterType) {
      case 'month':
        console.log(`High Occupancy Page: Applying month filter - Year: ${filterData.selectedYear}, Month: ${filterData.selectedMonth}, Route: ${filterData.selectedRoute}`);
        if (component.loadDataByMonthRange) {
          component.loadDataByMonthRange(filterData.selectedYear, filterData.selectedMonth, filterData.selectedRoute);
        } else if (component.switchToMonthly) {
          component.switchToMonthly();
        }
        break;
      case 'week':
        console.log(`High Occupancy Page: Applying week filter - Route: ${filterData.selectedRoute}`);
        if (component.switchToDaily) {
          component.switchToDaily();
        }
        break;
    }
  }
}
