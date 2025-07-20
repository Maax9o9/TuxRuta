import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GetRealTimeLocationUseCase } from '../../domain/get-real-time-location-use-case';
import { ColectiveLocation } from '../../data/models/colective-location.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-gps-tracker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gps-tracker.component.html',
  styleUrls: ['./gps-tracker.component.scss']
})
export class GpsTrackerComponent implements OnInit, OnDestroy {
  location: ColectiveLocation | null = null;
  private subscription?: Subscription;

  constructor(private getRealTimeLocationUseCase: GetRealTimeLocationUseCase) {}

  ngOnInit(): void {
    this.subscription = this.getRealTimeLocationUseCase.execute().subscribe({
      next: loc => this.location = loc,
      error: err => console.error('Error al obtener ubicación:', err)
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
