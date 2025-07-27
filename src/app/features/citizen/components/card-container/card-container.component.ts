import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route } from '../../../admin/data/models/route.model';
import { Colective } from '../../../admin/data/models/colective.model';

@Component({
  selector: 'app-card-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-container.component.html',
  styleUrls: ['./card-container.component.scss']
})
export class CardContainerComponent implements OnChanges, AfterViewInit {
  @Input() routes: Route[] = [];
  @Input() getColectivesForRoute!: (routeId: number) => Colective[];
  @Input() selectedRoute: Route | null = null;
  selectedIndex: number | null = null;
  @ViewChildren('cardRef') cardRefs!: QueryList<ElementRef>;
  @Output() routeSelected = new EventEmitter<Route>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedRoute'] && this.selectedRoute) {
      const idx = this.routes.findIndex(r => r.id === this.selectedRoute!.id);
      this.selectedIndex = idx !== -1 ? idx : null;
    }
    if (changes['routes'] && this.selectedRoute) {
      const idx = this.routes.findIndex(r => r.id === this.selectedRoute!.id);
      this.selectedIndex = idx !== -1 ? idx : null;
    }
    if ((changes['routes'] || changes['selectedRoute']) && !this.selectedRoute) {
      this.selectedIndex = null;
    }
    setTimeout(() => this.scrollToSelected(), 0);
  }

  ngAfterViewInit(): void {
    this.scrollToSelected();
  }

  private scrollToSelected() {
    if (this.selectedIndex !== null && this.cardRefs && this.cardRefs.length > this.selectedIndex) {
      const card = this.cardRefs.toArray()[this.selectedIndex].nativeElement;
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  selectCard(index: number) {
    this.selectedIndex = index;
    this.routeSelected.emit(this.routes[index]);
    setTimeout(() => this.scrollToSelected(), 0);
  }
}
