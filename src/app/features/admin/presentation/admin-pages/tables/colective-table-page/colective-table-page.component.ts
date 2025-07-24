import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ColectiveTableComponent } from '../../../../components/tables/colective-table/colective-table.component';

@Component({
  selector: 'app-colective-table-page',
  standalone: true,
  imports: [CommonModule, ColectiveTableComponent],
  templateUrl: './colective-table-page.component.html',
  styleUrls: ['./colective-table-page.component.scss']
})
export class ColectiveTablePageComponent implements OnInit {
  token: string | undefined = undefined;
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storedToken = localStorage.getItem('jwt_token');
      this.token = storedToken ? storedToken : undefined;
    }
  }
}
