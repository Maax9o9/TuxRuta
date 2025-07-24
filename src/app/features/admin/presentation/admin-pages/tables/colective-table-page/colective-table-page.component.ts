import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColectiveTableComponent } from '../../../../components/tables/colective-table/colective-table.component';

@Component({
  selector: 'app-colective-table-page',
  standalone: true,
  imports: [CommonModule, ColectiveTableComponent],
  templateUrl: './colective-table-page.component.html',
  styleUrls: ['./colective-table-page.component.scss']
})
export class ColectiveTablePageComponent {}
