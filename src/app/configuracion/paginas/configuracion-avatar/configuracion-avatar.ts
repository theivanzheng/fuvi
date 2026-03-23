import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AvatarType } from '../../../core/models/habito.model';
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
  private readonly habitosService = inject(HabitosService);

  avatarSeleccionado = this.habitosService.avatarSeleccionado;

  seleccionarAvatar(avatar: AvatarType): void {
    this.habitosService.cambiarAvatar(avatar);
    this.router.navigateByUrl('/');
  }
}
