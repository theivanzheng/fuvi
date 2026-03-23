import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { HabitosService } from '../../../core/services/habitos.service';
import { MomentoDia } from '../../../core/models/habito.model';
import { ProgresoBar } from '../../../shared/components/progreso-bar/progreso-bar';
import { TarjetaHabito } from '../../../shared/components/tarjeta-habito/tarjeta-habito';
import { CabeceraFuvi } from '../../../shared/components/cabecera-fuvi/cabecera-fuvi';

@Component({
  selector: 'app-rutinas-momento',
  imports: [ProgresoBar, TarjetaHabito, CabeceraFuvi, RouterLink],
  templateUrl: './rutinas-momento.html',
  styleUrl: './rutinas-momento.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RutinasMomento {
  private readonly route = inject(ActivatedRoute);
  private readonly habitosService = inject(HabitosService);

  momentoSeleccionado = computed<MomentoDia>(() => {
    const momento = this.route.snapshot.paramMap.get('momento');
    if (momento === 'mediodia' || momento === 'noche') {
      return momento;
    }

    return 'manana';
  });

  esFinde = computed(() => this.habitosService.esFinDeSemana());
  avatarPrincipal = this.habitosService.avatarPrincipal;

  habitosFiltrados = computed(() =>
    this.habitosService.getHabitosPorMomento(this.momentoSeleccionado(), this.esFinde()),
  );

  totalHabitosMomento = computed(() => this.habitosFiltrados().length);
  totalCompletadosMomento = computed(
    () => this.habitosFiltrados().filter((habito) => habito.completado).length,
  );

  todoCompletado = computed(
    () =>
      this.totalHabitosMomento() > 0 &&
      this.totalCompletadosMomento() === this.totalHabitosMomento(),
  );

  tituloMomento = computed(() => {
    const momento = this.momentoSeleccionado();
    if (momento === 'mediodia') {
      return 'RUTINAS DE MEDIODIA';
    }

    if (momento === 'noche') {
      return 'RUTINAS DE NOCHE';
    }

    return 'RUTINAS DE MANANA';
  });

  subtituloDia = computed(() => (this.esFinde() ? 'HOY ES FIN DE SEMANA' : 'HOY ES DIA DE SEMANA'));

  reiniciarRutinas(): void {
    this.habitosService.reiniciarHabitos();
  }
}
