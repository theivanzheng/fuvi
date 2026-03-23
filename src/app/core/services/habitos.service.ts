import { isPlatformBrowser } from '@angular/common';
import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { AvatarType, Habito, MomentoDia, TipoDia } from '../models/habito.model';

const STORAGE_HABITOS = 'fuvi_habitos_v3';
const STORAGE_AVATAR = 'fuvi_avatar_v1';

@Injectable({
  providedIn: 'root',
})
export class HabitosService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly esNavegador = isPlatformBrowser(this.platformId);

  habitos = signal<Habito[]>(this.cargarHabitos());
  avatarSeleccionado = signal<AvatarType>(this.cargarAvatar());

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

  guardarHabitos = effect(() => {
    if (!this.esNavegador) {
      return;
    }

    localStorage.setItem(STORAGE_HABITOS, JSON.stringify(this.habitos()));
  });

  guardarAvatar = effect(() => {
    if (!this.esNavegador) {
      return;
    }

    localStorage.setItem(STORAGE_AVATAR, this.avatarSeleccionado());
  });

  getHabitoPorId(id: number): Habito | undefined {
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

  getMomentoHabito(id: number): MomentoDia {
    return this.getHabitoPorId(id)?.momento ?? 'manana';
  }

  completarHabito(id: number): void {
    this.habitos.update((listaActual) =>
      listaActual.map((habito) => (habito.id === id ? { ...habito, completado: true } : habito)),
    );
  }

  reiniciarHabitos(): void {
    this.habitos.set(this.getHabitosIniciales());
  }

  cambiarAvatar(avatar: AvatarType): void {
    this.avatarSeleccionado.set(avatar);
  }

  private cargarHabitos(): Habito[] {
    if (!this.esNavegador) {
      return this.getHabitosIniciales();
    }

    const habitosGuardados = localStorage.getItem(STORAGE_HABITOS);

    if (!habitosGuardados) {
      return this.getHabitosIniciales();
    }

    try {
      const habitosParseados = JSON.parse(habitosGuardados) as Habito[];
      return this.combinarConEstadoGuardado(habitosParseados);
    } catch {
      return this.getHabitosIniciales();
    }
  }

  private combinarConEstadoGuardado(habitosGuardados: Habito[]): Habito[] {
    const estadoCompletado = new Map(habitosGuardados.map((habito) => [habito.id, habito.completado]));
    return this.getHabitosIniciales().map((habitoBase) => ({
      ...habitoBase,
      completado: estadoCompletado.get(habitoBase.id) ?? false,
    }));
  }

  private cargarAvatar(): AvatarType {
    if (!this.esNavegador) {
      return 'female';
    }

    const avatar = localStorage.getItem(STORAGE_AVATAR);
    return avatar === 'male' ? 'male' : 'female';
  }

  private getHabitosIniciales(): Habito[] {
    return [
      {
        id: 0,
        nombre: 'Lavar las manos',
        imagenPortada: '/assets/images/lavar-manos-cover.png',
        color: '#f0f0f0',
        completado: false,
        momento: 'manana',
        tipoDia: 'ambos',
        pasos: [
          { texto: 'Abrir el grifo', imagen: '/assets/images/lavar-manos-cover.png' },
          { texto: 'Mojar las manos', imagen: '/assets/images/lavar-manos-cover.png' },
          { texto: 'Frotar con jabon', imagen: '/assets/images/lavar-manos-cover.png' },
          { texto: 'Secar las manos', imagen: '/assets/images/lavar-manos-cover.png' },
        ],
      },
      {
        id: 1,
        nombre: 'Hacer la cama',
        imagenPortada: '/assets/images/hacer-cama-cover.png',
        color: '#ffb3b3',
        completado: false,
        momento: 'manana',
        tipoDia: 'semana',
        pasos: [
          { texto: 'Estirar la sabana', imagen: '/assets/images/estirar-sabana.png' },
          { texto: 'Colocar la almohada', imagen: '/assets/images/hacer-cama-cover.png' },
          { texto: 'Dejar la cama ordenada', imagen: '/assets/images/hacer-cama-cover.png' },
        ],
      },
      {
        id: 2,
        nombre: 'Poner lavadora',
        imagenPortada: '/assets/images/poner-ropa-lavadora.png',
        color: '#ffc0cb',
        completado: false,
        momento: 'mediodia',
        tipoDia: 'finde',
        pasos: [
          { texto: 'Llevar la ropa sucia', imagen: '/assets/images/llevar-ropa-sucia.png' },
          { texto: 'Meter la ropa en la lavadora', imagen: '/assets/images/poner-ropa-lavadora.png' },
          { texto: 'Poner detergente', imagen: '/assets/images/poner-detergente.png' },
          { texto: 'Seleccionar programa', imagen: '/assets/images/seleccion-programa.png' },
        ],
      },
      {
        id: 3,
        nombre: 'Recoger platos',
        imagenPortada: '/assets/images/recoger-platos.png',
        color: '#b3e5fc',
        completado: false,
        momento: 'noche',
        tipoDia: 'ambos',
        pasos: [
          { texto: 'Recoger los platos de la mesa', imagen: '/assets/images/recoger-mesa.png' },
          { texto: 'Llevarlos al fregadero', imagen: '/assets/images/llevar-fregadero.png' },
          { texto: 'Enjuagar los platos', imagen: '/assets/images/enjuagar-platos-user.png' },
          { texto: 'Colocar en el lavavajillas', imagen: '/assets/images/poner-lavavajillas-user.png' },
        ],
      },
      {
        id: 4,
        nombre: 'Ordenar la habitacion',
        imagenPortada: '/assets/images/hacer-cama-cover.png',
        color: '#ffe7b3',
        completado: false,
        momento: 'manana',
        tipoDia: 'ambos',
        pasos: [
          { texto: 'Estirar la cama', imagen: '/assets/images/estirar-sabana.png' },
          { texto: 'Colocar cojines y almohada', imagen: '/assets/images/hacer-cama-cover.png' },
          { texto: 'Dejar la habitacion ordenada', imagen: '/assets/images/hacer-cama-cover.png' },
        ],
      },
      {
        id: 5,
        nombre: 'Preparar la mesa',
        imagenPortada: '/assets/images/recoger-mesa.png',
        color: '#ffd8be',
        completado: false,
        momento: 'mediodia',
        tipoDia: 'semana',
        pasos: [
          { texto: 'Llevar platos a la mesa', imagen: '/assets/images/recoger-mesa.png' },
          { texto: 'Colocar vasos y cubiertos', imagen: '/assets/images/recoger-platos.png' },
          { texto: 'Comprobar que esta todo listo', imagen: '/assets/images/recoger-mesa.png' },
        ],
      },
      {
        id: 6,
        nombre: 'Enjuagar platos',
        imagenPortada: '/assets/images/enjuagar-platos.png',
        color: '#cdeffd',
        completado: false,
        momento: 'mediodia',
        tipoDia: 'ambos',
        pasos: [
          { texto: 'Llevar platos al fregadero', imagen: '/assets/images/llevar-fregadero.png' },
          { texto: 'Abrir agua y enjuagar', imagen: '/assets/images/enjuagar-platos.png' },
          { texto: 'Dejar platos limpios', imagen: '/assets/images/enjuagar-platos-user.png' },
        ],
      },
      {
        id: 7,
        nombre: 'Higiene antes de dormir',
        imagenPortada: '/assets/images/lavar-manos-cover.png',
        color: '#e2d8ff',
        completado: false,
        momento: 'noche',
        tipoDia: 'ambos',
        pasos: [
          { texto: 'Lavar manos y cara', imagen: '/assets/images/lavar-manos-cover.png' },
          { texto: 'Secar con toalla', imagen: '/assets/images/lavar-manos-cover.png' },
          { texto: 'Prepararse para dormir', imagen: '/assets/images/lavar-manos-cover.png' },
        ],
      },
      {
        id: 8,
        nombre: 'Colada del fin de semana',
        imagenPortada: '/assets/images/poner-ropa-lavadora.png',
        color: '#ffd6e7',
        completado: false,
        momento: 'mediodia',
        tipoDia: 'finde',
        pasos: [
          { texto: 'Separar la ropa sucia', imagen: '/assets/images/llevar-ropa-sucia.png' },
          { texto: 'Poner ropa en la lavadora', imagen: '/assets/images/poner-ropa-lavadora.png' },
          { texto: 'Anadir detergente', imagen: '/assets/images/poner-detergente.png' },
          { texto: 'Elegir programa de lavado', imagen: '/assets/images/seleccion-programa.png' },
        ],
      },
    ];
  }
}
