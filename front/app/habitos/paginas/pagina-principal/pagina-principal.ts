import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HabitosService } from '../../../core/services/habitos.service';
import { CabeceraFuvi } from '../../../shared/components/cabecera-fuvi/cabecera-fuvi';

@Component({
  selector: 'app-pagina-principal',
  imports: [CabeceraFuvi, RouterLink, NgOptimizedImage],
  templateUrl: './pagina-principal.html',
  styleUrl: './pagina-principal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaPrincipal {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly habitosService = inject(HabitosService);

  avatarPrincipal = this.habitosService.avatarPrincipal;

  async cerrarSesion(): Promise<void> {
    await this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}
