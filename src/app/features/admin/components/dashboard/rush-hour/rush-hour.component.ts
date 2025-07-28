import { Component, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType, ChartData } from 'chart.js';

@Component({
  selector: 'app-rush-hour',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './rush-hour.component.html',
  styleUrls: ['./rush-hour.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class RushHourComponent {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  // Cada punto: { x: fecha, y: hora (en minutos) }
  public scatterChartData: ChartData<'scatter'> = {
    datasets: [
      {
        label: 'Hora pico',
        data: [],
        backgroundColor: 'rgba(255, 193, 7, 0.8)',
        pointRadius: 7,
        pointHoverRadius: 10,
      }
    ]
  };

  public scatterChartOptions: ChartConfiguration<'scatter'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false },
  tooltip: {
  callbacks: {
    label: (ctx) => {
      const raw = ctx.raw as { x: string, y: number };
      const date = raw.x;
      const minutes = raw.y;
      const hour = Math.floor(minutes / 60);
      const min = minutes % 60;
      return `Fecha: ${date}, Hora pico: ${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
    }
  }
}
    },
    scales: {
      x: {
        type: 'category',
        title: { display: true, text: 'Fecha' }
      },
      y: {
        title: { display: true, text: 'Hora pico' },
        min: 0,
        max: 1440, // 24*60 minutos
        ticks: {
          callback: (value) => {
            const hour = Math.floor(Number(value) / 60);
            const min = Number(value) % 60;
            return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
          }
        }
      }
    }
  };

  // Llama a este método con los datos del backend
  updateChartData(response: any): void {
  const data = response?.datos || [];
  this.scatterChartData.datasets[0].data = data
    .filter((item: any) => item.hora_pico && item.hora_pico !== 'Sin datos')
    .map((item: any) => {
      // Si es un rango, toma la hora de inicio
      const horaInicio = item.hora_pico.split('-')[0];
      return {
        x: item.fecha,
        y: this.parseHourToMinutes(horaInicio)
      };
    });
  if (this.chart) this.chart.update();
}

// Convierte "13:45" a minutos (825)
private parseHourToMinutes(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}
}