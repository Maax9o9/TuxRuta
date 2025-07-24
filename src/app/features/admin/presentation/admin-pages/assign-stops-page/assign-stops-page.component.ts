import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { StopMapComponent } from '../../../components/stop-map/stop-map.component';
import { RouteTableComponent } from '../../../components/tables/route-table/route-table.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-assign-stops-page',
  standalone: true,
  imports: [CommonModule, StopMapComponent, RouteTableComponent],
  templateUrl: './assign-stops-page.component.html',
  styleUrls: ['./assign-stops-page.component.scss']
})
export class AssignStopsPageComponent implements OnInit {
  token: string | undefined = undefined;
  selectedRouteId: number | null = null;
  showStopMap = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private route: ActivatedRoute) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storedToken = localStorage.getItem('jwt_token');
      this.token = storedToken ? storedToken : undefined;
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.selectedRouteId = +id;
          this.showStopMap = true;
        } else {
          this.selectedRouteId = null;
          this.showStopMap = false;
        }
      });
    }
  }
}
