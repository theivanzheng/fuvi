import { NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AudioFeedbackService } from '../../../core/services/audio-feedback.service';
import { HabitosService } from '../../../core/services/habitos.service';
import { ProgresoBar } from '../../../shared/components/progreso-bar/progreso-bar';

@Component({
  selector: 'app-celebracion-habito',
  imports: [RouterLink, NgOptimizedImage, ProgresoBar],
  templateUrl: './celebracion-habito.html',
  styleUrl: './celebracion-habito.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CelebracionHabito {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly audioFeedback = inject(AudioFeedbackService);
  private readonly habitosService = inject(HabitosService);

  readonly confettiPieces = Array.from({ length: 24 }, (_, index) => index);
  private readonly habitoId = Number(this.route.snapshot.paramMap.get('id'));
  habito = computed(() => this.habitosService.getHabitoPorId(this.habitoId));
  rutaVolver = computed(() => ['/rutinas', this.habitosService.getMomentoHabito(this.habitoId)] as const);
  avatarCelebracion = this.habitosService.avatarCelebracion;

  constructor() {
    if (!this.habito()) {
      this.router.navigateByUrl('/');
      return;
    }

    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.audioFeedback.playCelebration(), 120);
    }
  }

  finalizarTarea(): void {
    this.audioFeedback.playClick();
    this.habitosService.completarHabito(this.habitoId);
    this.router.navigate(this.rutaVolver());
  }
}
