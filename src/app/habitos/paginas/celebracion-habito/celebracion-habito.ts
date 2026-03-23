import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  private readonly habitosService = inject(HabitosService);

  private readonly habitoId = Number(this.route.snapshot.paramMap.get('id'));
  habito = computed(() => this.habitosService.getHabitoPorId(this.habitoId));
  avatarCelebracion = this.habitosService.avatarCelebracion;

  constructor() {
    if (!this.habito()) {
      this.router.navigateByUrl('/');
    }
  }

  finalizarTarea(): void {
    this.habitosService.completarHabito(this.habitoId);
    this.router.navigateByUrl('/');
  }
}
