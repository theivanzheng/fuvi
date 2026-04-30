import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

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

  nombre = signal('');
  cargando = signal(false);
  mensajeError = signal('');

  constructor() {
    void this.redirigirSiSesionActiva();
  }

  private async redirigirSiSesionActiva(): Promise<void> {
    const usuario = this.authService.estaLogueado()
      ? this.authService.getUsuarioActual()
      : await this.authService.cargarSesion();

    if (usuario) {
      void this.router.navigateByUrl('/inicio');
    }
  }

  actualizarNombre(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.nombre.set(input.value);
    this.mensajeError.set('');
  }

  async entrar(): Promise<void> {
    const nombre = this.nombre().trim();

    if (!nombre) {
      this.mensajeError.set('ESCRIBE TU NOMBRE PARA ENTRAR');
      return;
    }

    this.cargando.set(true);
    this.mensajeError.set('');

    const usuario = await this.authService.login(nombre);
    this.cargando.set(false);

    if (!usuario) {
      this.mensajeError.set('NO HEMOS ENCONTRADO ESE USUARIO');
      return;
    }

    await this.router.navigateByUrl('/inicio');
  }
}
