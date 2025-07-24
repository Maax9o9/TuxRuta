import { Component, Inject, PLATFORM_ID, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
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
  selector: 'app-normal-distribution',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './normal-point.component.html',
  styleUrls: ['./normal-point.component.scss'],
})
export class NormalDistributionComponent implements AfterViewInit {
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
      }, 100);
    }
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

  private async loadDataAndInitializeChart(): Promise<void> {
    try {
      console.log('Starting data load...');
      const data = await this.getAllDailyResume.execute();
      console.log('Data loaded:', data);
      
      if (data && data.length > 0) {
        this.dailyResumeData = data;
        this.initializeChartWithData();
        this.cdr.detectChanges(); // Force change detection
        console.log('Chart data initialized with real data');
      } else {
        console.log('No data received, using test data');
        this.initializeChartWithTestData();
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Error loading daily resume data:', error);
      this.initializeChartWithTestData();
      this.cdr.detectChanges();
    }
  }

  private initializeChartWithData(): void {
    const labels = this.dailyResumeData.map(d => d.fecha);
    const velocidadValues = this.dailyResumeData.map(d => d.velocidad_promedio);

    // Calculate optimal Y-axis scale
    const yScale = this.calculateOptimalYScale(velocidadValues);

    this.chartData = {
      labels,
      datasets: [
        {
          label: 'Velocidad Promedio (km/h)',
          data: velocidadValues,
          borderColor: '#386641',
          backgroundColor: 'rgba(56, 102, 65, 0.1)',
          pointRadius: 4,
          fill: true,
          tension: 0.6,
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
        },
        y: {
          type: 'linear',
          display: true,
          title: {
            display: true,
            text: 'Velocidad (km/h)',
          },
          // Use calculated optimal scale for better data visualization
          min: yScale.min,
          max: yScale.max,
          ticks: {
            stepSize: Math.max(1, Math.round((yScale.max - yScale.min) / 10)),
          }
        },
      },
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            afterBody: (context) => {
              const index = context[0].dataIndex;
              const item = this.dailyResumeData[index];
              return [
                `Pasajeros: ${item.pasajeros_total}`,
                `Hora pico: ${item.hora_pico}`,
                `Probabilidad ocupación alta: ${(item.probabilidad_ocupacion_alta * 100).toFixed(1)}%`,
                `Intervalo confianza: [${item.intervalo_confianza_velocidad_min}, ${item.intervalo_confianza_velocidad_max}] km/h`
              ];
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
      },
    };

    this.dataLoaded = true;
    console.log('Chart initialized with real data from use case');
    
    // Force chart update if chart exists
    setTimeout(() => {
      if (this.chart) {
        this.chart.update();
      }
      this.cdr.detectChanges();
    }, 50);
  }

  private initializeChartWithTestData(): void {
    const testData = [
      { fecha: '2025-07-01', velocidad_promedio: 55, probabilidad_ocupacion_alta: 0.75 },
      { fecha: '2025-07-02', velocidad_promedio: 70, probabilidad_ocupacion_alta: 0.85 },
      { fecha: '2025-07-03', velocidad_promedio: 62, probabilidad_ocupacion_alta: 0.68 },
      { fecha: '2025-07-04', velocidad_promedio: 48, probabilidad_ocupacion_alta: 0.92 },
      { fecha: '2025-07-05', velocidad_promedio: 58, probabilidad_ocupacion_alta: 0.78 },
      { fecha: '2025-07-06', velocidad_promedio: 65, probabilidad_ocupacion_alta: 0.82 },
      { fecha: '2025-07-07', velocidad_promedio: 52, probabilidad_ocupacion_alta: 0.71 }
    ];
    
    const labels = testData.map(d => d.fecha);
    const velocidadValues = testData.map(d => d.velocidad_promedio);

    this.chartData = {
      labels,
      datasets: [
        {
          label: 'Velocidad Promedio (km/h)',
          data: velocidadValues,
          borderColor: '#386641',
          backgroundColor: 'rgba(56, 102, 65, 0.1)',
          pointRadius: 4,
          fill: true,
          tension: 0.6,
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
        },
        y: {
          title: {
            display: true,
            text: 'Velocidad (km/h)',
          },
        },
      },
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false,
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
      },
    };

    this.dataLoaded = true;
    console.log('Chart initialized with fallback test data');
    
    // Force chart update if chart exists
    setTimeout(() => {
      if (this.chart) {
        this.chart.update();
      }
      this.cdr.detectChanges();
    }, 50);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    console.log('ngAfterViewInit called, chart reference:', this.chart);
    
    // If data is already loaded but chart wasn't updated, force an update
    if (this.dataLoaded && this.chart) {
      setTimeout(() => {
        this.chart?.update();
        this.cdr.detectChanges();
      }, 100);
    }

    console.log('Chart data ready, should render automatically');
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
    console.log(`Normal Point: Loading data by month range - Year: ${year}, Month: ${month}, Route: ${routeId || 'All'}`);
    
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
      console.error('Normal Point: Error loading data by month range:', error);
      // Fallback to standard monthly data
      this.initializeChartWithMonthlyTestData();
    }
  }

  private initializeChartWithMonthlyTestData(): void {
    console.log('Normal Point: Initializing chart with monthly test data');
    
    // Generate available months data (simulating dynamic data based on repository logic)
    // Only show months that actually have data available
    const availableMonths = [
      { name: 'Nov 2024', velocity: 58 },
      { name: 'Dic 2024', velocity: 55 },
      { name: 'Ene 2025', velocity: 58 },
      { name: 'Feb 2025', velocity: 62 },
      { name: 'Mar 2025', velocity: 55 },
      { name: 'Abr 2025', velocity: 60 },
      { name: 'May 2025', velocity: 57 }
    ];
    
    const monthNames = availableMonths.map(m => m.name);
    const velocidadValues = availableMonths.map(m => m.velocity);

    this.chartData = {
      labels: monthNames,
      datasets: [
        {
          label: 'Velocidad Promedio (km/h)',
          data: velocidadValues,
          borderColor: '#386641',
          backgroundColor: 'rgba(56, 102, 65, 0.1)',
          pointRadius: 4,
          fill: true,
          tension: 0.6,
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
          },
        },
        y: {
          type: 'linear',
          display: true,
          title: {
            display: true,
            text: 'Velocidad (km/h)',
          },
        },
      },
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (context) => {
              return `Velocidad promedio: ${context.parsed.y} km/h`;
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
          text: 'Distribución Normal de Velocidad',
          font: {
            size: 16,
            weight: 'bold'
          }
        }
      },
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
