import { Routes } from '@angular/router';
import { PaginaPrincipal } from './habitos/paginas/pagina-principal/pagina-principal';
import { DetalleHabito } from './habitos/paginas/detalle-habito/detalle-habito';
import { CelebracionHabito } from './habitos/paginas/celebracion-habito/celebracion-habito';
import { ConfiguracionAvatar } from './configuracion/paginas/configuracion-avatar/configuracion-avatar';

export const routes: Routes = [
	{ path: '', component: PaginaPrincipal },
	{ path: 'habitos/:id', component: DetalleHabito },
	{ path: 'habitos/:id/completado', component: CelebracionHabito },
	{ path: 'configuracion/avatar', component: ConfiguracionAvatar },
	{ path: '**', redirectTo: '' },
];
