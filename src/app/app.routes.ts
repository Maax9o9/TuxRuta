import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'new-login',
    loadComponent: () => import('./features/admin/presentation/admin-pages/log-in-page/new-log-in-page').then(m => m.NewLoginPageComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/components/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/presentation/admin-pages/dash-board-page/dash-board-page').then(m => m.DashboardPageComponent)
      },
      // {
      //   path: 'metricas',
      //   loadComponent: () => import('./features/admin/presentation/admin-pages/metricas-page/metricas-page').then(m => m.MetricasPageComponent)
      // },
      {
        path: 'add-routes',
        loadComponent: () => import('./features/admin/presentation/admin-pages/add-routes-page/add-routes-page').then(m => m.AddRoutesPageComponent)
      },
      {
        path: 'metrics/confidence-interval',
        loadComponent: () => import('./features/admin/presentation/admin-pages/metrics/confidence-interval-page/confidence-interval-page.component').then(m => m.ConfidenceIntervalPageComponent)
      },
      {
        path: 'metrics/high-occupancy',
        loadComponent: () => import('./features/admin/presentation/admin-pages/metrics/high-ocupancy-page/high-occupancy-page.component').then(m => m.HighOccupancyPageComponent)
      },
      {
        path: 'metrics/normal-distribution',
        loadComponent: () => import('./features/admin/presentation/admin-pages/metrics/normal-point-page/normal-point-page.component').then(m => m.NormalPointPageComponent)
      },
      {
        path: 'metrics/passengers-total',
        loadComponent: () => import('./features/admin/presentation/admin-pages/metrics/passenger-total-page/passenger-total-page.component').then(m => m.PassengerTotalPageComponent)
      },
      {
        path: 'metrics/rush-hour',
        loadComponent: () => import('./features/admin/presentation/admin-pages/metrics/rush-hour-page/rush-hour-page.component').then(m => m.RushHourPageComponent)
      },
      {
        path: 'metrics/travel-average',
        loadComponent: () => import('./features/admin/presentation/admin-pages/metrics/travel-promedy-page/travel-promedy-page.component').then(m => m.TravelPromedyPageComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  // Backward compatibility - redirect old admin routes to new structure
  {
    path: 'dashboard',
    redirectTo: '/admin/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'add-routes',
    redirectTo: '/admin/add-routes',
    pathMatch: 'full'
  },
  // {
  //   path: 'metricas',
  //   redirectTo: '/admin/metricas',
  //   pathMatch: 'full'
  // },
  // Citizen routes
  {
    path: 'routes',
    loadComponent: () => import('./features/citizen/pages/route-page/route-page.component').then(m => m.RoutePageComponent)
  },
  {
    path: '',
    redirectTo: '/new-login',
    pathMatch: 'full'
  }
];
