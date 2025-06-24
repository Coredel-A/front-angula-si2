import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';
import { authGuard } from './guards/auth.guards';

export const routes: Routes = [
  {
    path: '',
    component: FullComponent,
    children: [
      {
        path: '',
        redirectTo: '/authentication/login',
        pathMatch: 'full',
      },
      {
        path: 'user-perfil',
        loadComponent: () =>
          import('./pages/inicio-page/inicio-page.component').then(
            (m) => m.InicioPageComponent
          )
      },
      {
        path: 'bitacora',
        loadComponent: () =>
          import('./pages/bitacora/bitacora.component').then(
            (m) => m.BitacoraComponent
          ),canActivate:[authGuard]
      },
      {
        path: 'bitacora/:id/details',
        loadComponent: () =>
          import('./pages/bitacora/bitacora-details/bitacora-details.component').then(
            (m) => m.BitacoraDetailsComponent
          ),canActivate:[authGuard]
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./pages/usuarios/usuarios.component').then(
            (m) => m.UsuariosComponent
          ),canActivate:[authGuard]
      },
      {
        path: 'usuarios/crear',
        loadComponent: () =>
          import('./pages/usuarios/usuarios-forms/usuarios-forms.component').then(
            (m) => m.UsuariosFormsComponent
          ),canActivate:[authGuard]
      },
      {
        path: 'usuarios/:id/details',
        loadComponent: () =>
          import('./pages/usuarios/usuarios-details/usuarios-details.component').then(
            (m) => m.UsuariosDetailsComponent
          ),canActivate:[authGuard]
      },
      {
        path: 'usuarios/edit/:id',
        loadComponent: () =>
          import('./pages/usuarios/usuarios-forms/usuarios-forms.component').then(
            (m) => m.UsuariosFormsComponent
          ),canActivate:[authGuard]
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('./pages/usuarios/roles/roles.component').then(
            (m) => m.RolesComponent
          ),canActivate:[authGuard]
      },
      {
        path: 'roles/crear',
        loadComponent: () =>
          import('./pages/usuarios/roles/roles-forms/roles-forms.component').then(
            (m) => m.RolesFormsComponent
          ),canActivate:[authGuard]
      },
      {
        path: 'roles/edit/:id',
        loadComponent: () =>
          import('./pages/usuarios/roles/roles-forms/roles-forms.component').then(
            (m) => m.RolesFormsComponent
          ),canActivate:[authGuard]
      },
      {
        path: 'pacientes',
        loadComponent: () =>
          import('./pages/pacientes/pacientes.component').then(
            (m) => m.PacientesComponent
          ),canActivate:[authGuard]
      },
      {
        path: 'pacientes/crear',
        loadComponent: () =>
          import('./pages/pacientes/pacientes-forms/pacientes-forms.component').then(
            (m) => m.PacientesFormsComponent
          ),canActivate:[authGuard]
      },
      {
        path: 'pacientes/:id/details',
        loadComponent: () =>
          import('./pages/pacientes/pacientes-details/pacientes-details.component').then(
            (m) => m.PacientesDetailsComponent
          ),canActivate:[authGuard]
      },
      {
        path: 'pacientes/edit/:id',
        loadComponent: () =>
          import('./pages/pacientes/pacientes-forms/pacientes-forms.component').then(
            (m) => m.PacientesFormsComponent
          ),canActivate:[authGuard]
      },
      {
        path: 'historias',
        loadComponent: () =>
          import('./pages/historias/historias.component').then(
            (m) => m.HistoriasComponent
          ),canActivate:[authGuard]
      },
      {
        path: 'historias/crear',
        loadComponent: () =>
          import('./pages/historias/historias-forms/historias-forms.component').then(
            (m) => m.HistoriasFormsComponent
          ),canActivate:[authGuard]
      },
      {
        path: 'historias/:id/details',
        loadComponent: () =>
          import('./pages/historias/historias-details/historias-details.component').then(
            (m) => m.HistoriasDetailsComponent
          ),canActivate:[authGuard]
      },
      {
        path: 'formularios',
        loadComponent: () =>
          import('./pages/formulario-personalizado/formulario-table/formulario-table.component').then(
            (m) => m.FormularioTableComponent
          ),canActivate:[authGuard]
      },
      {
        path: 'formularios/crear',
        loadComponent: () =>
          import('./pages/formulario-personalizado/formulario-builder/formulario-builder.component').then(
            (m) => m.FormularioBuilderComponent
          ),canActivate:[authGuard]
      },
      {
        path: 'formularios/edit/:id',
        loadComponent: () =>
          import('./pages/formulario-personalizado/formulario-builder/formulario-builder.component').then(
            (m) => m.FormularioBuilderComponent
          ),canActivate:[authGuard]
      },
      {
        path: 'formularios/:id/details',
        loadComponent: () =>
          import('./pages/formulario-personalizado/formulario-details/formulario-details.component').then(
            (m) => m.FormularioDetailsComponent
          ),canActivate:[authGuard]
      },
      {
        path: 'sucursales',
        loadComponent: () =>
          import('./pages/sucursales/sucursales.component').then(
            (m) => m.SucursalesComponent
          ),canActivate:[authGuard]
      },
      {
        path: 'sucursales/crear',
        loadComponent: () =>
          import('./pages/sucursales/sucursales-forms/sucursales-forms.component').then(
            (m) => m.SucursalesFormsComponent
          ),canActivate:[authGuard]
      },
      {
        path: 'sucursales/:id/details',
        loadComponent: () =>
          import('./pages/sucursales/sucursales-details/sucursales-details.component').then(
            (m) => m.SucursalesDetailsComponent
          ),canActivate:[authGuard]
      },
      {
        path: 'sucursales/edit/:id',
        loadComponent: () =>
          import('./pages/sucursales/sucursales-forms/sucursales-forms.component').then(
            (m) => m.SucursalesFormsComponent
          ),canActivate:[authGuard]
      },
      {
        path: 'especialidades',
        loadComponent: () =>
          import('./pages/especialidades/especialidades.component').then(
            (m) => m.EspecialidadesComponent
          ),canActivate:[authGuard]
      },
      {
        path: 'especialidades/crear',
        loadComponent: () =>
          import('./pages/especialidades/especialidades-forms/especialidades-forms.component').then(
            (m) => m.EspecialidadesFormsComponent
          ),canActivate:[authGuard]
      },
      {
        path: 'especialidades/edit/:id',
        loadComponent: () =>
          import('./pages/especialidades/especialidades-forms/especialidades-forms.component').then(
            (m) => m.EspecialidadesFormsComponent
          ),canActivate:[authGuard]
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./pages/pages.routes').then((m) => m.PagesRoutes),
      },
      {
        path: 'ui-components',
        loadChildren: () =>
          import('./pages/ui-components/ui-components.routes').then(
            (m) => m.UiComponentsRoutes
          ),
      },
      {
        path: 'extra',
        loadChildren: () =>
          import('./pages/extra/extra.routes').then((m) => m.ExtraRoutes),
      },
    ],
  },
  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'authentication',
        loadChildren: () =>
          import('./pages/authentication/authentication.routes').then(
            (m) => m.AuthenticationRoutes
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'authentication/error',
  },
];
