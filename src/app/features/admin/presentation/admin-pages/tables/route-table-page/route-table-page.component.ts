import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteTableComponent } from '../../../../components/tables/route-table/route-table.component';

@Component({
  selector: 'app-route-table-page',
  standalone: true,
  imports: [CommonModule, RouteTableComponent],
  templateUrl: './route-table-page.component.html',
  styleUrls: ['./route-table-page.component.scss']
})
export class RouteTablePageComponent {}
