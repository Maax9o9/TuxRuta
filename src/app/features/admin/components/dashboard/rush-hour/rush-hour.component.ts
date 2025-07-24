import { Component, Inject, PLATFORM_ID, AfterViewInit, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, Chart } from 'chart.js';
import { GetAllDailyResumeUseCase } from '../../../domain/daily-resume/get-all-daily-resume-use-case';
import { GetAllMonthlyResumeUseCase } from '../../../domain/monthly-resume/get-all-monthly-comparative';
import { DailyResumeRepository } from '../../../data/repository/daily-resume-repository';
import { MonthlyResumeRepository } from '../../../data/repository/monthly-resume-repository';
import { DailyResume } from '../../../data/models/daily-resume-route.model';
import { MonthlyResume } from '../../../data/models/monthly-comparative.model';

@Component({
  selector: 'app-rush-hour',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './rush-hour.component.html',
  styleUrls: ['./rush-hour.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class RushHourComponent implements AfterViewInit {
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

  getMostCommonRushHour(): string {
    if (!this.dailyResumeData || this.dailyResumeData.length === 0) {
      return 'N/A';
    }
    
    // Count frequency of each rush hour
    const hourCounts: { [key: string]: number } = {};
    this.dailyResumeData.forEach(item => {
      const hour = item.hora_pico;
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    // Find the most common hour
    let mostCommon = '';
    let maxCount = 0;
    for (const [hour, count] of Object.entries(hourCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = hour;
      }
    }
    
    return mostCommon;
  }

  getAveragePassengersAtRushHour(): string {
    if (!this.dailyResumeData || this.dailyResumeData.length === 0) {
      return '0.0';
    }
    
    const average = this.dailyResumeData.reduce((sum, item) => sum + item.pasajeros_promedio_por_viaje, 0) / this.dailyResumeData.length;
    return average.toFixed(1);
  }

  // Convert time string to minutes for plotting
  private timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Convert minutes back to time string for display
  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  private calculateOptimalYScale(data: number[]): { min: number, max: number } {
    if (data.length === 0) return { min: 360, max: 600 }; // Default to 6:00-10:00 AM
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    
    // For time data, use a smaller grace percentage
    const graceMinutes = Math.max(30, range * 0.1); // At least 30 minutes padding
    
    return {
      min: Math.max(0, Math.floor((min - graceMinutes) / 30) * 30), // Round to 30-minute intervals
      max: Math.ceil((max + graceMinutes) / 30) * 30
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
      console.log('Rush Hour: Starting data load...');
      const data = await this.getAllDailyResume.execute();
      console.log('Rush Hour: Data loaded:', data);
      
      if (data && data.length > 0) {
        this.dailyResumeData = data;
        this.initializeChartWithData();
        
        // Force multiple change detection cycles
        this.cdr.detectChanges();
        setTimeout(() => {
          this.cdr.detectChanges();
          if (this.chart) {
            this.chart.update();
          }
        }, 100);
        
        console.log('Rush Hour: Chart initialized with real data, dataLoaded:', this.dataLoaded);
      } else {
        console.log('Rush Hour: No data received, using test data');
        this.initializeChartWithTestData();
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Rush Hour: Error loading daily resume data:', error);
      this.initializeChartWithTestData();
      this.cdr.detectChanges();
    }
  }

  private initializeChartWithData(): void {
    const labels = this.dailyResumeData.map(d => d.fecha);
    const rushHourValues = this.dailyResumeData.map(d => this.timeToMinutes(d.hora_pico));

    // Calculate optimal Y-axis scale for time data
    const yScale = this.calculateOptimalYScale(rushHourValues);

    this.chartData = {
      labels,
      datasets: [
        {
          label: 'Hora Pico',
          data: rushHourValues,
          borderColor: '#386641',
          backgroundColor: 'rgba(56, 102, 65, 0.2)',
          pointRadius: 5,
          pointBackgroundColor: '#386641',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          fill: true,
          tension: 0.4, // This makes it a spline (smooth curve)
          borderWidth: 3,
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'category',
          title: {
            display: true,
            text: 'Fecha',
            font: {
              size: 12,
              weight: 'bold'
            }
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        y: {
          type: 'linear',
          display: true,
          title: {
            display: true,
            text: 'Hora del Día',
            font: {
              size: 12,
              weight: 'bold'
            }
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            callback: (value) => {
              return this.minutesToTime(Number(value));
            },
            stepSize: 30 // 30 minutes intervals
          },
          // Use calculated optimal scale for better data visualization
          min: yScale.min,
          max: yScale.max
        },
      },
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (context) => {
              const minutes = context.parsed.y;
              const timeStr = this.minutesToTime(minutes);
              return `Hora pico: ${timeStr}`;
            },
            afterBody: (context) => {
              const index = context[0].dataIndex;
              const item = this.dailyResumeData[index];
              return [
                `Pasajeros totales: ${item.pasajeros_total}`,
                `Promedio por viaje: ${item.pasajeros_promedio_por_viaje}`,
                `Velocidad promedio: ${item.velocidad_promedio} km/h`,
                `Probabilidad ocupación alta: ${(item.probabilidad_ocupacion_alta * 100).toFixed(1)}%`
              ];
            }
          }
        },
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15,
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
          text: 'Evolución de Horas Pico',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    };

    this.dataLoaded = true;
    console.log('Rush Hour: Chart initialized with real data, dataLoaded:', this.dataLoaded);
    
    // Ensure the view updates immediately
    this.cdr.markForCheck();
    this.cdr.detectChanges();
    
    // Force chart update if chart exists
    setTimeout(() => {
      if (this.chart) {
        this.chart.update();
        console.log('Rush Hour: Chart updated');
      }
      this.cdr.detectChanges();
    }, 50);
  }

  private initializeChartWithTestData(): void {
    // Fallback test data - 7 días
    const testData = [
      { fecha: '2025-07-01', hora_pico: '08:00', pasajeros_total: 450, pasajeros_promedio_por_viaje: 25 },
      { fecha: '2025-07-02', hora_pico: '07:30', pasajeros_total: 504, pasajeros_promedio_por_viaje: 28 },
      { fecha: '2025-07-03', hora_pico: '08:15', pasajeros_total: 332, pasajeros_promedio_por_viaje: 24 },
      { fecha: '2025-07-04', hora_pico: '08:45', pasajeros_total: 240, pasajeros_promedio_por_viaje: 30 },
      { fecha: '2025-07-05', hora_pico: '08:10', pasajeros_total: 480, pasajeros_promedio_por_viaje: 27 },
      { fecha: '2025-07-06', hora_pico: '07:45', pasajeros_total: 420, pasajeros_promedio_por_viaje: 26 },
      { fecha: '2025-07-07', hora_pico: '08:20', pasajeros_total: 380, pasajeros_promedio_por_viaje: 23 }
    ];
    
    const labels = testData.map(d => d.fecha);
    const rushHourValues = testData.map(d => this.timeToMinutes(d.hora_pico));

    this.chartData = {
      labels,
      datasets: [
        {
          label: 'Hora Pico',
          data: rushHourValues,
          borderColor: '#6A994E',
          backgroundColor: 'rgba(106, 153, 78, 0.2)',
          pointRadius: 5,
          pointBackgroundColor: '#6A994E',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          fill: true,
          tension: 0.4,
          borderWidth: 3,
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'category',
          title: {
            display: true,
            text: 'Fecha',
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Hora del Día',
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            callback: (value) => {
              return this.minutesToTime(Number(value));
            },
            stepSize: 30
          },
          min: 360,
          max: 600
        },
      },
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (context) => {
              const minutes = context.parsed.y;
              const timeStr = this.minutesToTime(minutes);
              return `Hora pico: ${timeStr}`;
            }
          }
        },
        legend: {
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
          text: 'Evolución de Horas Pico',
        }
      },
    };

    this.dataLoaded = true;
    console.log('Rush Hour: Chart initialized with fallback test data, dataLoaded:', this.dataLoaded);
    
    // Force chart update if chart exists
    setTimeout(() => {
      if (this.chart) {
        this.chart.update();
        console.log('Rush Hour: Test chart updated');
      }
      this.cdr.detectChanges();
    }, 50);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    console.log('Rush Hour: ngAfterViewInit called, chart reference:', this.chart);
    console.log('Rush Hour: dataLoaded status:', this.dataLoaded);
    
    // If data is already loaded but chart wasn't updated, force an update
    if (this.dataLoaded && this.chart) {
      setTimeout(() => {
        this.chart?.update();
        this.cdr.detectChanges();
        console.log('Rush Hour: Forced chart update in ngAfterViewInit');
      }, 100);
    }
    
    // Additional fallback - if still not loaded after a reasonable time, force test data
    if (!this.dataLoaded) {
      setTimeout(() => {
        if (!this.dataLoaded) {
          console.log('Rush Hour: Forcing fallback initialization');
          this.initializeChartWithTestData();
        }
      }, 1000);
    }

    console.log('Rush Hour: Chart data ready, should render automatically');
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
    console.log(`Rush Hour: Loading data by month range - Year: ${year}, Month: ${month}, Route: ${routeId || 'All'}`);
    
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
      console.error('Rush Hour: Error loading data by month range:', error);
      // Fallback to standard monthly data
      this.initializeChartWithMonthlyTestData();
    }
  }

  private initializeChartWithMonthlyTestData(): void {
    console.log('Rush Hour: Initializing chart with monthly test data');
    
    // Generate available months data (simulating dynamic data based on repository logic)
    // Only show months that actually have data available
    const availableMonths = [
      { name: 'Nov 2024', rushHour: 435 },
      { name: 'Dic 2024', rushHour: 465 },
      { name: 'Ene 2025', rushHour: 440 },
      { name: 'Feb 2025', rushHour: 470 },
      { name: 'Mar 2025', rushHour: 425 },
      { name: 'Abr 2025', rushHour: 455 },
      { name: 'May 2025', rushHour: 445 }
    ];
    
    const monthNames = availableMonths.map(m => m.name);
    const rushHourValues = availableMonths.map(m => m.rushHour);

    this.chartData = {
      labels: monthNames,
      datasets: [
        {
          label: 'Hora Pico',
          data: rushHourValues,
          borderColor: '#7BAD61',
          backgroundColor: 'rgba(123, 173, 97, 0.2)',
          pointRadius: 5,
          pointBackgroundColor: '#7BAD61',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          fill: true,
          tension: 0.4, // This makes it a spline (smooth curve)
          borderWidth: 3,
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'category',
          title: {
            display: true,
            text: 'Meses Disponibles',
            font: {
              size: 12,
              weight: 'bold'
            }
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        y: {
          type: 'linear',
          display: true,
          title: {
            display: true,
            text: 'Hora del Día',
            font: {
              size: 12,
              weight: 'bold'
            }
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            callback: (value) => {
              return this.minutesToTime(Number(value));
            },
            stepSize: 30 // 30 minutes intervals
          },
          min: 360, // 6:00 AM
          max: 600  // 10:00 AM
        },
      },
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (context) => {
              const minutes = context.parsed.y;
              const timeStr = this.minutesToTime(minutes);
              return `Hora pico: ${timeStr}`;
            }
          }
        },
        title: {
          display: true,
          text: 'Análisis de Horas Pico',
          font: {
            size: 16,
            weight: 'bold'
          }
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
