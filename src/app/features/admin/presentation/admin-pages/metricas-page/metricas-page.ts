import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-metricas-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="metricas-page">
      <div class="page-header">
        <h1>Métricas</h1>
        <p>Análisis avanzado de métricas del sistema</p>
      </div>
      
      <div class="content-placeholder">
        <div class="placeholder-card">
          <h2>🚧 En Construcción</h2>
          <p>Esta página de métricas está en desarrollo.</p>
          <p>Pronto estará disponible con análisis detallados y reportes avanzados.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .metricas-page {
      padding: 2rem;
      min-height: 100vh;
    }

    .page-header {
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #E2E8F0;
    }

    .page-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2.5rem;
      color: #2D3748;
      font-weight: 700;
    }

    .page-header p {
      margin: 0;
      font-size: 1.1rem;
      color: #718096;
    }

    .content-placeholder {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .placeholder-card {
      background: white;
      border-radius: 12px;
      padding: 3rem;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border: 1px solid #E2E8F0;
      max-width: 500px;
    }

    .placeholder-card h2 {
      margin: 0 0 1rem 0;
      font-size: 2rem;
      color: #2D3748;
    }

    .placeholder-card p {
      margin: 0.5rem 0;
      font-size: 1.1rem;
      color: #718096;
      line-height: 1.6;
    }
  `]
})
export class MetricasPageComponent {
  constructor() {}
}
