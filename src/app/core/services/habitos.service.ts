import { isPlatformBrowser } from '@angular/common';
import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { AvatarType, Habito } from '../models/habito.model';

const STORAGE_HABITOS = 'fuvi_habitos_v1';
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
      return JSON.parse(habitosGuardados) as Habito[];
    } catch {
      return this.getHabitosIniciales();
    }
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
        pasos: [
          { texto: 'Estirar la sabana', imagen: '/assets/images/estirar-sabana.png' },
          { texto: 'Colocar la almohada', imagen: '/assets/images/hacer-cama-cover.png' },
          { texto: 'Dejar la cama ordenada', imagen: '/assets/images/hacer-cama-cover.png' },
        ],
      },
      {
        id: 2,
        nombre: 'Poner lavadora',
        imagenPortada: '/assets/images/poner-lavavajillas.png',
        color: '#ffc0cb',
        completado: false,
        pasos: [
          { texto: 'Llevar la ropa sucia', imagen: '/assets/images/llevar-fregadero.png' },
          { texto: 'Meter la ropa en la lavadora', imagen: '/assets/images/poner-lavavajillas.png' },
          { texto: 'Poner detergente', imagen: '/assets/images/poner-lavavajillas-user.png' },
          { texto: 'Seleccionar programa', imagen: '/assets/images/poner-lavavajillas-user.png' },
        ],
      },
      {
        id: 3,
        nombre: 'Recoger platos',
        imagenPortada: '/assets/images/recoger-platos.png',
        color: '#b3e5fc',
        completado: false,
        pasos: [
          { texto: 'Recoger los platos de la mesa', imagen: '/assets/images/recoger-mesa.png' },
          { texto: 'Llevarlos al fregadero', imagen: '/assets/images/llevar-fregadero.png' },
          { texto: 'Enjuagar los platos', imagen: '/assets/images/enjuagar-platos-user.png' },
          { texto: 'Colocar en el lavavajillas', imagen: '/assets/images/poner-lavavajillas-user.png' },
        ],
      },
    ];
  }
}
