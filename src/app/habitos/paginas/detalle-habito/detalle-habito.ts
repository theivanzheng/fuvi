import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HabitosService } from '../../../core/services/habitos.service';
import { ProgresoBar } from '../../../shared/components/progreso-bar/progreso-bar';

@Component({
  selector: 'app-detalle-habito',
  imports: [RouterLink, NgOptimizedImage, ProgresoBar],
  templateUrl: './detalle-habito.html',
  styleUrl: './detalle-habito.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleHabito {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly habitosService = inject(HabitosService);

  private readonly habitoId = Number(this.route.snapshot.paramMap.get('id'));
  pasoActual = signal(0);

  habito = computed(() => this.habitosService.getHabitoPorId(this.habitoId));
  avatarPrincipal = this.habitosService.avatarPrincipal;
  totalPasos = computed(() => this.habito()?.pasos.length ?? 0);
  pasoEnCurso = computed(() => {
    const habito = this.habito();
    if (!habito) {
      return undefined;
    }

    return habito.pasos[this.pasoActual()];
  });

  constructor() {
    if (!this.habito()) {
      this.router.navigateByUrl('/');
    }
  }

  cancelar(): void {
    this.router.navigateByUrl('/');
  }

  completarPaso(): void {
    if (this.pasoActual() < this.totalPasos() - 1) {
      this.pasoActual.update((pasoActual) => pasoActual + 1);
      return;
    }

    this.router.navigateByUrl(`/habitos/${this.habitoId}/completado`);
  }
}
