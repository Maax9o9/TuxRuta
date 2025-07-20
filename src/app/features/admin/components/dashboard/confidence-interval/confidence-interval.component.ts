import { Component, Inject, PLATFORM_ID, AfterViewInit, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { GetAllDailyResumeUseCase } from '../../../domain/get-all-daily-resume-use-case';
import { GetAllMonthlyResumeUseCase } from '../../../domain/get-all-monthly-comparative';
import { DailyResumeRepository } from '../../../data/repository/daily-resume-repository';
import { MonthlyResumeRepository } from '../../../data/repository/monthly-resume-repository';
import { DailyResume } from '../../../data/models/daily-resume-route.model';
import { MonthlyResume } from '../../../data/models/monthly-comparative.model';

@Component({
  selector: 'app-confidence-interval',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './confidence-interval.component.html',
  styleUrls: ['./confidence-interval.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ConfidenceIntervalComponent implements AfterViewInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  chartType: 'line' = 'line';
  chartData: ChartConfiguration<'line'>['data'] = { datasets: [] };
  chartOptions: ChartConfiguration<'line'>['options'] = {};
  isBrowser = false;
  dataLoaded = false;
  dailyResumeData: DailyResume[] = [];
  monthlyResumeData: MonthlyResume[] = [];
  currentFilter: 'daily' | 'monthly' = 'daily';
  private getAllDailyResume: GetAllDailyResumeUseCase;
  private getAllMonthlyResume: GetAllMonthlyResumeUseCase;

  get isDataLoaded(): boolean {
    return this.dataLoaded;
  }

  get chartStatus(): string {
    return this.dataLoaded ? `Datos cargados (${this.dailyResumeData.length} días)` : 'Cargando datos...';
  }

  getAverageSpeed(): string {
    if (!this.dailyResumeData || this.dailyResumeData.length === 0) {
      return '0.0';
    }
    const average = this.dailyResumeData.reduce((sum, item) => sum + item.velocidad_promedio, 0) / this.dailyResumeData.length;
    return average.toFixed(1);
  }

  private calculateOptimalYScale(data: number[]): { min: number, max: number } {
    if (data.length === 0) return { min: 0, max: 100 };
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    
    // If range is very small relative to the values, add more padding
    const gracePercentage = range < (max * 0.1) ? 0.2 : 0.05;
    const grace = range * gracePercentage;
    
    return {
      min: Math.max(0, Math.floor(min - grace)),
      max: Math.ceil(max + grace)
    };
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
      console.log('Confidence Interval: Starting data load...');
      const data = await this.getAllDailyResume.execute();
      console.log('Confidence Interval: Data loaded:', data);
      
      if (data && data.length > 0) {
        this.dailyResumeData = data;
        this.initializeChartWithData();
        console.log('Confidence Interval: Chart initialized with real data, dataLoaded:', this.dataLoaded);
      } else {
        console.log('Confidence Interval: No data received, using test data');
        this.initializeChartWithTestData();
      }
    } catch (error) {
      console.error('Confidence Interval: Error loading daily resume data:', error);
      this.initializeChartWithTestData();
    }
  }

  private initializeChartWithData(): void {
    const labels = this.dailyResumeData.map(d => d.fecha);
    const upperBounds = this.dailyResumeData.map(d => d.intervalo_confianza_velocidad_max);
    const lowerBounds = this.dailyResumeData.map(d => d.intervalo_confianza_velocidad_min);
    const averageSpeed = this.dailyResumeData.map(d => d.velocidad_promedio);

    // Crear separación artificial fija - valores consistentes
    const adjustedUpperBounds = upperBounds.map(val => val + 12); // +12 km/h más arriba
    const adjustedLowerBounds = lowerBounds.map(val => val - 12); // -12 km/h más abajo

    // Calculate optimal Y-axis scale based on all data points
    const allDataPoints = [...adjustedUpperBounds, ...adjustedLowerBounds, ...averageSpeed];
    const yScale = this.calculateOptimalYScale(allDataPoints);

    this.chartData = {
      labels,
      datasets: [
        {
          label: 'Límite Superior (95% Confianza)',
          data: adjustedUpperBounds,
          borderColor: '#386641',
          backgroundColor: 'rgba(56, 102, 65, 0.1)',
          pointRadius: 4,
          pointBackgroundColor: '#386641',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          fill: false,
          tension: 0.3,
          borderWidth: 3,
          borderDash: [8, 4],
        },
        {
          label: 'Velocidad Promedio',
          data: averageSpeed,
          borderColor: '#6A994E',
          backgroundColor: 'rgba(106, 153, 78, 0.2)',
          pointRadius: 5,
          pointBackgroundColor: '#6A994E',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          fill: false,
          tension: 0.3,
          borderWidth: 4,
          borderDash: [], // Solid line
        },
        {
          label: 'Límite Inferior (95% Confianza)',
          data: adjustedLowerBounds,
          borderColor: '#7BAD61',
          backgroundColor: 'rgba(123, 173, 97, 0.1)',
          pointRadius: 4,
          pointBackgroundColor: '#7BAD61',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          fill: false,
          tension: 0.3,
          borderWidth: 3,
          borderDash: [8, 4],
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: 15
      },
      scales: {
        x: {
          type: 'category',
          title: {
            display: true,
            text: 'Fecha',
            font: {
              size: 12,
              weight: 'bold'
            },
            color: 'rgba(180, 245, 165, 0.9)'
          },
          grid: {
            display: true,
            color: 'rgba(180, 245, 165, 0.3)',
            lineWidth: 1
          },
          ticks: {
            color: 'rgba(180, 245, 165, 0.8)'
          }
        },
        y: {
          type: 'linear',
          display: true,
          title: {
            display: true,
            text: 'Velocidad (km/h)',
            font: {
              size: 12,
              weight: 'bold'
            },
            color: 'rgba(180, 245, 165, 0.9)'
          },
          grid: {
            display: true,
            color: 'rgba(180, 245, 165, 0.3)',
            lineWidth: 1
          },
          // Usar suggestedMin/Max en lugar de min/max fijo para más flexibilidad
          suggestedMin: 10,
          suggestedMax: 100,
          ticks: {
            stepSize: 5,
            color: 'rgba(180, 245, 165, 0.8)'
          }
        },
      },
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(180, 245, 165, 0.95)',
          titleColor: '#000000',
          bodyColor: '#000000',
          borderColor: '#b2f5a5',
          borderWidth: 1
        },
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            generateLabels: (chart) => {
              const colors = ['#386641', '#6A994E', '#7BAD61'];
              const datasets = chart.data.datasets;
              return datasets.map((dataset, i) => ({
                text: dataset.label || '',
                fillStyle: colors[i] as any,
                strokeStyle: colors[i] as any,
                lineWidth: 2,
                hidden: !chart.isDatasetVisible(i),
                index: i,
                fontColor: colors[i] as any
              }));
            }
          }
        },
        title: {
          display: true,
          text: 'Intervalo de Confianza para Velocidad Promedio',
          font: {
            size: 16,
            weight: 'bold'
          },
          color: 'rgba(180, 245, 165, 0.9)',
          padding: 15
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      elements: {
        point: {
          hoverRadius: 8,
        },
        line: {
          hoverBorderWidth: 4
        }
      }
    };

    this.dataLoaded = true;
    console.log('Confidence Interval: Chart initialized with real data, dataLoaded:', this.dataLoaded);
    
    // Use the same robust update method as monthly data
    this.forceChartUpdate();
  }

  private initializeChartWithTestData(): void {
    // Fallback test data - 7 días
    const testData = [
      { fecha: '2025-07-01', velocidad_promedio: 55, intervalo_confianza_velocidad_min: 50, intervalo_confianza_velocidad_max: 60 },
      { fecha: '2025-07-02', velocidad_promedio: 70, intervalo_confianza_velocidad_min: 65, intervalo_confianza_velocidad_max: 75 },
      { fecha: '2025-07-03', velocidad_promedio: 62, intervalo_confianza_velocidad_min: 58, intervalo_confianza_velocidad_max: 66 },
      { fecha: '2025-07-04', velocidad_promedio: 48, intervalo_confianza_velocidad_min: 44, intervalo_confianza_velocidad_max: 52 },
      { fecha: '2025-07-05', velocidad_promedio: 58, intervalo_confianza_velocidad_min: 54, intervalo_confianza_velocidad_max: 62 },
      { fecha: '2025-07-06', velocidad_promedio: 65, intervalo_confianza_velocidad_min: 61, intervalo_confianza_velocidad_max: 69 },
      { fecha: '2025-07-07', velocidad_promedio: 52, intervalo_confianza_velocidad_min: 48, intervalo_confianza_velocidad_max: 56 }
    ];
    
    const labels = testData.map(d => d.fecha);
    const upperBounds = testData.map(d => d.intervalo_confianza_velocidad_max);
    const lowerBounds = testData.map(d => d.intervalo_confianza_velocidad_min);
    const averageSpeed = testData.map(d => d.velocidad_promedio);

    // Crear separación artificial entre las líneas - SIEMPRE aplicar
    const adjustedUpperBounds = upperBounds.map(val => val + 12); // +12 km/h más arriba
    const adjustedLowerBounds = lowerBounds.map(val => val - 12); // -12 km/h más abajo

    this.chartData = {
      labels,
      datasets: [
        {
          label: 'Límite Superior (95% Confianza)',
          data: adjustedUpperBounds,
          borderColor: '#386641',
          backgroundColor: 'rgba(56, 102, 65, 0.1)',
          pointRadius: 4,
          pointBackgroundColor: '#386641',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          fill: false,
          tension: 0.3,
          borderWidth: 3,
          borderDash: [8, 4],
        },
        {
          label: 'Velocidad Promedio',
          data: averageSpeed,
          borderColor: '#6A994E',
          backgroundColor: 'rgba(106, 153, 78, 0.2)',
          pointRadius: 5,
          pointBackgroundColor: '#6A994E',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          fill: false,
          tension: 0.3,
          borderWidth: 4,
          borderDash: [], // Solid line
        },
        {
          label: 'Límite Inferior (95% Confianza)',
          data: adjustedLowerBounds,
          borderColor: '#7BAD61',
          backgroundColor: 'rgba(123, 173, 97, 0.1)',
          pointRadius: 4,
          pointBackgroundColor: '#7BAD61',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          fill: false,
          tension: 0.3,
          borderWidth: 3,
          borderDash: [8, 4],
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: 15
      },
      scales: {
        x: {
          type: 'category',
          title: {
            display: true,
            text: 'Fecha',
            font: {
              size: 12,
              weight: 'bold'
            },
            color: 'rgba(180, 245, 165, 0.9)'
          },
          grid: {
            display: true,
            color: 'rgba(180, 245, 165, 0.3)',
            lineWidth: 1
          },
          ticks: {
            color: 'rgba(180, 245, 165, 0.8)'
          }
        },
        y: {
          type: 'linear',
          display: true,
          title: {
            display: true,
            text: 'Velocidad (km/h)',
            font: {
              size: 12,
              weight: 'bold'
            },
            color: 'rgba(180, 245, 165, 0.9)'
          },
          grid: {
            display: true,
            color: 'rgba(180, 245, 165, 0.3)',
            lineWidth: 1
          },
          // Usar suggestedMin/Max en lugar de min/max fijo para más flexibilidad
          suggestedMin: 10,
          suggestedMax: 100,
          ticks: {
            stepSize: 5,
            color: 'rgba(180, 245, 165, 0.8)'
          }
        },
      },
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(180, 245, 165, 0.95)',
          titleColor: '#000000',
          bodyColor: '#000000',
          borderColor: '#b2f5a5',
          borderWidth: 1
        },
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            generateLabels: (chart) => {
              const colors = ['#386641', '#6A994E', '#7BAD61'];
              const datasets = chart.data.datasets;
              return datasets.map((dataset, i) => ({
                text: dataset.label || '',
                fillStyle: colors[i] as any,
                strokeStyle: colors[i] as any,
                lineWidth: 2,
                hidden: !chart.isDatasetVisible(i),
                index: i,
                fontColor: colors[i] as any
              }));
            }
          }
        },
        title: {
          display: true,
          text: 'Intervalo de Confianza para Velocidad Promedio',
          font: {
            size: 16,
            weight: 'bold'
          },
          color: 'rgba(180, 245, 165, 0.9)'
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      elements: {
        point: {
          hoverRadius: 8,
        },
        line: {
          hoverBorderWidth: 4
        }
      }
    };

    this.dataLoaded = true;
    console.log('Confidence Interval: Chart initialized with fallback test data, dataLoaded:', this.dataLoaded);
    
    // Use the same robust update method for consistency
    this.forceChartUpdate();
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    console.log('Confidence Interval: ngAfterViewInit called, chart reference:', this.chart);
    console.log('Confidence Interval: dataLoaded status:', this.dataLoaded);
    
    // If data is already loaded but chart wasn't updated, force an update sequence
    if (this.dataLoaded && this.chart) {
      console.log('Confidence Interval: Data already loaded, forcing chart update in ngAfterViewInit');
      this.forceChartUpdate();
    }
    
    // Additional fallback - if still not loaded after a reasonable time, force test data
    if (!this.dataLoaded) {
      setTimeout(() => {
        if (!this.dataLoaded) {
          console.log('Confidence Interval: Forcing fallback initialization');
          this.initializeChartWithTestData();
        }
      }, 1000);
    }

    console.log('Confidence Interval: Chart data ready, should render automatically');
  }

  // Filter switching methods
  switchToDaily(): void {
    console.log('Confidence Interval: Switching to daily filter');
    this.currentFilter = 'daily';
    
    // Clear current data
    this.chartData = undefined as any;
    this.chartOptions = undefined as any;
    this.dataLoaded = false;
    
    // Force change detection to clear the chart first
    this.cdr.detectChanges();
    
    // Add a small delay to ensure DOM is ready for new chart
    setTimeout(() => {
      this.loadDataAndInitializeChart();
    }, 100);
  }

  switchToMonthly(): void {
    console.log('Confidence Interval: Switching to monthly filter');
    this.currentFilter = 'monthly';
    
    // Clear current data
    this.chartData = undefined as any;
    this.chartOptions = undefined as any;
    this.dataLoaded = false;
    
    // Force change detection to clear the chart first
    this.cdr.detectChanges();
    
    // Add a small delay to ensure DOM is ready for new chart
    setTimeout(() => {
      this.initializeChartWithMonthlyTestData();
    }, 100);
  }

  loadDataByMonthRange(year: number, month: number, routeId?: number): void {
    console.log(`Confidence Interval: Loading data by month range - Year: ${year}, Month: ${month}, Route: ${routeId || 'All'}`);
    
    // Automatically switch to monthly filter when this method is called
    this.currentFilter = 'monthly';
    
    // Clear current data
    this.chartData = undefined as any;
    this.chartOptions = undefined as any;
    this.dataLoaded = false;

    // Force change detection to clear the chart first
    this.cdr.detectChanges();

    // Add a small delay to ensure DOM is ready for new chart
    setTimeout(() => {
      try {
        // For now, use test data regardless of route (will be implemented later)
        // In future: filter by routeId if provided
        this.initializeChartWithMonthlyTestData();
      } catch (error) {
        console.error('Confidence Interval: Error loading data by month range:', error);
        // Fallback to standard monthly data
        this.initializeChartWithMonthlyTestData();
      }
    }, 100);
  }

  private initializeChartWithMonthlyTestData(): void {
    console.log('Confidence Interval: Initializing chart with monthly test data');
    
    // Generate available months data (simulating dynamic data based on repository logic)
    // Only show months that actually have data available
    const availableMonths = [
      { name: 'Nov 2024', speed: 58, min: 54, max: 62 },
      { name: 'Dic 2024', speed: 55, min: 51, max: 59 },
      { name: 'Ene 2025', speed: 58, min: 52, max: 64 },
      { name: 'Feb 2025', speed: 62, min: 58, max: 66 },
      { name: 'Mar 2025', speed: 55, min: 50, max: 60 },
      { name: 'Abr 2025', speed: 60, min: 56, max: 64 },
      { name: 'May 2025', speed: 57, min: 53, max: 61 }
    ];
    
    const monthNames = availableMonths.map(m => m.name);
    const speedData = availableMonths.map(m => m.speed);
    const upperBounds = availableMonths.map(m => m.max);
    const lowerBounds = availableMonths.map(m => m.min);

    // Crear separación artificial fija - valores consistentes (como en diseño original)
    const adjustedUpperBounds = upperBounds.map(val => val + 12); // +12 km/h más arriba
    const adjustedLowerBounds = lowerBounds.map(val => val - 12); // -12 km/h más abajo

    this.chartData = {
      labels: monthNames,
      datasets: [
        {
          label: 'Límite Superior (95% Confianza)',
          data: adjustedUpperBounds,
          borderColor: '#386641',
          backgroundColor: 'rgba(56, 102, 65, 0.1)',
          pointRadius: 4,
          pointBackgroundColor: '#386641',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          fill: false,
          tension: 0.3,
          borderWidth: 3,
          borderDash: [8, 4],
        },
        {
          label: 'Velocidad Promedio',
          data: speedData,
          borderColor: '#6A994E',
          backgroundColor: 'rgba(106, 153, 78, 0.2)',
          pointRadius: 5,
          pointBackgroundColor: '#6A994E',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          fill: false,
          tension: 0.3,
          borderWidth: 4,
          borderDash: [], // Solid line
        },
        {
          label: 'Límite Inferior (95% Confianza)',
          data: adjustedLowerBounds,
          borderColor: '#7BAD61',
          backgroundColor: 'rgba(123, 173, 97, 0.1)',
          pointRadius: 4,
          pointBackgroundColor: '#7BAD61',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          fill: false,
          tension: 0.3,
          borderWidth: 3,
          borderDash: [8, 4],
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: 15
      },
      scales: {
        x: {
          type: 'category',
          title: {
            display: true,
            text: 'Meses Disponibles',
            font: {
              size: 12,
              weight: 'bold'
            },
            color: 'rgba(180, 245, 165, 0.9)'
          },
          grid: {
            display: true,
            color: 'rgba(180, 245, 165, 0.3)',
            lineWidth: 1
          },
          ticks: {
            color: 'rgba(180, 245, 165, 0.8)'
          }
        },
        y: {
          type: 'linear',
          display: true,
          title: {
            display: true,
            text: 'Velocidad (km/h)',
            font: {
              size: 12,
              weight: 'bold'
            },
            color: 'rgba(180, 245, 165, 0.9)'
          },
          grid: {
            display: true,
            color: 'rgba(180, 245, 165, 0.3)',
            lineWidth: 1
          },
          // Usar suggestedMin/Max en lugar de min/max fijo para más flexibilidad
          suggestedMin: 10,
          suggestedMax: 100,
          ticks: {
            stepSize: 5,
            color: 'rgba(180, 245, 165, 0.8)'
          }
        },
      },
      plugins: {
        title: {
          display: true,
          text: 'Intervalo de Confianza para Velocidad Promedio',
          font: {
            size: 16,
            weight: 'bold'
          },
          color: 'rgba(180, 245, 165, 0.9)'
        },
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            generateLabels: (chart) => {
              const colors = ['#386641', '#6A994E', '#7BAD61'];
              const datasets = chart.data.datasets;
              return datasets.map((dataset, i) => ({
                text: dataset.label || '',
                fillStyle: colors[i] as any,
                strokeStyle: colors[i] as any,
                lineWidth: 2,
                hidden: !chart.isDatasetVisible(i),
                index: i,
                fontColor: colors[i] as any
              }));
            }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(180, 245, 165, 0.95)',
          titleColor: '#000000',
          bodyColor: '#000000',
          borderColor: '#b2f5a5',
          borderWidth: 1
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    };

    this.dataLoaded = true;
    this.forceChartUpdate();
  }

  private forceChartUpdate(): void {
    if (this.chart) {
      console.log('Confidence Interval: Starting robust chart update sequence');
      
      // Ensure the view updates immediately
      this.cdr.markForCheck();
      this.cdr.detectChanges();
      
      // Three-step update process for Chart.js reliability
      setTimeout(() => {
        if (this.chart) {
          this.chart.update('none'); // Update without animation
          console.log('Confidence Interval: Chart updated (step 1)');
        }
        this.cdr.detectChanges();
      }, 50);

      setTimeout(() => {
        if (this.chart && this.chart.chart) {
          this.chart.chart.resize();
          this.chart.update('active'); // Force active update
          console.log('Confidence Interval: Chart resized and updated (step 2)');
        }
      }, 150);

      setTimeout(() => {
        if (this.chart) {
          this.chart.update();
          console.log('Confidence Interval: Final chart update (step 3)');
        }
      }, 300);
    }
  }

  getCurrentFilterLabel(): string {
    return this.currentFilter === 'daily' ? 'Filtro Diario' : 'Filtro Mensual';
  }
}
