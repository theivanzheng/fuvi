import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { Habito } from '../../../core/models/habito.model';

@Component({
  selector: 'app-tarjeta-habito',
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './tarjeta-habito.html',
  styleUrl: './tarjeta-habito.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TarjetaHabito {
  habito = input.required<Habito>();
  routerLink = input.required<readonly (string | number)[]>();
}
