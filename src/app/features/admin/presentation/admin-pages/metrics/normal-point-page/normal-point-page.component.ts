import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NormalDistributionComponent } from '../../../../components/dashboard/normal-point/normal-point.component';
import { MetricsFilterComponent, FilterData } from '../../../../components/shared/metrics-filter/metrics-filter.component';

@Component({
  selector: 'app-normal-point-page',
  standalone: true,
  imports: [CommonModule, NormalDistributionComponent, MetricsFilterComponent],
  templateUrl: './normal-point-page.component.html',
  styleUrls: ['./normal-point-page.component.scss']
})
export class NormalPointPageComponent implements AfterViewInit {
  token: string | null = null;
  @ViewChild(NormalDistributionComponent) normalDistributionComponent!: NormalDistributionComponent;

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
    console.log(`Normal Distribution Page: Filter changed`, filterData);
    
    if (this.normalDistributionComponent) {
      this.applyFilterToComponent(filterData);
    } else {
      console.log('Normal Distribution Page: Component not available yet');
    }
  }

  private applyFilterToComponent(filterData: FilterData): void {
    const component = this.normalDistributionComponent;
    
    switch (filterData.filterType) {
      case 'month':
        console.log(`Normal Distribution Page: Applying month filter - Year: ${filterData.selectedYear}, Month: ${filterData.selectedMonth}, Route: ${filterData.selectedRoute}`);
        if (component.loadDataByMonthRange) {
          component.loadDataByMonthRange(filterData.selectedYear, filterData.selectedMonth, filterData.selectedRoute);
        } else if (component.switchToMonthly) {
          component.switchToMonthly();
        }
        break;
      case 'week':
        console.log(`Normal Distribution Page: Applying week filter - Route: ${filterData.selectedRoute}`);
        if (component.switchToDaily) {
          component.switchToDaily();
        }
        break;
    }
  }
}
