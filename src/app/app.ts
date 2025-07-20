import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GoogleMapComponent } from './features/admin/components/google-map/google_map.component';
import { NormalDistributionComponent } from './features/admin/components/dashboard/normal-point/normal-point.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GoogleMapComponent, NormalDistributionComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'TuxRuta';
}
