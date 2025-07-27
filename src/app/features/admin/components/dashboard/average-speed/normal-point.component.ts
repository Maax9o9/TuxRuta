import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType, ChartData } from 'chart.js';
import { DailyResume } from '../../../data/models/daily-resume-route.model';
import { MonthlyResume } from '../../../data/models/monthly-comparative.model';

@Component({
  selector: 'app-normal-distribution',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './normal-point.component.html',
  styleUrls: ['./normal-point.component.scss'],
})
export class NormalDistributionComponent {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  // Datos procesados para la gráfica
  chartData: { date: string; averageSpeed: number; totalPassengers: number }[] = [];

  // Configuración de la gráfica
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    },
    scales: {
      x: {
        title: { display: true, text: 'Fecha' }
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Velocidad promedio (km/h)' }
      }
    }
  };

  public barChartType: ChartType = 'bar';

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        label: 'Velocidad promedio',
        data: [],
        backgroundColor: 'rgba(76, 175, 80, 0.8)',
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
      averageSpeed: item.velocidad_promedio,
      totalPassengers: item.pasajeros_total,
    }));
    this.updateChart();
  } else {
    this.chartData = [];
    this.barChartData.labels = [];
    this.barChartData.datasets[0].data = [];
    if (this.chart) this.chart.update();
    console.warn('No data available to update the chart');
  }
}

  updateChart(): void {
    this.barChartData.labels = this.chartData.map(d => d.date);
    this.barChartData.datasets[0].data = this.chartData.map(d => d.averageSpeed);
    if (this.chart) this.chart.update();
  }
}