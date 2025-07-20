import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PassengersTotalComponent } from '../../../../components/dashboard/passengers-total/passengers-total.component';
import { MetricsFilterComponent, FilterData } from '../../../../components/shared/metrics-filter/metrics-filter.component';

@Component({
  selector: 'app-passenger-total-page',
  standalone: true,
  imports: [CommonModule, PassengersTotalComponent, MetricsFilterComponent],
  templateUrl: './passenger-total-page.component.html',
  styleUrls: ['./passenger-total-page.component.scss']
})
export class PassengerTotalPageComponent implements AfterViewInit {
  @ViewChild(PassengersTotalComponent) passengersTotalComponent!: PassengersTotalComponent;

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
    console.log(`Passengers Total Page: Filter changed`, filterData);
    
    if (this.passengersTotalComponent) {
      this.applyFilterToComponent(filterData);
    } else {
      console.log('Passengers Total Page: Component not available yet');
    }
  }

  private applyFilterToComponent(filterData: FilterData): void {
    const component = this.passengersTotalComponent;
    
    switch (filterData.filterType) {
      case 'month':
        console.log(`Passengers Total Page: Applying month filter - Year: ${filterData.selectedYear}, Month: ${filterData.selectedMonth}, Route: ${filterData.selectedRoute}`);
        if (component.loadDataByMonthRange) {
          component.loadDataByMonthRange(filterData.selectedYear, filterData.selectedMonth, filterData.selectedRoute);
        } else if (component.switchToMonthly) {
          component.switchToMonthly();
        }
        break;
      case 'week':
        console.log(`Passengers Total Page: Applying week filter - Route: ${filterData.selectedRoute}`);
        if (component.switchToDaily) {
          component.switchToDaily();
        }
        break;
    }
  }
}
