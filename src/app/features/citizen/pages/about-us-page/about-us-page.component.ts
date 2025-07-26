import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-about-us-page',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './about-us-page.component.html',
  styleUrls: ['./about-us-page.component.scss']
})
export class AboutUsPageComponent {}
