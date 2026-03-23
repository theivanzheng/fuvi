import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { HabitosService } from '../../../core/services/habitos.service';
import { ProgresoBar } from '../../../shared/components/progreso-bar/progreso-bar';
import { TarjetaHabito } from '../../../shared/components/tarjeta-habito/tarjeta-habito';
import { CabeceraFuvi } from '../../../shared/components/cabecera-fuvi/cabecera-fuvi';

@Component({
  selector: 'app-pagina-principal',
  imports: [ProgresoBar, TarjetaHabito, CabeceraFuvi],
  templateUrl: './pagina-principal.html',
  styleUrl: './pagina-principal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaPrincipal {
  private readonly habitosService = inject(HabitosService);

  habitos = this.habitosService.habitos;
  avatarPrincipal = this.habitosService.avatarPrincipal;
  totalCompletados = this.habitosService.totalCompletados;
  totalHabitos = this.habitosService.totalHabitos;
  todoCompletado = computed(
    () => this.totalHabitos() > 0 && this.totalCompletados() === this.totalHabitos(),
  );

  reiniciarRutinas(): void {
    this.habitosService.reiniciarHabitos();
  }
}
