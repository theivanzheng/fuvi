import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { Login } from './auth/paginas/login/login';
import { PaginaPrincipal } from './habitos/paginas/pagina-principal/pagina-principal';
import { RutinasMomento } from './habitos/paginas/rutinas-momento/rutinas-momento';
import { DetalleHabito } from './habitos/paginas/detalle-habito/detalle-habito';
import { CelebracionHabito } from './habitos/paginas/celebracion-habito/celebracion-habito';
import { ConfiguracionAvatar } from './configuracion/paginas/configuracion-avatar/configuracion-avatar';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'inicio', component: PaginaPrincipal, canActivate: [authGuard] },
  { path: 'rutinas/:momento', component: RutinasMomento, canActivate: [authGuard] },
  { path: 'habitos/:id', component: DetalleHabito, canActivate: [authGuard] },
  { path: 'habitos/:id/completado', component: CelebracionHabito, canActivate: [authGuard] },
  { path: 'configuracion/avatar', component: ConfiguracionAvatar, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' },
];
