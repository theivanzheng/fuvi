import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-cabecera-fuvi',
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './cabecera-fuvi.html',
  styleUrl: './cabecera-fuvi.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CabeceraFuvi {
  titulo = input.required<string>();
  avatar = input.required<string>();
  mostrarBotonConfiguracion = input<boolean>(false);
  mostrarTitulo = input<boolean>(true);
}
