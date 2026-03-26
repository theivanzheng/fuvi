import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HabitosService } from '../../../core/services/habitos.service';
import { CabeceraFuvi } from '../../../shared/components/cabecera-fuvi/cabecera-fuvi';

@Component({
  selector: 'app-pagina-principal',
  imports: [CabeceraFuvi, RouterLink, NgOptimizedImage],
  templateUrl: './pagina-principal.html',
  styleUrl: './pagina-principal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaPrincipal {
  private readonly habitosService = inject(HabitosService);

  avatarPrincipal = this.habitosService.avatarPrincipal;
}
