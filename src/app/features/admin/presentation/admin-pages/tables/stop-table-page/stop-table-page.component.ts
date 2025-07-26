import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { StopTableComponent } from '../../../../components/tables/stop-table/stop-table.component';

@Component({
  selector: 'app-stop-table-page',
  standalone: true,
  imports: [CommonModule, StopTableComponent],
  templateUrl: './stop-table-page.component.html',
  styleUrls: ['./stop-table-page.component.scss']
})
export class StopTablePageComponent implements OnInit {
  token: string | undefined = undefined;
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storedToken = localStorage.getItem('jwt_token');
      this.token = storedToken ? storedToken : undefined;
    }
  }
}
