import { Component, Input, ChangeDetectionStrategy, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType, ChartData } from 'chart.js';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-high-occupancy',
  standalone: true,
  imports: [NgChartsModule, CommonModule],
  templateUrl: './high-occupancy.component.html',
  styleUrls: ['./high-occupancy.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class HighOccupancyComponent implements OnChanges {
  @Input() probability: number = 0; // Espera un valor entre 0 y 1
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    },
    scales: {
      x: {
        min: 0,
        max: 1,
        ticks: {
          callback: (value) => `${Math.round(Number(value) * 100)}%`
        }
      }
    }
  };

  public barChartType: ChartType = 'bar';

  public barChartData: ChartData<'bar'> = {
    labels: ['Probabilidad de Ocupación Alta'],
    datasets: [
      {
        data: [0],
        backgroundColor: ['rgba(139, 195, 74, 0.8)'],
        borderColor: ['rgba(56, 142, 60, 1)'],
        borderWidth: 2,
        borderRadius: 10,
        borderSkipped: false,
      }
    ]
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['probability']) {
      this.barChartData.datasets[0].data = [this.probability];
      if (this.chart) this.chart.update();
    }
  }


  updateChartData(data: any): void {
    if (data && data.probabilidad_ocupacion_alta !== undefined) {
      this.probability = data.probabilidad_ocupacion_alta;
      this.barChartData.datasets[0].data = [this.probability];
      if (this.chart) {
        this.chart.update();
      }
    }
  }
}