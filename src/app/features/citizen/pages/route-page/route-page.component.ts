import { Component } from '@angular/core';
import { CardContainerComponent } from '../../components/card-container/card-container.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { CitizenMapComponent } from '../../components/citizen-map/citizen-map.component';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-route-page',
  standalone: true,
  imports: [CardContainerComponent, SearchBarComponent, CitizenMapComponent, HeaderComponent],
  templateUrl: './route-page.component.html',
  styleUrls: ['./route-page.component.scss']
})
export class RoutePageComponent {

}
