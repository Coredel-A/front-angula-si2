import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';

@Component({
  selector: 'app-inicio-page',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    TablerIconsModule
  ],
  templateUrl: './inicio-page.component.html',
  styleUrl: './inicio-page.component.scss'
})
export class InicioPageComponent implements OnInit {
  user: any = {};

  constructor() { }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('usuario') || '{}');

    // Formatear la fecha de registro si existe
    if (this.user.fecha_registro) {
      this.user.fecha_registro_formateada = new Date(this.user.fecha_registro).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    // Formatear fecha de nacimiento si existe
    if (this.user.fecha_nacimiento) {
      this.user.fecha_nacimiento_formateada = new Date(this.user.fecha_nacimiento).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }

  // Método para obtener el estado del usuario
  getEstadoUsuario(): string {
    return this.user.is_active ? 'Activo' : 'Inactivo';
  }

  // Método para obtener el color del chip de estado
  getEstadoColor(): string {
    return this.user.is_active ? 'primary' : 'warn';
  }

  // Método para contar permisos
  getPermisosCount(): number {
    return this.user.permisos ? this.user.permisos.length : 0;
  }
}
