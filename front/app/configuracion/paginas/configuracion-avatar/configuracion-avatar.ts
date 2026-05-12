import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AvatarType } from '../../../core/models/habito.model';
import { AuthService } from '../../../core/services/auth.service';
import { HabitosService } from '../../../core/services/habitos.service';

@Component({
  selector: 'app-configuracion-avatar',
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './configuracion-avatar.html',
  styleUrl: './configuracion-avatar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfiguracionAvatar {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly habitosService = inject(HabitosService);

  avatarSeleccionado = this.habitosService.avatarSeleccionado;

  async seleccionarAvatar(avatar: AvatarType): Promise<void> {
    this.habitosService.avatarSeleccionado.set(avatar);
    await this.authService.actualizarAvatar(avatar);
    await this.router.navigateByUrl('/inicio');
  }
}
