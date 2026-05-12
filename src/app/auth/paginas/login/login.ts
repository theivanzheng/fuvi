import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, Usuario } from '../../../core/services/auth.service';

const PLACEHOLDERS: Usuario[] = [
  { _id: 'p1', nombre: '- - -', avatar: 'female', color: '#FFDDE1' },
  { _id: 'p2', nombre: '- - -', avatar: 'male',   color: '#D1E8FF' },
  { _id: 'p3', nombre: '- - -', avatar: 'female', color: '#FFE8D1' },
  { _id: 'p4', nombre: '- - -', avatar: 'male',   color: '#D1FFE8' },
  { _id: 'p5', nombre: '- - -', avatar: 'female', color: '#FFF5D1' },
  { _id: 'p6', nombre: '- - -', avatar: 'male',   color: '#E8D1FF' },
];

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  usuarios = signal<Usuario[]>([]);
  cargando = signal(true);
  seleccionando = signal(false);
  mensajeError = signal('');

  hayUsuarios = computed(() => this.usuarios().length > 0);
  usuariosAMostrar = computed(() => this.hayUsuarios() ? this.usuarios() : PLACEHOLDERS);

  constructor() {
    void this.inicializar();
  }

  private async inicializar(): Promise<void> {
    try {
      if (this.authService.estaLogueado()) {
        void this.router.navigateByUrl('/inicio');
        return;
      }

      const lista = await this.authService.getUsuarios();
      this.usuarios.set(lista);

      if (lista.length === 0) {
        this.mensajeError.set('NO SE PUDO CONECTAR AL SERVIDOR');
      }
    } catch {
      this.mensajeError.set('ERROR AL CARGAR USUARIOS');
    } finally {
      this.cargando.set(false);
    }
  }

  imagenAvatar(avatar: 'female' | 'male'): string {
    return avatar === 'male'
      ? '/assets/images/character-male.png'
      : '/assets/images/character-female.png';
  }

  async seleccionarUsuario(usuario: Usuario): Promise<void> {
    if (this.seleccionando() || !this.hayUsuarios()) return;

    this.seleccionando.set(true);
    this.mensajeError.set('');

    const resultado = await this.authService.login(usuario.nombre);
    this.seleccionando.set(false);

    if (!resultado) {
      this.mensajeError.set('NO SE PUDO INICIAR SESIÓN');
      return;
    }

    await this.router.navigateByUrl('/inicio');
  }
}
