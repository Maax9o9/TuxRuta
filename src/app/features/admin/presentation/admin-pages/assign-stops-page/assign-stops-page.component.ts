import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StopMapComponent } from '../../../components/stop-map/stop-map.component';

@Component({
  selector: 'app-assign-stops-page',
  standalone: true,
  imports: [CommonModule, StopMapComponent],
  templateUrl: './assign-stops-page.component.html',
  styleUrls: ['./assign-stops-page.component.scss']
})
export class AssignStopsPageComponent {}
