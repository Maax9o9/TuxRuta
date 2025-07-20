import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-container.component.html',
  styleUrls: ['./card-container.component.scss']})
  
export class CardContainerComponent {
  cards = Array.from({ length: 10 }, (_, i) => `Tarjeta ${i + 1}`);
}
