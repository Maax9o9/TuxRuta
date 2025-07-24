import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-colective-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './colective-table.component.html',
  styleUrls: ['./colective-table.component.scss']
})
export class ColectiveTableComponent {
  colectivos = [
    { nombre: '233DF-323', ruta: 'Suchiapa-Tuxtla' },
    { nombre: 'Jardines del grijalva - 9va Sur', ruta: '20' },
    { nombre: 'Text', ruta: 'Text' },
    { nombre: 'Text', ruta: 'Text' },
    { nombre: 'Text', ruta: 'Text' },
    { nombre: 'Text', ruta: 'Text' },
  ];

  eliminar(index: number) {
    this.colectivos.splice(index, 1);
  }
}
