import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-confidence-interval',
  templateUrl: './confidence-interval.component.html',
  standalone: true,
  imports: [NgChartsModule],
  styleUrls: ['./confidence-interval.component.scss']
})
export class ConfidenceIntervalComponent implements OnChanges {
  @Input() chartData: any;
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  maxSpeed: number = 0;
  minSpeed: number = 0;

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    indexAxis: 'y', 
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        enabled: true
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Velocidad (km/h)'
        }
      },
    }
  };

  public barChartType: ChartType = 'bar';

  public barChartData: ChartData<'bar'> = {
    labels: ['Velocidad Mínima', 'Velocidad Máxima'], 
    datasets: [
      {
        label: 'Datos de Velocidad',
        data: [],
        backgroundColor: [
          'rgba(76, 175, 80, 0.8)',   
          'rgba(139, 195, 74, 0.8)'  
        ],
        borderColor: [
          'rgba(56, 142, 60, 1)',    
          'rgba(104, 159, 56, 1)'     
        ],
        borderWidth: 2,
        borderRadius: 4,              
        borderSkipped: false,
      }
    ]
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartData'] && this.chartData) {
      this.updateChartData(this.chartData);
    }
  }

  updateChartData(data: any): void {
    if (data) {
      this.minSpeed = data.intervalo_confianza_velocidad_min || 0;
      this.maxSpeed = data.intervalo_confianza_velocidad_max || 0;

      this.barChartData.datasets[0].data = [
        this.minSpeed,
        this.maxSpeed
      ];

      console.log('Updated chart data:', this.barChartData);
      console.log('MinSpeed:', this.minSpeed, 'MaxSpeed:', this.maxSpeed);

      if (this.chart) {
        this.chart.update();
      }
    }
  }
}