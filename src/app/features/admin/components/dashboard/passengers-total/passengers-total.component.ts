import { Component, Inject, PLATFORM_ID, AfterViewInit, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, Chart } from 'chart.js';
import { GetAllDailyResumeUseCase } from '../../../domain/daily-resume/get-all-daily-resume-use-case';
import { DailyResumeRepository } from '../../../data/repository/daily-resume-repository';
import { DailyResume } from '../../../data/models/daily-resume-route.model';
// Monthly Resume imports
import { GetAllMonthlyResumeUseCase } from '../../../domain/monthly-resume/get-all-monthly-comparative';
import { MonthlyResumeRepository } from '../../../data/repository/monthly-resume-repository';
import { MonthlyResume } from '../../../data/models/monthly-comparative.model';

@Component({
  selector: 'app-passengers-total',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './passengers-total.component.html',
  styleUrls: ['./passengers-total.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class PassengersTotalComponent implements AfterViewInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  chartType: 'bar' = 'bar';
  chartData: ChartConfiguration<'bar'>['data'] = { datasets: [] };
  chartOptions: ChartConfiguration<'bar'>['options'] = {};
  isBrowser = false;
  dataLoaded = false;
  
  // Filter properties
  currentFilter: 'daily' | 'monthly' = 'monthly'; // Cambiar a 'monthly' por defecto
  
  // Data properties
  dailyResumeData: DailyResume[] = [];
  monthlyResumeData: MonthlyResume[] = [];
  
  // Use cases
  private getAllDailyResume: GetAllDailyResumeUseCase;
  private getAllMonthlyResume: GetAllMonthlyResumeUseCase;

  get isDataLoaded(): boolean {
    return this.dataLoaded;
  }

  get chartStatus(): string {
    if (this.currentFilter === 'daily') {
      return this.dataLoaded ? `Datos cargados (${this.dailyResumeData.length} días)` : 'Cargando datos...';
    } else {
      return this.dataLoaded ? `Datos cargados (${this.monthlyResumeData.length} meses)` : 'Cargando datos...';
    }
  }

  // Filter methods
  switchToDaily(): void {
    if (this.currentFilter !== 'daily') {
      console.log('Passengers Total: Switching to daily filter');
      this.currentFilter = 'daily';
      this.dataLoaded = false;
      
      // Clear current data
      this.chartData = { datasets: [] };
      this.chartOptions = {};
      
      this.loadDataAndInitializeChart().then(() => {
        // Force complete chart rebuild
        setTimeout(() => {
          this.forceChartUpdate();
        }, 200);
      });
    }
  }

  switchToMonthly(): void {
    if (this.currentFilter !== 'monthly') {
      console.log('Passengers Total: Switching to monthly filter');
      this.currentFilter = 'monthly';
      this.dataLoaded = false;
      
      // Clear current data
      this.chartData = { datasets: [] };
      this.chartOptions = {};
      
      this.loadDataAndInitializeChart().then(() => {
        // Force complete chart rebuild
        setTimeout(() => {
          this.forceChartUpdate();
        }, 200);
      });
    }
  }

  getCurrentFilterLabel(): string {
    return this.currentFilter === 'daily' ? 'Filtro Diario' : 'Filtro Mensual';
  }

  // Methods called by dashboard for filtering
  loadDataByMonthRange(year: number, month: number, routeId?: number): void {
    console.log(`Passengers Total: Loading data by month range ${year}-${month}, Route: ${routeId || 'All'}`);
    
    // Forzar cambio a filtro monthly cuando se llama este método
    if (this.currentFilter !== 'monthly') {
      console.log('Passengers Total: Switching to monthly filter for month range');
      this.currentFilter = 'monthly';
      this.dataLoaded = false;
      this.chartData = { datasets: [] };
      this.chartOptions = {};
    }
    
    if (this.getAllMonthlyResume.executeByMonthRange) {
      // For now, ignore routeId parameter (will be implemented later with backend filtering)
      this.getAllMonthlyResume.executeByMonthRange(year, month).then(data => {
        if (data && data.length > 0) {
          console.log('Passengers Total: Monthly range data received:', data);
          // Filter by route if specified
          if (routeId) {
            this.monthlyResumeData = data.filter(item => item.ruta_id === routeId);
            console.log(`Passengers Total: Filtered data for route ${routeId}:`, this.monthlyResumeData);
          } else {
            this.monthlyResumeData = data;
          }
          this.initializeChartWithMonthlyData();
          // Force chart update
          setTimeout(() => {
            if (this.chart) {
              this.chart.update();
            }
            this.cdr.detectChanges();
          }, 100);
        } else {
          console.log('Passengers Total: No monthly range data, using test data');
          this.initializeChartWithMonthlyTestData();
        }
      }).catch(error => {
        console.error('Passengers Total: Error loading monthly range data:', error);
        this.initializeChartWithMonthlyTestData();
      });
    } else {
      console.log('Passengers Total: executeByMonthRange not available, using test data');
      this.initializeChartWithMonthlyTestData();
    }
  }

  getTotalPassengers(): string {
    if (this.currentFilter === 'daily') {
      if (!this.dailyResumeData || this.dailyResumeData.length === 0) {
        return '0';
      }
      const total = this.dailyResumeData.reduce((sum, item) => sum + item.pasajeros_total, 0);
      return total.toLocaleString();
    } else {
      if (!this.monthlyResumeData || this.monthlyResumeData.length === 0) {
        return '0';
      }
      const total = this.monthlyResumeData.reduce((sum, item) => sum + item.pasajeros_total_mes, 0);
      return total.toLocaleString();
    }
  }

  getAveragePassengers(): string {
    if (this.currentFilter === 'daily') {
      if (!this.dailyResumeData || this.dailyResumeData.length === 0) {
        return '0.0';
      }
      const average = this.dailyResumeData.reduce((sum, item) => sum + item.pasajeros_total, 0) / this.dailyResumeData.length;
      return average.toFixed(1);
    } else {
      if (!this.monthlyResumeData || this.monthlyResumeData.length === 0) {
        return '0.0';
      }
      const average = this.monthlyResumeData.reduce((sum, item) => sum + item.pasajeros_promedio_dia, 0) / this.monthlyResumeData.length;
      return average.toFixed(1);
    }
  }

  constructor(
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Initialize repositories and use cases
    const dailyRepository = new DailyResumeRepository();
    this.getAllDailyResume = new GetAllDailyResumeUseCase(dailyRepository);
    
    const monthlyRepository = new MonthlyResumeRepository();
    this.getAllMonthlyResume = new GetAllMonthlyResumeUseCase(monthlyRepository);

    if (this.isBrowser) {
      // Use setTimeout to ensure the view is initialized
      setTimeout(() => {
        console.log('Passengers Total: Starting initial load with filter:', this.currentFilter);
        this.loadDataAndInitializeChart();
      }, 200);
    }
  }

  private async loadDataAndInitializeChart(): Promise<void> {
    try {
      console.log(`Passengers Total: Starting ${this.currentFilter} data load...`);
      
      if (this.currentFilter === 'daily') {
        const data = await this.getAllDailyResume.execute();
        console.log('Passengers Total: Daily data loaded:', data);
        
        if (data && data.length > 0) {
          this.dailyResumeData = data;
          this.initializeChartWithDailyData();
        } else {
          console.log('Passengers Total: No daily data received, using test data');
          this.initializeChartWithTestData();
        }
      } else {
        const data = await this.getAllMonthlyResume.execute();
        console.log('Passengers Total: Monthly data loaded:', data);
        
        if (data && data.length > 0) {
          this.monthlyResumeData = data;
          this.initializeChartWithMonthlyData();
        } else {
          console.log('Passengers Total: No monthly data received, using test data');
          this.initializeChartWithMonthlyTestData();
        }
      }
      
      // Force multiple change detection cycles
      this.cdr.detectChanges();
      setTimeout(() => {
        this.cdr.detectChanges();
        if (this.chart) {
          this.chart.update();
        }
      }, 100);
      
      console.log('Passengers Total: Chart initialized with real data, dataLoaded:', this.dataLoaded);
    } catch (error) {
      console.error('Passengers Total: Error loading daily resume data:', error);
      this.initializeChartWithTestData();
      this.cdr.detectChanges();
    }
  }

  // Helper function to calculate better Y-axis scale
  private calculateOptimalYScale(values: number[]): { min: number, max: number } {
    if (values.length === 0) return { min: 0, max: 20000 };
    
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

  private initializeChartWithData(): void {
    const labels = this.dailyResumeData.map(d => d.fecha);
    const passengerValues = this.dailyResumeData.map(d => d.pasajeros_total);
    const yScale = this.calculateOptimalYScale(passengerValues);

    this.chartData = {
      labels,
      datasets: [
        {
          label: 'Pasajeros Totales',
          data: passengerValues,
          backgroundColor: '#6A994E',
          borderColor: '#386641',
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
            }
          },
          grid: {
            display: true,
            color: 'rgba(180, 245, 165, 0.3)',
            lineWidth: 1
          }
        },
        y: {
          type: 'linear',
          display: true,
          title: {
            display: true,
            text: 'Número de Pasajeros',
            font: {
              size: 12,
              weight: 'bold'
            }
          },
          grid: {
            display: true,
            color: 'rgba(180, 245, 165, 0.3)',
            lineWidth: 1
          },
          min: yScale.min,
          max: yScale.max,
          ticks: {
            stepSize: 5000
          }
        },
      },
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false,
          titleFont: {
            
          },
          bodyFont: {
            
          },
          callbacks: {
            afterBody: (context) => {
              const index = context[0].dataIndex;
              const item = this.dailyResumeData[index];
              return [
                `Pasajeros totales: ${item.pasajeros_total}`,
                `Promedio por viaje: ${item.pasajeros_promedio_por_viaje}`,
                `Velocidad promedio: ${item.velocidad_promedio} km/h`,
                `Hora pico: ${item.hora_pico}`,
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
            
            font: {
              
            }
          }
        },
        title: {
          display: true,
          text: 'Total de Pasajeros por Día',
          font: {
            size: 14,
            weight: 'bold',
            
          },
          
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    };

    this.dataLoaded = true;
    console.log('Passengers Total: Chart initialized with real data, dataLoaded:', this.dataLoaded);
    
    // Ensure the view updates immediately
    this.cdr.markForCheck();
    this.cdr.detectChanges();
    
    // Force chart update if chart exists
    setTimeout(() => {
      if (this.chart) {
        this.chart.update();
        console.log('Passengers Total: Chart updated');
      }
      this.cdr.detectChanges();
    }, 50);
  }

  private initializeChartWithTestData(): void {
    // Fallback test data - 7 días
    const testData = [
      { fecha: '2025-07-01', pasajeros_total: 450, pasajeros_promedio_por_viaje: 25 },
      { fecha: '2025-07-02', pasajeros_total: 504, pasajeros_promedio_por_viaje: 28 },
      { fecha: '2025-07-03', pasajeros_total: 332, pasajeros_promedio_por_viaje: 24 },
      { fecha: '2025-07-04', pasajeros_total: 240, pasajeros_promedio_por_viaje: 30 },
      { fecha: '2025-07-05', pasajeros_total: 480, pasajeros_promedio_por_viaje: 27 },
      { fecha: '2025-07-06', pasajeros_total: 420, pasajeros_promedio_por_viaje: 26 },
      { fecha: '2025-07-07', pasajeros_total: 380, pasajeros_promedio_por_viaje: 23 }
    ];
    
    const labels = testData.map(d => d.fecha);
    const passengerValues = testData.map(d => d.pasajeros_total);

    this.chartData = {
      labels,
      datasets: [
        {
          label: 'Pasajeros Totales',
          data: passengerValues,
          backgroundColor: '#6A994E',
          borderColor: '#386641',
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
              
            },
            
          },
          grid: {
            display: false
          },
          ticks: {
            
            font: {
              
            }
          }
        },
        y: {
          title: {
            display: true,
            text: 'Número de Pasajeros',
            font: {
              
            },
            
          },
          grid: {
            display: true,
            color: 'rgba(180, 245, 165, 0.3)'
          },
          beginAtZero: true,
          ticks: {
            
            font: {
              
            }
          }
        },
      },
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false,
          titleFont: {
            
          },
          bodyFont: {
            
          }
        },
        legend: {
          position: 'top',
          labels: {
            
            font: {
              
            }
          }
        },
        title: {
          display: true,
          text: 'Total de Pasajeros por Día',
          font: {
            
          },
          
        }
      },
    };

    this.dataLoaded = true;
    console.log('Passengers Total: Chart initialized with fallback test data, dataLoaded:', this.dataLoaded);
    console.log('Passengers Total: Daily test chartData:', this.chartData);
    console.log('Passengers Total: Daily test chartOptions:', this.chartOptions);
    
    // Force multiple update cycles for daily test data
    setTimeout(() => {
      if (this.chart) {
        this.chart.update('none');
        console.log('Passengers Total: Daily test chart updated (step 1)');
      }
      this.cdr.detectChanges();
    }, 50);
    
    setTimeout(() => {
      if (this.chart && this.chart.chart) {
        this.chart.chart.resize();
        this.chart.update('active');
        console.log('Passengers Total: Daily test chart resized and updated (step 2)');
      }
    }, 150);
    
    setTimeout(() => {
      if (this.chart) {
        this.chart.update();
        console.log('Passengers Total: Final daily test chart update');
      }
    }, 300);
  }

  private initializeChartWithDailyData(): void {
    if (!this.dailyResumeData || this.dailyResumeData.length === 0) {
      console.log('Passengers Total: No daily data available');
      return;
    }

    const labels = this.dailyResumeData.map(item => 
      new Date(item.fecha).toLocaleDateString('es-ES', { 
        day: '2-digit',
        month: '2-digit'
      })
    );
    
    const passengerData = this.dailyResumeData.map(item => item.pasajeros_total);

    this.chartData = {
      labels: labels,
      datasets: [{
        label: 'Pasajeros Total (Día)',
        data: passengerData,
        backgroundColor: '#6A994E',
        borderColor: '#386641',
        borderWidth: 2,
        borderRadius: 5,
        borderSkipped: false,
        hoverBackgroundColor: '#7BAD61',
        hoverBorderColor: '#6A994E',
      }]
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
              weight: 'bold',
              
            },
            
          },
          grid: {
            display: false
          },
          ticks: {
            
            font: {
              
            }
          }
        },
        y: {
          type: 'linear',
          display: true,
          title: {
            display: true,
            text: 'Número de Pasajeros',
            font: {
              size: 12,
              weight: 'bold',
              
            },
            
          },
          grid: {
            display: true,
            color: 'rgba(180, 245, 165, 0.3)'
          },
          beginAtZero: true,
          ticks: {
            
            font: {
              
            }
          }
        },
      },
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false,
          titleFont: {
            
          },
          bodyFont: {
            
          },
          callbacks: {
            afterBody: (context) => {
              const index = context[0].dataIndex;
              const item = this.dailyResumeData[index];
              return [
                `Pasajeros totales: ${item.pasajeros_total}`,
                `Promedio por viaje: ${item.pasajeros_promedio_por_viaje}`,
                `Velocidad promedio: ${item.velocidad_promedio} km/h`,
                `Hora pico: ${item.hora_pico}`,
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
            
            font: {
              
            }
          }
        },
        title: {
          display: true,
          text: 'Total de Pasajeros por Día',
          font: {
            size: 14,
            weight: 'bold',
            
          },
          
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    };

    this.dataLoaded = true;
    this.cdr.markForCheck();
    console.log('Passengers Total: Daily chart data prepared:', this.chartData);
  }

  private initializeChartWithMonthlyData(): void {
    if (!this.monthlyResumeData || this.monthlyResumeData.length === 0) {
      console.log('Passengers Total: No monthly data available');
      return;
    }

    const labels = this.monthlyResumeData.map(item => 
      new Date(item.año, item.mes - 1, 1).toLocaleDateString('es-ES', { 
        month: 'long',
        year: 'numeric'
      })
    );
    
    const passengerData = this.monthlyResumeData.map(item => item.pasajeros_total_mes);
    const yScale = this.calculateOptimalYScale(passengerData);

    this.chartData = {
      labels: labels,
      datasets: [{
        label: 'Pasajeros Total (Mes)',
        data: passengerData,
        backgroundColor: '#6A994E',
        borderColor: '#386641',
        borderWidth: 2,
        borderRadius: 5,
        borderSkipped: false,
        hoverBackgroundColor: '#7BAD61',
        hoverBorderColor: '#6A994E',
      }]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'category',
          title: {
            display: true,
            text: 'Mes',
            font: {
              size: 12,
              weight: 'bold',
              
            },
            
          },
          grid: {
            display: false
          },
          ticks: {
            
            font: {
              
            }
          }
        },
        y: {
          type: 'linear',
          display: true,
          title: {
            display: true,
            text: 'Número de Pasajeros',
            font: {
              size: 12,
              weight: 'bold',
              
            },
            
          },
          grid: {
            display: true,
            color: 'rgba(180, 245, 165, 0.3)'
          },
          min: yScale.min,
          max: yScale.max,
          ticks: {
            stepSize: 5000,
            
            font: {
              
            }
          }
        },
      },
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false,
          titleFont: {
            
          },
          bodyFont: {
            
          },
          callbacks: {
            afterBody: (context) => {
              const index = context[0].dataIndex;
              const item = this.monthlyResumeData[index];
              const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
              return [
                `Pasajeros total mes: ${item.pasajeros_total_mes.toLocaleString()}`,
                `Promedio por día: ${item.pasajeros_promedio_dia}`,
                `Mejor día: ${diasSemana[item.mejor_dia_semana]}`,
                `Velocidad promedio: ${item.velocidad_promedio_mes} km/h`,
                `Crecimiento: ${item.crecimiento_porcentual}%`,
                `Días activos: ${item.dias_activos}`,
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
            
            font: {
              
            }
          }
        },
        title: {
          display: true,
          text: 'Total de Pasajeros por Mes',
          font: {
            size: 14,
            weight: 'bold',
            
          },
          
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    };

    this.dataLoaded = true;
    this.cdr.markForCheck();
    console.log('Passengers Total: Monthly chart data prepared:', this.chartData);
  }

  private initializeChartWithMonthlyTestData(): void {
    // Fallback test data - 6 meses con estructura completa
    const testMonthlyData: MonthlyResume[] = [
      { 
        id: 1, mes: 1, año: 2025, ruta_id: 1, 
        pasajeros_total_mes: 13500, pasajeros_promedio_dia: 450,
        mejor_dia_semana: 5, peor_rendimiento_dia: '2025-01-15', 
        crecimiento_porcentual: 5.2, velocidad_promedio_mes: 45.8,
        alertas_total_mes: 12, dias_activos: 30, probabilidad_ocupacion_alta: 0.68,
        intervalo_confianza_velocidad_min: 42.1, intervalo_confianza_velocidad_max: 49.5
      },
      { 
        id: 2, mes: 2, año: 2025, ruta_id: 1, 
        pasajeros_total_mes: 12600, pasajeros_promedio_dia: 450,
        mejor_dia_semana: 4, peor_rendimiento_dia: '2025-02-10', 
        crecimiento_porcentual: -2.1, velocidad_promedio_mes: 47.2,
        alertas_total_mes: 8, dias_activos: 28, probabilidad_ocupacion_alta: 0.72,
        intervalo_confianza_velocidad_min: 43.8, intervalo_confianza_velocidad_max: 50.6
      },
      { 
        id: 3, mes: 3, año: 2025, ruta_id: 1, 
        pasajeros_total_mes: 14850, pasajeros_promedio_dia: 495,
        mejor_dia_semana: 6, peor_rendimiento_dia: '2025-03-22', 
        crecimiento_porcentual: 8.7, velocidad_promedio_mes: 44.1,
        alertas_total_mes: 15, dias_activos: 30, probabilidad_ocupacion_alta: 0.75,
        intervalo_confianza_velocidad_min: 40.3, intervalo_confianza_velocidad_max: 47.9
      },
      { 
        id: 4, mes: 4, año: 2025, ruta_id: 1, 
        pasajeros_total_mes: 13200, pasajeros_promedio_dia: 440,
        mejor_dia_semana: 5, peor_rendimiento_dia: '2025-04-18', 
        crecimiento_porcentual: -1.8, velocidad_promedio_mes: 46.5,
        alertas_total_mes: 10, dias_activos: 30, probabilidad_ocupacion_alta: 0.69,
        intervalo_confianza_velocidad_min: 42.7, intervalo_confianza_velocidad_max: 50.3
      },
      { 
        id: 5, mes: 5, año: 2025, ruta_id: 1, 
        pasajeros_total_mes: 15600, pasajeros_promedio_dia: 520,
        mejor_dia_semana: 4, peor_rendimiento_dia: '2025-05-12', 
        crecimiento_porcentual: 12.3, velocidad_promedio_mes: 43.8,
        alertas_total_mes: 18, dias_activos: 30, probabilidad_ocupacion_alta: 0.82,
        intervalo_confianza_velocidad_min: 39.9, intervalo_confianza_velocidad_max: 47.7
      },
      { 
        id: 6, mes: 6, año: 2025, ruta_id: 1, 
        pasajeros_total_mes: 14100, pasajeros_promedio_dia: 470,
        mejor_dia_semana: 6, peor_rendimiento_dia: '2025-06-08', 
        crecimiento_porcentual: 4.1, velocidad_promedio_mes: 45.2,
        alertas_total_mes: 13, dias_activos: 30, probabilidad_ocupacion_alta: 0.71,
        intervalo_confianza_velocidad_min: 41.4, intervalo_confianza_velocidad_max: 49.0
      }
    ];
    
    // Simular datos para poder usar getTotalPassengers() y getAveragePassengers()
    this.monthlyResumeData = testMonthlyData;
    
    const labels = testMonthlyData.map(item => 
      new Date(item.año, item.mes - 1, 1).toLocaleDateString('es-ES', { 
        month: 'long',
        year: 'numeric'
      })
    );
    
    const passengerData = testMonthlyData.map(item => item.pasajeros_total_mes);

    this.chartData = {
      labels,
      datasets: [
        {
          label: 'Pasajeros Totales (Mes)',
          data: passengerData,
          backgroundColor: '#6A994E',
          borderColor: '#386641',
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
            text: 'Mes',
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
            text: 'Número de Pasajeros',
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
            afterBody: (context) => {
              const index = context[0].dataIndex;
              const item = testMonthlyData[index];
              const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
              return [
                `Pasajeros total mes: ${item.pasajeros_total_mes.toLocaleString()}`,
                `Promedio por día: ${item.pasajeros_promedio_dia}`,
                `Mejor día: ${diasSemana[item.mejor_dia_semana]}`,
                `Velocidad promedio: ${item.velocidad_promedio_mes} km/h`,
                `Crecimiento: ${item.crecimiento_porcentual}%`,
                `Días activos: ${item.dias_activos}`,
                `Probabilidad ocupación alta: ${(item.probabilidad_ocupacion_alta * 100).toFixed(1)}%`
              ];
            }
          }
        },
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15
          }
        },
        title: {
          display: true,
          text: 'Total de Pasajeros por Mes',
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
    console.log('Passengers Total: Chart initialized with monthly test data, dataLoaded:', this.dataLoaded);
    console.log('Passengers Total: Monthly test chartData:', this.chartData);
    console.log('Passengers Total: Monthly test chartOptions:', this.chartOptions);
    
    // Force multiple update cycles for monthly test data
    setTimeout(() => {
      if (this.chart) {
        this.chart.update('none');
        console.log('Passengers Total: Monthly test chart updated (step 1)');
      }
      this.cdr.detectChanges();
    }, 50);
    
    setTimeout(() => {
      if (this.chart && this.chart.chart) {
        this.chart.chart.resize();
        this.chart.update('active');
        console.log('Passengers Total: Monthly test chart resized and updated (step 2)');
      }
    }, 150);
    
    setTimeout(() => {
      if (this.chart) {
        this.chart.update();
        console.log('Passengers Total: Final monthly test chart update');
      }
    }, 300);
  }

  // Method to force chart refresh
  forceChartUpdate(): void {
    console.log('Passengers Total: Forcing chart update...');
    this.cdr.detectChanges();
    
    setTimeout(() => {
      if (this.chart) {
        // Force destroy and rebuild
        this.chart.update('none');
        console.log('Passengers Total: Chart updated (step 1)');
      }
      this.cdr.detectChanges();
    }, 50);
    
    setTimeout(() => {
      if (this.chart && this.chart.chart) {
        this.chart.chart.resize();
        this.chart.update('active');
        console.log('Passengers Total: Chart resized and updated (step 2)');
      }
    }, 150);
    
    setTimeout(() => {
      if (this.chart) {
        this.chart.update();
        console.log('Passengers Total: Final chart update completed');
      }
    }, 300);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    console.log('Passengers Total: ngAfterViewInit called, chart reference:', this.chart);
    console.log('Passengers Total: dataLoaded status:', this.dataLoaded);
    
    if (this.dataLoaded && this.chart) {
      setTimeout(() => {
        this.chart?.update();
        this.cdr.detectChanges();
        console.log('Passengers Total: Forced chart update in ngAfterViewInit');
      }, 100);
    }
    
    if (!this.dataLoaded) {
      setTimeout(() => {
        if (!this.dataLoaded) {
          console.log('Passengers Total: Forcing fallback initialization');
          this.initializeChartWithTestData();
        }
      }, 1000);
    }

    console.log('Passengers Total: Chart data ready, should render automatically');
  }
}
