import { Component, Inject, PLATFORM_ID, AfterViewInit, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, Chart } from 'chart.js';
import { GetAllDailyResumeUseCase } from '../../../domain/get-all-daily-resume-use-case';
import { GetAllMonthlyResumeUseCase } from '../../../domain/get-all-monthly-comparative';
import { DailyResumeRepository } from '../../../data/repository/daily-resume-repository';
import { MonthlyResumeRepository } from '../../../data/repository/monthly-resume-repository';
import { DailyResume } from '../../../data/models/daily-resume-route.model';
import { MonthlyResume } from '../../../data/models/monthly-comparative.model';

@Component({
  selector: 'app-high-occupancy',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './high-occupancy.component.html',
  styleUrls: ['./high-occupancy.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class HighOccupancyComponent implements AfterViewInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  chartType: 'doughnut' = 'doughnut';
  chartData: ChartConfiguration<'doughnut'>['data'] = { datasets: [] };
  chartOptions: ChartConfiguration<'doughnut'>['options'] = {};
  isBrowser = false;
  dataLoaded = false;
  dailyResumeData: DailyResume[] = [];
  monthlyResumeData: MonthlyResume[] = [];
  averageProbability = 0;
  currentFilter: 'daily' | 'monthly' = 'daily';
  private getAllDailyResume: GetAllDailyResumeUseCase;
  private getAllMonthlyResume: GetAllMonthlyResumeUseCase;

  get isDataLoaded(): boolean {
    return this.dataLoaded;
  }

  get chartStatus(): string {
    return this.dataLoaded ? `Datos cargados (Promedio: ${(this.averageProbability * 100).toFixed(1)}%)` : 'Cargando datos...';
  }

  constructor(
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Inject repository dependency  
    const dailyRepository = new DailyResumeRepository();
    const monthlyRepository = new MonthlyResumeRepository();
    this.getAllDailyResume = new GetAllDailyResumeUseCase(dailyRepository);
    this.getAllMonthlyResume = new GetAllMonthlyResumeUseCase(monthlyRepository);

    if (this.isBrowser) {
      // Use setTimeout to ensure the view is initialized
      setTimeout(() => {
        this.loadDataAndInitializeChart();
      }, 200);
    }
  }

  private async loadDataAndInitializeChart(): Promise<void> {
    try {
      console.log(`High Occupancy: Starting ${this.currentFilter} data load...`);
      
      if (this.currentFilter === 'daily') {
        const data = await this.getAllDailyResume.execute();
        console.log('High Occupancy: Daily data loaded:', data);
        
        if (data && data.length > 0) {
          this.dailyResumeData = data;
          this.calculateAverageProbability();
          console.log('High Occupancy: Average probability calculated:', this.averageProbability);
          this.initializeChartWithDailyData();
          
          // Force multiple change detection cycles
          this.cdr.detectChanges();
          setTimeout(() => {
            this.cdr.detectChanges();
            if (this.chart) {
              this.chart.update();
            }
          }, 100);
          
          console.log('High Occupancy: Chart initialized with daily data, dataLoaded:', this.dataLoaded);
        } else {
          console.log('High Occupancy: No daily data received, using test data');
          this.initializeChartWithTestData();
          this.cdr.detectChanges();
        }
      } else {
        const data = await this.getAllMonthlyResume.execute();
        console.log('High Occupancy: Monthly data loaded:', data);
        
        if (data && data.length > 0) {
          this.monthlyResumeData = data;
          this.calculateMonthlyAverageProbability();
          console.log('High Occupancy: Monthly average probability calculated:', this.averageProbability);
          this.initializeChartWithMonthlyData();
          
          // Force multiple change detection cycles
          this.cdr.detectChanges();
          setTimeout(() => {
            this.cdr.detectChanges();
            if (this.chart) {
              this.chart.update();
            }
          }, 100);
          
          console.log('High Occupancy: Chart initialized with monthly data, dataLoaded:', this.dataLoaded);
        } else {
          console.log('High Occupancy: No monthly data received, using test data');
          this.initializeChartWithTestData();
          this.cdr.detectChanges();
        }
      }
    } catch (error) {
      console.error('High Occupancy: Error loading daily resume data:', error);
      this.initializeChartWithTestData();
      this.cdr.detectChanges();
    }
  }

  private calculateAverageProbability(): void {
    if (this.dailyResumeData.length > 0) {
      const sum = this.dailyResumeData.reduce((acc, item) => acc + item.probabilidad_ocupacion_alta, 0);
      this.averageProbability = sum / this.dailyResumeData.length;
    }
  }

  private calculateMonthlyAverageProbability(): void {
    if (this.monthlyResumeData.length > 0) {
      const sum = this.monthlyResumeData.reduce((acc, item) => acc + item.probabilidad_ocupacion_alta, 0);
      this.averageProbability = sum / this.monthlyResumeData.length;
    }
  }

  private initializeChartWithDailyData(): void {
    const highOccupancyPercent = this.averageProbability * 100;
    const lowOccupancyPercent = 100 - highOccupancyPercent;

    this.chartData = {
      labels: ['Ocupación Alta (Día)', 'Ocupación Normal (Día)'],
      datasets: [
        {
          data: [highOccupancyPercent, lowOccupancyPercent],
          backgroundColor: [
            '#386641', 
            '#6A994E',
          ],
          borderColor: [
            '#386641',
            '#6A994E',
          ],
          borderWidth: 2,
          hoverBackgroundColor: [
            '#4A7C59',
            '#7BAD61',
          ],
        }
      ]
    };

    this.chartOptions = {
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            color: '#ffffff',
            font: {
              family: 'Poppins'
            },
            generateLabels: (chart: any) => {
              const colors = ['#386641', '#6A994E', '#7BAD61'];
              const datasets = chart.data.datasets;
              return datasets.map((dataset: any, i: number) => ({
                text: dataset.label || '',
                fillStyle: colors[i % colors.length] as any,
                strokeStyle: colors[i % colors.length] as any,
                lineWidth: 2,
                hidden: !chart.isDatasetVisible(i),
                index: i,
                fontColor: colors[i % colors.length] as any
              }));
            }
          }
        },
        tooltip: {
          titleFont: {
            family: 'Poppins'
          },
          bodyFont: {
            family: 'Poppins'
          },
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.parsed || 0;
              return `${label}: ${value.toFixed(1)}%`;
            }
          }
        }
      },
      cutout: '60%',
    };

    this.dataLoaded = true;
    console.log('High Occupancy: Daily chart initialized with real data, dataLoaded:', this.dataLoaded);
    
    this.cdr.markForCheck();
    this.cdr.detectChanges();
    
    setTimeout(() => {
      if (this.chart) {
        this.chart.update();
        console.log('High Occupancy: Daily chart updated');
      }
      this.cdr.detectChanges();
    }, 50);
  }

  private initializeChartWithMonthlyData(): void {
    const highOccupancyPercent = this.averageProbability * 100;
    const lowOccupancyPercent = 100 - highOccupancyPercent;

    this.chartData = {
      labels: ['Ocupación Alta (Mes)', 'Ocupación Normal (Mes)'],
      datasets: [
        {
          data: [highOccupancyPercent, lowOccupancyPercent],
          backgroundColor: [
            '#B91C1C', 
            '#EF4444',
          ],
          borderColor: [
            '#B91C1C',
            '#EF4444',
          ],
          borderWidth: 2,
          hoverBackgroundColor: [
            '#DC2626',
            '#F87171',
          ],
        }
      ]
    };

    this.chartOptions = {
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            generateLabels: (chart: any) => {
              const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
              const colors = ['#386641', '#6A994E', '#7BAD61'];
              return labels.map((label: any, index: number) => ({
                ...label,
                fontColor: colors[index % colors.length]
              }));
            }
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.parsed || 0;
              return `${label}: ${value.toFixed(1)}%`;
            }
          }
        }
      },
      cutout: '60%',
    };

    this.dataLoaded = true;
    console.log('High Occupancy: Monthly chart initialized with real data, dataLoaded:', this.dataLoaded);
    
    this.cdr.markForCheck();
    this.cdr.detectChanges();
    
    setTimeout(() => {
      if (this.chart) {
        this.chart.update();
        console.log('High Occupancy: Monthly chart updated');
      }
      this.cdr.detectChanges();
    }, 50);
  }

  private initializeChartWithData(): void {
    const highOccupancyPercent = this.averageProbability * 100;
    const lowOccupancyPercent = 100 - highOccupancyPercent;

    this.chartData = {
      labels: ['Ocupación Alta', 'Ocupación Normal'],
      datasets: [
        {
          data: [highOccupancyPercent, lowOccupancyPercent],
          backgroundColor: [
            '#386641', 
            '#6A994E',
          ],
          borderColor: [
            '#386641',
            '#6A994E',
          ],
          borderWidth: 2,
          hoverBackgroundColor: [
            '#4A7C59',
            '#7BAD61',
          ],
        }
      ]
    };

    this.chartOptions = {
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            generateLabels: (chart: any) => {
              const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
              const colors = ['#386641', '#6A994E', '#7BAD61'];
              return labels.map((label: any, index: number) => ({
                ...label,
                fontColor: colors[index % colors.length]
              }));
            }
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.parsed || 0;
              return `${label}: ${value.toFixed(1)}%`;
            }
          }
        }
      },
      cutout: '60%', // Makes it a doughnut instead of pie
    };

    this.dataLoaded = true;
    console.log('High Occupancy: Chart initialized with real data, dataLoaded:', this.dataLoaded);
    
    // Ensure the view updates immediately
    this.cdr.markForCheck();
    this.cdr.detectChanges();
    
    // Force chart update if chart exists
    setTimeout(() => {
      if (this.chart) {
        this.chart.update();
        console.log('High Occupancy: Chart updated');
      }
      this.cdr.detectChanges();
    }, 50);
  }

  private initializeChartWithTestData(): void {
    // Fallback test data
    const testProbability = 0.78; // 78% average
    const highOccupancyPercent = testProbability * 100;
    const lowOccupancyPercent = 100 - highOccupancyPercent;
    
    this.averageProbability = testProbability;

    this.chartData = {
      labels: ['Ocupación Alta', 'Ocupación Normal'],
      datasets: [
        {
          data: [highOccupancyPercent, lowOccupancyPercent],
          backgroundColor: [
            '#386641',
            '#6A994E',
          ],
          borderColor: [
            '#386641',
            '#6A994E',
          ],
          borderWidth: 2,
          hoverBackgroundColor: [
            '#4A7C59',
            '#7BAD61',
          ],
        }
      ]
    };

    this.chartOptions = {
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            generateLabels: (chart: any) => {
              const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
              const colors = ['#386641', '#6A994E', '#7BAD61'];
              return labels.map((label: any, index: number) => ({
                ...label,
                fontColor: colors[index % colors.length]
              }));
            }
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.parsed || 0;
              return `${label}: ${value.toFixed(1)}%`;
            }
          }
        }
      },
      cutout: '60%',
    };

    this.dataLoaded = true;
    console.log('High Occupancy: Chart initialized with fallback test data, dataLoaded:', this.dataLoaded);
    
    // Force chart update if chart exists
    setTimeout(() => {
      if (this.chart) {
        this.chart.update();
        console.log('High Occupancy: Test chart updated');
      }
      this.cdr.detectChanges();
    }, 50);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    console.log('High Occupancy: ngAfterViewInit called, chart reference:', this.chart);
    console.log('High Occupancy: dataLoaded status:', this.dataLoaded);
    
    // If data is already loaded but chart wasn't updated, force an update
    if (this.dataLoaded && this.chart) {
      setTimeout(() => {
        this.chart?.update();
        this.cdr.detectChanges();
        console.log('High Occupancy: Forced chart update in ngAfterViewInit');
      }, 100);
    }
    
    // Additional fallback - if still not loaded after a reasonable time, force test data
    if (!this.dataLoaded) {
      setTimeout(() => {
        if (!this.dataLoaded) {
          console.log('High Occupancy: Forcing fallback initialization');
          this.initializeChartWithTestData();
        }
      }, 1000);
    }

    console.log('High Occupancy: Chart data ready, should render automatically');
  }

  // Filter switching methods
  switchToDaily(): void {
    this.currentFilter = 'daily';
    this.dataLoaded = false;
    this.loadDataAndInitializeChart();
  }

  switchToMonthly(): void {
    this.currentFilter = 'monthly';
    this.dataLoaded = false;
    this.loadDataAndInitializeChart();
  }

  loadDataByMonthRange(year: number, month: number, routeId?: number): void {
    console.log(`High Occupancy: Loading data by month range - Year: ${year}, Month: ${month}, Route: ${routeId || 'All'}`);
    
    // Automatically switch to monthly filter when this method is called
    this.currentFilter = 'monthly';
    
    // Clear current data
    this.chartData = undefined as any;
    this.chartOptions = undefined as any;
    this.dataLoaded = false;

    try {
      // For now, use test data regardless of route (will be implemented later)
      // In future: filter by routeId if provided
      this.initializeChartWithMonthlyTestData();
    } catch (error) {
      console.error('High Occupancy: Error loading data by month range:', error);
      // Fallback to standard monthly data
      this.initializeChartWithMonthlyTestData();
    }
  }

  private initializeChartWithMonthlyTestData(): void {
    console.log('High Occupancy: Initializing chart with monthly test data');
    
    // Calculate average probability from available monthly data only
    // Simulating dynamic data where only some months have data
    const availableMonthlyProbabilities = [0.77, 0.79, 0.78, 0.72, 0.85, 0.80, 0.88];
    const averageProbability = availableMonthlyProbabilities.reduce((a, b) => a + b, 0) / availableMonthlyProbabilities.length;
    
    this.averageProbability = averageProbability;
    
    const highOccupancyPercent = averageProbability * 100;
    const lowOccupancyPercent = 100 - highOccupancyPercent;

    this.chartData = {
      labels: ['Ocupación Alta', 'Ocupación Normal'],
      datasets: [
        {
          data: [highOccupancyPercent, lowOccupancyPercent],
          backgroundColor: [
            '#386641', 
            '#6A994E',
          ],
          borderColor: [
            '#386641',
            '#6A994E',
          ],
          borderWidth: 2,
          hoverBackgroundColor: [
            '#4A7C59',
            '#7BAD61',
          ],
        }
      ]
    };

    this.chartOptions = {
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            generateLabels: (chart: any) => {
              const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
              const colors = ['#386641', '#6A994E', '#7BAD61'];
              return labels.map((label: any, index: number) => ({
                ...label,
                fontColor: colors[index % colors.length]
              }));
            }
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.parsed || 0;
              return `${label}: ${value.toFixed(1)}%`;
            },
            afterBody: () => {
              return [`Basado en ${availableMonthlyProbabilities.length} meses disponibles`];
            }
          }
        }
      },
      cutout: '60%', // Makes it a doughnut instead of pie
    };

    this.dataLoaded = true;
    this.forceChartUpdate();
  }

  private forceChartUpdate(): void {
    if (this.chart) {
      // Three-step update process for Chart.js reliability
      setTimeout(() => {
        if (this.chart) {
          this.chart.update('none');
        }
      }, 50);

      setTimeout(() => {
        if (this.chart) {
          this.chart.chart?.resize();
          this.chart.update('active');
        }
      }, 150);

      setTimeout(() => {
        if (this.chart) {
          this.chart.update();
        }
      }, 300);
    }
  }

  getCurrentFilterLabel(): string {
    return this.currentFilter === 'daily' ? 'Filtro Diario' : 'Filtro Mensual';
  }
}
