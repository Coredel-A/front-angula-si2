import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ApiService } from 'src/app/services/api.service';
//import { PacientesDetailsComponent } from './pacientes-details/pacientes-details.component';
import { MatMenuModule } from '@angular/material/menu';

interface Paciente {
  id: string;
  nombre: string;
  apellido: string;
  ci: string;
  telefono: string | null;
  email: string | null;
  fecha_nacimiento: Date;
  sexo: string;
  residencia: string | null;
  direccion: string | null;
  religion: string | null;
  ocupacion: string | null;
  asegurado: boolean;
  beneficiario_de?: {
    id: string;
    nombre: string;
    apellido: string;
  } | null;
}

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

interface Historia {
  id: string;
  paciente: string;
  usuario: number;
  especialidad: number;
  fecha: Date;
  motivo_consulta: string;
  fuente: string;
  confiabilidad: string | null;
  diagnostico: string;
  signos_vitales: {
    presion_arterial: string;
    frecuencia_cardiaca: number;
    temperatura: number;
    saturacion_oxigeno: number;
  };
  especialidad_nombre: string;
}

interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Component({
  selector: 'app-pacientes-details',
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
    MatSnackBarModule,
    MatPaginatorModule,
    CommonModule,
    MatMenuModule,
  ],
  templateUrl: './pacientes-details.component.html',
  styleUrl: './pacientes-details.component.scss'
})
export class PacientesDetailsComponent implements OnInit {
  paciente: Paciente | null = null;
  beneficiarios: Paciente[] = [];
  historias: Historia[] = [];
  especialidades: { [id: number]: string } = {};

  loading = false;
  loadingBeneficiarios = false;
  loadingHistorias = false;
  pacienteId: string = '';

  // Paginación para historias clínicas
  totalItems = 0;
  pageSize = 5; // Reducido para mejor UX
  currentPage = 0;

  opcionesSexo: { [key: string]: string } = {
    'M': 'Masculino',
    'F': 'Femenino',
    'O': 'Otro'
  };
  //trackByHistoria: TrackByFunction<Historia>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.pacienteId = id;
        this.cargarDatosPaciente();
      }
    });
  }

  private cargarDatosPaciente(): void {
    this.cargarPaciente();
    this.cargarBeneficiarios();
    this.cargarHistoriasClinicas();
  }

  private cargarPaciente(): void {
    this.loading = true;

    this.apiService.get<Paciente>(`api/pacientes/${this.pacienteId}/`).subscribe({
      next: (paciente) => {
        this.paciente = paciente;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar paciente:', err);
        this.loading = false;
        this.mostrarError('Error al cargar los datos del paciente');
        this.router.navigate(['/pacientes']);
      }
    });
  }

  private cargarBeneficiarios(): void {
    if (!this.pacienteId) return;

    this.loadingBeneficiarios = true;

    this.apiService.get<ApiResponse<Paciente>>('api/pacientes/', {
      params: { beneficiario_de: this.pacienteId }
    }).subscribe({
      next: (response) => {
        this.beneficiarios = response.results;
        this.loadingBeneficiarios = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar beneficiarios:', err);
        this.loadingBeneficiarios = false;
        this.mostrarError('Error al cargar beneficiarios');
      }
    });
  }

  cargarHistoriasClinicas(): void {
    if (!this.pacienteId) return;

    this.loadingHistorias = true;

    const params = {
      page: this.currentPage + 1,
      page_size: this.pageSize,
      paciente: this.pacienteId,
      ordering: '-fecha' // Ordenar por fecha descendente (más recientes primero)
    };

    // Corregido el endpoint
    this.apiService.get<ApiResponse<Historia>>('api/historiales/historiales/', params).subscribe({
      next: (data) => {
        this.historias = data.results;
        this.historias.forEach(historia => {
          historia.especialidad_nombre = this.especialidades[historia.especialidad];
        });

        this.totalItems = data.count;
        this.loadingHistorias = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar historias clínicas:', err);
        this.loadingHistorias = false;
        this.mostrarError('Error al cargar historias clínicas');
      }
    });
  }

  cargarEspecialidades(): void {
    this.apiService.get<ApiResponse<Especialidad>>('api/especialidades/').subscribe({
      next: (res) => {
        res.results.forEach(esp => {
          this.especialidades[esp.id] = esp.nombre;
        });
        this.historias.forEach(historia => {
          historia.especialidad_nombre = this.especialidades[historia.especialidad]
        });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.cargarHistoriasClinicas();
  }

  crearHistoriaClinica(): void {
    this.router.navigate(['/historias/crear'], {
      queryParams: {
        pacienteId: this.pacienteId,
      },
    });
  }

  verHistoriaClinica(historiaId: string): void {
    this.router.navigate(['/historias', historiaId, 'details']);
  }

  editarHistoriaClinica(historiaId: string): void {
    this.router.navigate(['/historias', historiaId, 'edit']);
  }

  editarPaciente(): void {
    this.router.navigate(['/pacientes/edit', this.pacienteId]);
  }

  eliminarPaciente(): void {
    if (confirm('¿Está seguro de que desea eliminar este paciente? Esta acción no se puede deshacer.')) {
      this.apiService.delete(`api/pacientes/`, this.pacienteId).subscribe({
        next: () => {
          this.mostrarExito('Paciente eliminado exitosamente');
          this.router.navigate(['/pacientes']);
        },
        error: (err) => {
          console.error('Error al eliminar paciente:', err);
          this.mostrarError('Error al eliminar el paciente');
        }
      });
    }
  }

  verBeneficiario(beneficiarioId: string): void {
    this.router.navigate(['/pacientes', beneficiarioId, 'details']);
  }

  verAsegurado(): void {
    if (this.paciente?.beneficiario_de?.id) {
      this.router.navigate(['/pacientes', this.paciente.beneficiario_de.id, 'details']);
    }
  }

  volverALista(): void {
    this.router.navigate(['/pacientes']);
  }

  // Métodos de utilidad
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

  formatearFechaCorta(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatearTelefono(telefono: string | null): string {
    if (!telefono) return 'No especificado';

    if (telefono.length === 8) {
      return `${telefono.substring(0, 4)}-${telefono.substring(4)}`;
    }

    return telefono;
  }

  getSexoLabel(sexo: string): string {
    return this.opcionesSexo[sexo] || sexo;
  }

  getEstadoAseguradoLabel(asegurado: boolean): string {
    return asegurado ? 'Asegurado' : 'No Asegurado';
  }

  getEstadoAseguradoColor(asegurado: boolean): string {
    return asegurado ? 'primary' : 'accent';
  }

  getIniciales(): string {
    if (!this.paciente) return '';

    const nombre = this.paciente.nombre.charAt(0).toUpperCase();
    const apellido = this.paciente.apellido.charAt(0).toUpperCase();

    return `${nombre}${apellido}`;
  }

  // Métodos para validar si mostrar cierta información
  tieneDatosContacto(): boolean {
    return !!(this.paciente?.telefono || this.paciente?.email);
  }

  tieneDatosUbicacion(): boolean {
    return !!(this.paciente?.residencia || this.paciente?.direccion);
  }

  tieneDatosPersonales(): boolean {
    return !!(this.paciente?.religion || this.paciente?.ocupacion);
  }

  tieneHistorias(): boolean {
    return this.historias.length > 0;
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
  trackByHistoria(index: number, historia: Historia): string {
    return historia.id;
  }

}