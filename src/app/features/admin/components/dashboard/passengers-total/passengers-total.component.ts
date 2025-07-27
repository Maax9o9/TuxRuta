import { Component, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType, ChartData } from 'chart.js';

@Component({
  selector: 'app-passengers-total',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './passengers-total.component.html',
  styleUrls: ['./passengers-total.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class PassengersTotalComponent {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  chartData: { date: string; totalPassengers: number }[] = [];

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
        title: { display: true, text: 'Pasajeros totales' }
      }
    }
  };

  public barChartType: ChartType = 'bar';

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        label: 'Pasajeros totales',
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
    this.barChartData.datasets[0].data = this.chartData.map(d => d.totalPassengers);
    if (this.chart) this.chart.update();
  }
}