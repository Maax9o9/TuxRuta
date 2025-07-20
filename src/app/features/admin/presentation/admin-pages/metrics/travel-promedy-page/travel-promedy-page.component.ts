import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TravelPromedyComponent } from '../../../../components/dashboard/travel-promedy/travel-promedy.component';
import { MetricsFilterComponent, FilterData } from '../../../../components/shared/metrics-filter/metrics-filter.component';

@Component({
  selector: 'app-travel-promedy-page',
  standalone: true,
  imports: [CommonModule, TravelPromedyComponent, MetricsFilterComponent],
  templateUrl: './travel-promedy-page.component.html',
  styleUrls: ['./travel-promedy-page.component.scss']
})
export class TravelPromedyPageComponent implements AfterViewInit {
  @ViewChild(TravelPromedyComponent) travelPromedyComponent!: TravelPromedyComponent;

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
    console.log(`Travel Promedy Page: Filter changed`, filterData);
    
    if (this.travelPromedyComponent) {
      this.applyFilterToComponent(filterData);
    } else {
      console.log('Travel Promedy Page: Component not available yet');
    }
  }

  private applyFilterToComponent(filterData: FilterData): void {
    const component = this.travelPromedyComponent;
    
    switch (filterData.filterType) {
      case 'month':
        console.log(`Travel Promedy Page: Applying month filter - Year: ${filterData.selectedYear}, Month: ${filterData.selectedMonth}, Route: ${filterData.selectedRoute}`);
        if (component.loadDataByMonthRange) {
          component.loadDataByMonthRange(filterData.selectedYear, filterData.selectedMonth, filterData.selectedRoute);
        } else if (component.switchToMonthly) {
          component.switchToMonthly();
        }
        break;
      case 'week':
        console.log(`Travel Promedy Page: Applying week filter - Route: ${filterData.selectedRoute}`);
        if (component.switchToDaily) {
          component.switchToDaily();
        }
        break;
    }
  }
}
