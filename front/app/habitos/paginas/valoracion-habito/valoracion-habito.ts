import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HabitosService } from '../../../core/services/habitos.service';

@Component({
  selector: 'app-valoracion-habito',
  imports: [],
  templateUrl: './valoracion-habito.html',
  styleUrl: './valoracion-habito.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValoracionHabito {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly habitosService = inject(HabitosService);

  private readonly habitoId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly estrellas = [1, 2, 3, 4, 5];
  estrellasSeleccionadas = signal(0);
  estrellasHover = signal(0);
  enviando = signal(false);

  private rutaVolver(): string[] {
    return ['/rutinas', this.habitosService.getMomentoHabito(this.habitoId)];
  }

  seleccionarEstrella(n: number): void {
    this.estrellasSeleccionadas.set(n);
  }

  async enviar(): Promise<void> {
    if (this.enviando()) return;
    this.enviando.set(true);

    const estrellas = this.estrellasSeleccionadas();
    if (estrellas > 0) {
      await this.habitosService.enviarValoracion(this.habitoId, estrellas);
    }

    void this.router.navigate(this.rutaVolver());
  }

  saltar(): void {
    void this.router.navigate(this.rutaVolver());
  }
}
