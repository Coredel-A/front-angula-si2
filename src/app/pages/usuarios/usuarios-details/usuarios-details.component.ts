import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from 'src/app/services/api.service';

interface Especialidad {
  id: number;
  nombre: string;
  descripcion: string;
}

interface Establecimiento {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  correo: string;
  tipo_establecimiento: string;
  tipo_establecimiento_display: string;
  nivel: string;
  nivel_display: string;
  especialidades: Especialidad[];
}

interface Rol {
  id: number;
  nombre: string;
}

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  fecha_nacimiento: Date | null;
  fecha_registro: Date;
  especialidad: Especialidad | null;
  establecimiento: Establecimiento | null;
  rol: Rol | null;
  permisos: string[];
  is_active: boolean;
  is_staff: boolean;
}

interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Component({
  selector: 'app-usuarios-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './usuarios-details.component.html',
  styleUrl: './usuarios-details.component.scss'
})
export class UsuariosDetailsComponent implements OnInit {
  usuario: Usuario | null = null;
  usuarioId: string = '';
  loading = false;
  rolDisponibles: Rol[] = [];
  especialidadesDisponibles: Especialidad[] = [];
  establecimientoDisponibles: Establecimiento[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.usuarioId = id;
        this.cargarUsuario();
        this.cargarRoles();
        this.cargarEspecialidades();
        this.cargarEstablecimiento();
      }
    });
  }

  private cargarUsuario(): void {
    this.loading = true;
    this.apiService.get<Usuario>(`api/usuarios/${this.usuarioId}/`).subscribe({
      next: (usuario) => {
        this.usuario = usuario;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar el Usuario:', err);
        this.loading = false;
        this.router.navigate(['/usuarios']);
      }
    });
  }

  private cargarEspecialidades(): void {
    this.apiService.get<ApiResponse<Especialidad>>('api/especialidades/').subscribe({
      next: (data) => {
        this.especialidadesDisponibles = data.results;
      },
      error: (err) => {
        console.error('Error al cargar Espcialidades', err);
      }
    });
  }

  private cargarEstablecimiento(): void {
    this.apiService.get<ApiResponse<Establecimiento>>('api/sucursales/establecimientos/').subscribe({
      next: (data) => {
        this.establecimientoDisponibles = data.results;
      },
      error: (err) => {
        console.error('Error al cargar Establecimientos', err);
      }
    });
  }

  private cargarRoles(): void {
    this.apiService.get<ApiResponse<Rol>>('api/roles/roles').subscribe({
      next: (data) => {
        this.rolDisponibles = data.results;
      },
      error: (err) => {
        console.error('Error al cargar Roles:', err);
      }
    });
  }

  editarUsuario(): void {
    this.router.navigate(['/usuarios/edit', this.usuarioId]);
  }

  eliminarUsuario(): void {
    if (confirm('¿Está seguro de que desea eliminar este paciente?')) {
      this.apiService.delete(`api/usuarios`, this.usuarioId).subscribe({
        next: () => {
          this.mostrarExito('Usuario eliminado exitosamente');
          this.router.navigate(['/usuarios']);
        },
        error: (err) => {
          console.error('Error al eliminar usuario:', err);
          this.mostrarError('Error al eliminar usuario');
        }
      });
    }
  }

  volverALista(): void {
    this.router.navigate(['/usuarios']);
  }

  calcularEdad(fechaNacimiento: Date): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  tieneDatosContacto(): boolean {
    return !!(this.usuario?.email);
  }

  tieneEspecialidades(): boolean {
    return !!this.usuario?.especialidad;
  }

  tieneEstablecimiento(): boolean {
    return !!this.usuario?.establecimiento;
  }

  getNombreCompleto(): string {
    return `${this.usuario?.nombre} ${this.usuario?.apellido}`;
  }

  private mostrarExito(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: ['snackbar-success']
    });
  }
  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      panelClass: ['snackbar-error']
    });
  }

}
