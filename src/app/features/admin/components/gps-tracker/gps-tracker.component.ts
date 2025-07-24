import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Colective } from '../../data/models/colective.model';
import { GetColectiveByIdUseCase } from '../../domain/colective/get-colective-by-id.use-case';
import { ColectiveRepository } from '../../data/repository/colective-repository';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-gps-tracker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gps-tracker.component.html',
  styleUrls: ['./gps-tracker.component.scss']
})
export class GpsTrackerComponent implements OnInit, OnDestroy {
  colective$: Observable<Colective | null> | undefined;
  private getColectiveByIdUseCase: GetColectiveByIdUseCase;
  token: string | undefined = undefined;

  constructor(
    private repository: ColectiveRepository,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.getColectiveByIdUseCase = new GetColectiveByIdUseCase(this.repository);
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storedToken = localStorage.getItem('jwt_token');
      this.token = storedToken ? storedToken : undefined;
      this.colective$ = this.getColectiveByIdUseCase.execute(1, this.token);
    }
  }

  ngOnDestroy(): void {}
}
