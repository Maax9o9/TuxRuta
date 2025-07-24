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
  selector: 'app-travel-promedy',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './travel-promedy.component.html',
  styleUrls: ['./travel-promedy.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class TravelPromedyComponent implements AfterViewInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  chartType: 'bar' = 'bar';
  chartData: ChartConfiguration<'bar'>['data'] = { datasets: [] };
  chartOptions: ChartConfiguration<'bar'>['options'] = {};
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

  getAveragePromedy(): string {
    if (!this.dailyResumeData || this.dailyResumeData.length === 0) {
      return '0.0';
    }
    const average = this.dailyResumeData.reduce((sum, item) => sum + item.pasajeros_promedio_por_viaje, 0) / this.dailyResumeData.length;
    return average.toFixed(1);
  }

  getHighestPromedy(): string {
    if (!this.dailyResumeData || this.dailyResumeData.length === 0) {
      return '0';
    }
    const highest = Math.max(...this.dailyResumeData.map(item => item.pasajeros_promedio_por_viaje));
    return highest.toString();
  }

  getLowestPromedy(): string {
    if (!this.dailyResumeData || this.dailyResumeData.length === 0) {
      return '0';
    }
    const lowest = Math.min(...this.dailyResumeData.map(item => item.pasajeros_promedio_por_viaje));
    return lowest.toString();
  }

  // Helper function to calculate better Y-axis scale  
  private calculateOptimalYScale(values: number[]): { min: number, max: number } {
    if (values.length === 0) return { min: 0, max: 20 };
    
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue;
    
    // Si el rango es muy pequeño comparado con los valores, ajustar la escala
    if (range < maxValue * 0.1) {
      // Si las diferencias son pequeñas, usar un rango más enfocado
      const padding = Math.max(range * 0.2, maxValue * 0.05);
      return {
        min: Math.max(0, minValue - padding),
        max: maxValue + padding
      };
    }
    
    // Para rangos normales, usar un pequeño padding
    const padding = range * 0.1;
    return {
      min: Math.max(0, minValue - padding),
      max: maxValue + padding
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
      console.log('Travel Promedy: Starting data load...');
      const data = await this.getAllDailyResume.execute();
      console.log('Travel Promedy: Data loaded:', data);
      
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
        
        console.log('Travel Promedy: Chart initialized with real data, dataLoaded:', this.dataLoaded);
      } else {
        console.log('Travel Promedy: No data received, using test data');
        this.initializeChartWithTestData();
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Travel Promedy: Error loading daily resume data:', error);
      this.initializeChartWithTestData();
      this.cdr.detectChanges();
    }
  }

  private initializeChartWithData(): void {
    const labels = this.dailyResumeData.map(d => d.fecha);
    const promedyValues = this.dailyResumeData.map(d => d.pasajeros_promedio_por_viaje);
    const yScale = this.calculateOptimalYScale(promedyValues);

    this.chartData = {
      labels,
      datasets: [
        {
          label: 'Promedio Pasajeros por Viaje',
          data: promedyValues,
          backgroundColor: '#6A994E',
          borderColor: '#6A994E',
          borderWidth: 2,
          hoverBackgroundColor: '#7BAD61',
          hoverBorderColor: '#6A994E',
          borderRadius: 4,
          borderSkipped: false,
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
            display: false
          }
        },
        y: {
          type: 'linear',
          display: true,
          title: {
            display: true,
            text: 'Pasajeros por Viaje',
            font: {
              size: 12,
              weight: 'bold'
            }
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          },
          min: yScale.min,
          max: yScale.max
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
                `Promedio por viaje: ${item.pasajeros_promedio_por_viaje}`,
                `Pasajeros totales: ${item.pasajeros_total}`,
                `Velocidad promedio: ${item.velocidad_promedio} km/h`,
                `Hora pico: ${item.hora_pico}`,
                `Total viajes: ${item.total_viajes}`,
                `Total alertas: ${item.total_alertas}`,
                `Ocupación máxima: ${item.ocupacion_maxima}`,
                `Probabilidad ocupación alta: ${(item.probabilidad_ocupacion_alta * 100).toFixed(1)}%`,
                `Intervalo confianza: ${item.intervalo_confianza_velocidad_min} - ${item.intervalo_confianza_velocidad_max} km/h`
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
          text: 'Promedio de Pasajeros por Viaje',
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
    console.log('Travel Promedy: Chart initialized with real data, dataLoaded:', this.dataLoaded);
    
    // Ensure the view updates immediately
    this.cdr.markForCheck();
    this.cdr.detectChanges();
    
    // Force chart update if chart exists
    setTimeout(() => {
      if (this.chart) {
        this.chart.update();
        console.log('Travel Promedy: Chart updated');
      }
      this.cdr.detectChanges();
    }, 50);
  }

  private initializeChartWithTestData(): void {
    // Fallback test data - 7 días
    const testData = [
      { 
        fecha: '2025-07-01', 
        pasajeros_promedio_por_viaje: 25, 
        pasajeros_total: 450,
        total_viajes: 18,
        total_alertas: 3,
        ocupacion_maxima: 85,
        intervalo_confianza_velocidad_min: 50,
        intervalo_confianza_velocidad_max: 60
      },
      { 
        fecha: '2025-07-02', 
        pasajeros_promedio_por_viaje: 28, 
        pasajeros_total: 504,
        total_viajes: 18,
        total_alertas: 1,
        ocupacion_maxima: 92,
        intervalo_confianza_velocidad_min: 65,
        intervalo_confianza_velocidad_max: 75
      },
      { 
        fecha: '2025-07-03', 
        pasajeros_promedio_por_viaje: 24, 
        pasajeros_total: 332,
        total_viajes: 14,
        total_alertas: 2,
        ocupacion_maxima: 78,
        intervalo_confianza_velocidad_min: 58,
        intervalo_confianza_velocidad_max: 66
      },
      { 
        fecha: '2025-07-04', 
        pasajeros_promedio_por_viaje: 30, 
        pasajeros_total: 240,
        total_viajes: 8,
        total_alertas: 5,
        ocupacion_maxima: 95,
        intervalo_confianza_velocidad_min: 44,
        intervalo_confianza_velocidad_max: 52
      },
      { 
        fecha: '2025-07-05', 
        pasajeros_promedio_por_viaje: 27, 
        pasajeros_total: 480,
        total_viajes: 18,
        total_alertas: 2,
        ocupacion_maxima: 88,
        intervalo_confianza_velocidad_min: 54,
        intervalo_confianza_velocidad_max: 62
      },
      { 
        fecha: '2025-07-06', 
        pasajeros_promedio_por_viaje: 26, 
        pasajeros_total: 420,
        total_viajes: 16,
        total_alertas: 1,
        ocupacion_maxima: 89,
        intervalo_confianza_velocidad_min: 61,
        intervalo_confianza_velocidad_max: 69
      },
      { 
        fecha: '2025-07-07', 
        pasajeros_promedio_por_viaje: 23, 
        pasajeros_total: 380,
        total_viajes: 17,
        total_alertas: 4,
        ocupacion_maxima: 76,
        intervalo_confianza_velocidad_min: 48,
        intervalo_confianza_velocidad_max: 56
      }
    ];
    
    const labels = testData.map(d => d.fecha);
    const promedyValues = testData.map(d => d.pasajeros_promedio_por_viaje);

    this.chartData = {
      labels,
      datasets: [
        {
          label: 'Promedio Pasajeros por Viaje',
          data: promedyValues,
          backgroundColor: '#6A994E',
          borderColor: '#6A994E',
          borderWidth: 2,
          hoverBackgroundColor: '#7BAD61',
          hoverBorderColor: '#6A994E',
          borderRadius: 4,
          borderSkipped: false,
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
            display: false
          }
        },
        y: {
          title: {
            display: true,
            text: 'Pasajeros por Viaje',
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          },
          beginAtZero: true
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
          text: 'Promedio de Pasajeros por Viaje',
        }
      },
    };

    this.dataLoaded = true;
    console.log('Travel Promedy: Chart initialized with fallback test data, dataLoaded:', this.dataLoaded);
    
    // Force chart update if chart exists
    setTimeout(() => {
      if (this.chart) {
        this.chart.update();
        console.log('Travel Promedy: Test chart updated');
      }
      this.cdr.detectChanges();
    }, 50);
  }

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
    console.log(`Travel Promedy: Loading data by month range - Year: ${year}, Month: ${month}, Route: ${routeId || 'All'}`);
    
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
      console.error('Travel Promedy: Error loading data by month range:', error);
      // Fallback to standard monthly data
      this.initializeChartWithMonthlyTestData();
    }
  }

  private initializeChartWithMonthlyTestData(): void {
    console.log('Travel Promedy: Initializing chart with monthly test data');
    
    // Generate available months data (simulating dynamic data based on repository logic)
    // Only show months that actually have data available
    const availableMonths = [
      { name: 'Nov 2024', promedy: 45 },
      { name: 'Dic 2024', promedy: 38 },
      { name: 'Ene 2025', promedy: 40 },
      { name: 'Feb 2025', promedy: 48 },
      { name: 'Mar 2025', promedy: 35 },
      { name: 'Abr 2025', promedy: 44 },
      { name: 'May 2025', promedy: 42 }
    ];
    
    const monthNames = availableMonths.map(m => m.name);
    const promedyValues = availableMonths.map(m => m.promedy);

    this.chartData = {
      labels: monthNames,
      datasets: [
        {
          label: 'Promedio Pasajeros por Viaje',
          data: promedyValues,
          backgroundColor: '#6A994E',
          borderColor: '#6A994E',
          borderWidth: 2,
          hoverBackgroundColor: '#7BAD61',
          hoverBorderColor: '#6A994E',
          borderRadius: 4,
          borderSkipped: false,
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
            display: false
          }
        },
        y: {
          type: 'linear',
          display: true,
          title: {
            display: true,
            text: 'Pasajeros por Viaje',
            font: {
              size: 12,
              weight: 'bold'
            }
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          },
          beginAtZero: true
        },
      },
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (context) => {
              return `Promedio por viaje: ${context.parsed.y}`;
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
          text: 'Promedio de Pasajeros por Viaje',
          font: {
            size: 16,
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

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    console.log('Travel Promedy: ngAfterViewInit called, chart reference:', this.chart);
    console.log('Travel Promedy: dataLoaded status:', this.dataLoaded);
    
    // If data is already loaded but chart wasn't updated, force an update
    if (this.dataLoaded && this.chart) {
      setTimeout(() => {
        this.chart?.update();
        this.cdr.detectChanges();
        console.log('Travel Promedy: Forced chart update in ngAfterViewInit');
      }, 100);
    }
    
    // Additional fallback - if still not loaded after a reasonable time, force test data
    if (!this.dataLoaded) {
      setTimeout(() => {
        if (!this.dataLoaded) {
          console.log('Travel Promedy: Forcing fallback initialization');
          this.initializeChartWithTestData();
        }
      }, 1000);
    }

    console.log('Travel Promedy: Chart data ready, should render automatically');
  }

  getCurrentFilterLabel(): string {
    return this.currentFilter === 'daily' ? 'Filtro Diario' : 'Filtro Mensual';
  }
}
