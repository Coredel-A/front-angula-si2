import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { NavItem } from './nav-item/nav-item';
import { navItems } from './sidebar-data';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-sidebar',
  imports: [TablerIconsModule, MaterialModule, RouterModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  grupoUsuario: string = localStorage.getItem('grupos') || '';
  sidebarItems: NavItem[] = [];
  constructor(
    private apiService: ApiService,
        private route: ActivatedRoute,
        private router: Router
  ) { }
  @Input() showToggle = true;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();

  ngOnInit(): void {
    this.sidebarItems = navItems.filter(item => {
      return !item.grupos || item.grupos.includes(this.grupoUsuario);
    });
  }

  logout() {
    const refreshToken = localStorage.getItem('refresh');
    const accessToken = localStorage.getItem('token');

    if (refreshToken && accessToken) {
      this.apiService.post('api/usuarios/auth/logout/', { refresh: refreshToken }).subscribe({
        next: (res) => console.log('Sesión cerrada en el backend'),
        error: (err) => console.warn('Error al cerrar sesión en backend', err),
        complete: () => {
          this.clearStorageAndRedirect();
        }
      });
    } else {
      this.clearStorageAndRedirect();
    }
  }

  clearStorageAndRedirect() {
    localStorage.removeItem('token'); 
    localStorage.removeItem('refresh');
    localStorage.removeItem('rol');
    localStorage.removeItem('permisos');
    this.router.navigate(['/authentication/login']);
  }
}
