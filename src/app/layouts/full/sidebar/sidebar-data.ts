import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Home',
  },
  {
    displayName: 'Inicio',
    iconName: 'user-circle',
    route: '/user-perfil',
  },
  {
    displayName: 'Bitacora',
    iconName: 'user-circle',
    route: '/bitacora',
  },
  {
    displayName: 'Usuarios',
    iconName: 'user-circle',
    route: '/usuarios',
  },
  {
    displayName: 'Formulario',
    iconName: 'user-circle',
    route: '/formularios',
  },
  {
    displayName: 'Pacientes',
    iconName: 'user-circle',
    route: '/pacientes',
  },
  {
    displayName: 'Sucursales',
    iconName: 'user-circle',
    route: '/sucursales',
    grupos: ['Doctor'],
  },
  {
    displayName: 'Especialidades',
    iconName: 'user-circle',
    route: '/especialidades',
  },
  {
    navCap: 'Auth',
  },
  {
    displayName: 'Login',
    iconName: 'login',
    route: '/authentication',
    children: [
      {
        displayName: 'Login',
        iconName: 'point',
        route: '/authentication/login',
      },
    ],
  },
];
