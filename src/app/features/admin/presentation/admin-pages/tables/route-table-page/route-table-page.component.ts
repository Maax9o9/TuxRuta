import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouteTableComponent } from '../../../../components/tables/route-table/route-table.component';

@Component({
  selector: 'app-route-table-page',
  standalone: true,
  imports: [CommonModule, RouteTableComponent],
  templateUrl: './route-table-page.component.html',
  styleUrls: ['./route-table-page.component.scss']
})
export class RouteTablePageComponent implements OnInit {
  token: string | undefined = undefined;
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storedToken = localStorage.getItem('jwt_token');
      this.token = storedToken ? storedToken : undefined;
    }
  }
}
