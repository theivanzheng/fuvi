import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-progreso-bar',
  templateUrl: './progreso-bar.html',
  styleUrl: './progreso-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgresoBar {
  completados = input.required<number>();
  total = input.required<number>();

  porcentaje = computed(() => {
    const total = this.total();
    if (total === 0) {
      return 0;
    }

    return Math.round((this.completados() / total) * 100);
  });

  segmentos = computed(() => {
    return Array.from({ length: this.total() }, (_, i) => i);
  });
}
