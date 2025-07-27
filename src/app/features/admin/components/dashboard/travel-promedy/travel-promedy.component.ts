import { Component, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType, ChartData } from 'chart.js';
import type { TooltipItem } from 'chart.js';
@Component({
  selector: 'app-travel-promedy',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './travel-promedy.component.html',
  styleUrls: ['./travel-promedy.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class TravelPromedyComponent {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  chartData: {
    date: string;
    travelPromedy: number;
    totalViajes: number;
    pasajerosTotal: number;
    velocidadPromedio: number;
  }[] = [];
public barChartOptions: ChartConfiguration['options'] = {
  responsive: true,
  plugins: {
    legend: { display: true },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<'bar'>) => {
          const i = ctx.dataIndex;
          const d = this.chartData[i];
          return [
            `Pasajeros promedio/viaje: ${d.travelPromedy}`,
            `Total de viajes: ${d.totalViajes}`,
            `Pasajeros totales: ${d.pasajerosTotal}`,
            `Velocidad promedio: ${d.velocidadPromedio} km/h`
          ];
        }
      }
    }
  },
  scales: {
    x: {
      title: { display: true, text: 'Fecha' }
    },
    y: {
      beginAtZero: true,
      title: { display: true, text: 'Valor' }
    }
  }
};

  public barChartType: ChartType = 'bar';

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        label: 'Pasajeros promedio por viaje',
        data: [],
        backgroundColor: 'rgba(33, 150, 243, 0.8)',
        borderColor: 'rgba(25, 118, 210, 1)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Total de viajes',
        data: [],
        backgroundColor: 'rgba(76, 175, 80, 0.7)',
        borderColor: 'rgba(56, 142, 60, 1)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      }
    ]
  };

  updateChartData(response: any): void {
    const data = response?.datos || [];
    if (data.length > 0) {
      this.chartData = data.map((item: any) => ({
        date: item.fecha,
        travelPromedy: item.pasajeros_promedio_por_viaje,
        totalViajes: item.total_viajes,
        pasajerosTotal: item.pasajeros_total,
        velocidadPromedio: item.velocidad_promedio,
      }));
      this.updateChart();
    } else {
      this.chartData = [];
      this.barChartData.labels = [];
      this.barChartData.datasets[0].data = [];
      this.barChartData.datasets[1].data = [];
      if (this.chart) this.chart.update();
      console.warn('No data available to update the chart');
    }
  }

  updateChart(): void {
    this.barChartData.labels = this.chartData.map(d => d.date);
    this.barChartData.datasets[0].data = this.chartData.map(d => d.travelPromedy);
    this.barChartData.datasets[1].data = this.chartData.map(d => d.totalViajes);
    if (this.chart) this.chart.update();
  }
}