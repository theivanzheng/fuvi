import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AudioFeedbackService } from '../../../core/services/audio-feedback.service';
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
  private readonly audioFeedback = inject(AudioFeedbackService);
  private readonly habitosService = inject(HabitosService);

  private readonly habitoId = Number(this.route.snapshot.paramMap.get('id'));
  pasoActual = signal(0);

  habito = computed(() => this.habitosService.getHabitoPorId(this.habitoId));
  rutaVolver = computed(() => ['/rutinas', this.habitosService.getMomentoHabito(this.habitoId)] as const);
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
    this.router.navigate(this.rutaVolver());
  }

  completarPaso(): void {
    this.audioFeedback.playClick();

    if (this.pasoActual() < this.totalPasos() - 1) {
      this.pasoActual.update((pasoActual) => pasoActual + 1);
      return;
    }

    this.router.navigateByUrl(`/habitos/${this.habitoId}/completado`);
  }
}
