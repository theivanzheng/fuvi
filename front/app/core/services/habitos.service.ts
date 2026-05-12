import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AvatarType, Habito, MomentoDia, TipoDia } from '../models/habito.model';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

interface ApiResponse<T> {
  data: T;
  message: string;
}

interface PasoRutinaBackend {
  texto: string;
  imagen: string;
}

interface RutinaBackend {
  _id: string;
  nombreRutina: string;
  imagenPortada: string;
  color: string;
  momento: MomentoDia;
  tipoDia: TipoDia;
  pasos: PasoRutinaBackend[];
}

interface RutinaUsuarioBackend {
  rutina: RutinaBackend;
  completada: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class HabitosService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private ultimoUsuarioCargado: string | null = null;

  habitos = signal<Habito[]>([]);
  avatarSeleccionado = signal<AvatarType>('female');
  rutinasCargadas = signal(false);

  totalHabitos = computed(() => this.habitos().length);
  totalCompletados = computed(() => this.habitos().filter((habito) => habito.completado).length);
  progresoGeneral = computed(() => {
    const total = this.totalHabitos();
    if (total === 0) {
      return 0;
    }

    return Math.round((this.totalCompletados() / total) * 100);
  });

  avatarPrincipal = computed(() => {
    const avatar = this.avatarSeleccionado();
    return avatar === 'male' ? '/assets/images/character-male.png' : '/assets/images/character-female.png';
  });

  avatarCelebracion = computed(() => {
    const avatar = this.avatarSeleccionado();
    return avatar === 'male'
      ? '/assets/images/character-male-celebration.png'
      : '/assets/images/character-female-celebration.png';
  });

  sincronizarUsuario = effect(() => {
    const usuario = this.authService.usuarioActual();

    if (!usuario) {
      this.ultimoUsuarioCargado = null;
      this.avatarSeleccionado.set('female');
      this.habitos.set([]);
      this.rutinasCargadas.set(false);
      return;
    }

    this.avatarSeleccionado.set(usuario.avatar);

    if (this.ultimoUsuarioCargado === usuario._id) {
      return;
    }

    this.ultimoUsuarioCargado = usuario._id;
    this.rutinasCargadas.set(false);
    void this.cargarRutinasUsuario();
  });

  getHabitoPorId(id: string): Habito | undefined {
    return this.habitos().find((habito) => habito.id === id);
  }

  getHabitosPorMomento(momento: MomentoDia, esFinde: boolean): Habito[] {
    const tipoActual: TipoDia = esFinde ? 'finde' : 'semana';
    return this.habitos().filter(
      (habito) => habito.momento === momento && (habito.tipoDia === 'ambos' || habito.tipoDia === tipoActual),
    );
  }

  esFinDeSemana(fecha: Date = new Date()): boolean {
    const dia = fecha.getDay();
    return dia === 0 || dia === 6;
  }

  getMomentoHabito(id: string): MomentoDia {
    return this.getHabitoPorId(id)?.momento ?? 'manana';
  }

  completarHabito(id: string): void {
    this.habitos.update((listaActual) =>
      listaActual.map((habito) => (habito.id === id ? { ...habito, completado: true } : habito)),
    );

    const usuario = this.authService.getUsuarioActual();
    if (!usuario) {
      return;
    }

    void firstValueFrom(
      this.http.patch(`${environment.apiUrl}/usuarios/${usuario._id}/rutinas/${id}/completar`, {}, { withCredentials: true }),
    ).catch(() => undefined);
  }

  reiniciarHabitos(): void {
    this.habitos.update((listaActual) => listaActual.map((habito) => ({ ...habito, completado: false })));

    const usuario = this.authService.getUsuarioActual();
    if (!usuario) {
      return;
    }

    void firstValueFrom(
      this.http.post(`${environment.apiUrl}/usuarios/${usuario._id}/rutinas/reiniciar`, {}, { withCredentials: true }),
    ).catch(() => undefined);
  }

  async enviarValoracion(rutinaId: string, estrellas: number): Promise<void> {
    const usuario = this.authService.getUsuarioActual();
    if (!usuario) return;

    await firstValueFrom(
      this.http.post(
        `${environment.apiUrl}/valoraciones`,
        { usuarioId: usuario._id, rutinaId, estrellas },
        { withCredentials: true },
      ),
    ).catch(() => undefined);
  }

  cambiarAvatar(avatar: AvatarType): void {
    this.avatarSeleccionado.set(avatar);
    void this.authService.actualizarAvatar(avatar);
  }

  async cargarRutinasUsuario(): Promise<void> {
    const usuario = this.authService.getUsuarioActual();
    if (!usuario) {
      return;
    }

    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<RutinaUsuarioBackend[]>>(`${environment.apiUrl}/usuarios/${usuario._id}/rutinas`, {
          withCredentials: true,
        }),
      );

      if (!response.data?.length) {
        this.habitos.set([]);
        this.rutinasCargadas.set(true);
        return;
      }

      this.habitos.set(response.data.map((rutina) => this.mapearRutinaDesdeBackend(rutina)));
      this.rutinasCargadas.set(true);
    } catch {
      this.habitos.set([]);
      this.rutinasCargadas.set(true);
    }
  }

  private mapearRutinaDesdeBackend(rutinaUsuario: RutinaUsuarioBackend): Habito {
    const rutina = rutinaUsuario.rutina;

    return {
      id: rutina._id,
      nombre: rutina.nombreRutina,
      imagenPortada: rutina.imagenPortada,
      color: rutina.color,
      completado: rutinaUsuario.completada,
      momento: rutina.momento,
      tipoDia: rutina.tipoDia,
      pasos: rutina.pasos.map((paso) => ({
        texto: paso.texto,
        imagen: paso.imagen,
      })),
    };
  }

}
