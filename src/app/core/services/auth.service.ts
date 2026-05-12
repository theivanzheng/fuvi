import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AvatarType } from '../models/habito.model';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface Usuario {
  _id: string;
  nombre: string;
  avatar: AvatarType;
  color: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private sesionComprobada = false;
  private sesionPendiente: Promise<Usuario | null> | null = null;

  usuarioActual = signal<Usuario | null>(null);

  async login(nombre: string): Promise<Usuario | null> {
    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) {
      return null;
    }

    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<Usuario>>(
          `${environment.apiUrl}/login`,
          { nombre: nombreLimpio },
          { withCredentials: true },
        ),
      );

      if (!response.data) {
        return null;
      }

      const usuario = this.normalizarUsuario(response.data);
      this.usuarioActual.set(usuario);
      this.sesionComprobada = true;
      return usuario;
    } catch {
      this.usuarioActual.set(null);
      return null;
    }
  }

  async cargarSesion(): Promise<Usuario | null> {
    if (this.usuarioActual()) {
      return this.usuarioActual();
    }

    if (this.sesionComprobada) {
      return null;
    }

    if (this.sesionPendiente) {
      return this.sesionPendiente;
    }

    this.sesionPendiente = this.recuperarSesion();
    return this.sesionPendiente;
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${environment.apiUrl}/logout`, {}, { withCredentials: true }));
    } catch {
    } finally {
      this.usuarioActual.set(null);
      this.sesionComprobada = true;
      this.sesionPendiente = null;
    }
  }

  getUsuarioActual(): Usuario | null {
    return this.usuarioActual();
  }

  estaLogueado(): boolean {
    return this.getUsuarioActual() !== null;
  }

  async actualizarAvatar(avatar: AvatarType): Promise<void> {
    const usuario = this.getUsuarioActual();
    if (!usuario) {
      return;
    }

    const usuarioActualizado = { ...usuario, avatar };
    this.usuarioActual.set(usuarioActualizado);

    try {
      await firstValueFrom(
        this.http.patch(`${environment.apiUrl}/usuarios/${usuario._id}/avatar`, { avatar }, { withCredentials: true }),
      );
    } catch {}
  }

  private async recuperarSesion(): Promise<Usuario | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Usuario>>(`${environment.apiUrl}/sesion`, { withCredentials: true }),
      );

      if (!response.data) {
        this.usuarioActual.set(null);
        return null;
      }

      const usuario = this.normalizarUsuario(response.data);
      this.usuarioActual.set(usuario);
      return usuario;
    } catch {
      this.usuarioActual.set(null);
      return null;
    } finally {
      this.sesionComprobada = true;
      this.sesionPendiente = null;
    }
  }

  async getUsuarios(): Promise<Usuario[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Usuario[]>>(`${environment.apiUrl}/usuarios`, { withCredentials: true }),
      );
      return response.data ?? [];
    } catch {
      return [];
    }
  }

  private normalizarUsuario(usuario: Usuario): Usuario {
    return {
      _id: usuario._id,
      nombre: usuario.nombre,
      avatar: usuario.avatar === 'male' ? 'male' : 'female',
      color: usuario.color ?? '#FFDDE1',
    };
  }
}
