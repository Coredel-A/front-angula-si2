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
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

interface Especialidad {
  id: number;
  nombre: string;
  descripcion: string;
}

interface Pregunta {
  id: string;
  formulario: string;
  texto: string;
  tipo_dato: string;
  obligatorio: boolean;
  orden: number;
  respuesta: string | null;
}

interface Formulario {
  id: string;
  nombre: string;
  especialidad: number;
  activo: boolean;
}

interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Component({
  selector: 'app-formulario-details',
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
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  templateUrl: './formulario-details.component.html',
  styleUrl: './formulario-details.component.scss'
})
export class FormularioDetailsComponent implements OnInit {
  formulario: Formulario | null = null;
  especialidad: Especialidad | null = null;
  preguntas: Pregunta[] = [];

  loadingFormulario: boolean = false;
  loadingEspecialidad: boolean = false;
  loadingPreguntas: boolean = false;

  formularioId: string = '';

  totalItems = 0;
  pageSize = 10;
  currentPage = 0;

  // Mapeo de tipos de datos para mostrar labels más amigables
  tiposDatoLabels: { [key: string]: { label: string; icon: string } } = {
    'texto': { label: 'Texto', icon: 'text_fields' },
    'numero': { label: 'Número', icon: 'pin' },
    'booleano': { label: 'Sí/No', icon: 'check_box' },
    'fecha': { label: 'Fecha', icon: 'calendar_today' },
    'textarea': { label: 'Texto largo', icon: 'notes' },
  };

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
        this.formularioId = id;
        this.cargarFormularioById(this.formularioId);
      }
    });
  }

  private cargarFormularioById(formularioId: string): void {
    this.loadingFormulario = true;
    this.apiService.get<Formulario>(`api/historiales/formularios/${formularioId}`).subscribe({
      next: (formulario) => {
        this.formulario = formulario;
        this.loadingFormulario = false;
        this.cargarEspecialidadById(formulario.especialidad);
        this.cargarPreguntasById();
      },
      error: (err) => {
        console.error('Error al cargar el formulario:', err);
        this.mostrarError('Error al cargar el formulario');
        this.loadingFormulario = false;
      }
    });
  }

  private cargarEspecialidadById(especialidadId: number): void {
    this.loadingEspecialidad = true;
    this.apiService.get<Especialidad>(`api/especialidades/${especialidadId}`).subscribe({
      next: (especialidad) => {
        this.especialidad = especialidad;
        this.loadingEspecialidad = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar la especialidad:', err);
        this.loadingEspecialidad = false;
      }
    });
  }

  private cargarPreguntasById(): void {
    if (!this.formularioId) return;

    this.loadingPreguntas = true;
    const params = {
      page: this.currentPage + 1,
      formulario: this.formularioId
    };

    this.apiService.get<ApiResponse<Pregunta>>('api/historiales/preguntas', params).subscribe({
      next: (data) => {
        // Ordenar preguntas por orden
        this.preguntas = data.results.sort((a, b) => a.orden - b.orden);
        this.totalItems = data.count;
        this.loadingPreguntas = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar las Preguntas:', err);
        this.mostrarError('Error al cargar las preguntas');
        this.loadingPreguntas = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.cargarPreguntasById();
  }

  editarFormulario(): void {
    this.router.navigate(['/formularios/editar', this.formularioId]);
  }

  duplicarFormulario(): void {
    // Implementar lógica para duplicar formulario
    this.mostrarInfo('Funcionalidad de duplicar formulario en desarrollo');
  }

  eliminarFormulario(): void {
    const confirmacion = confirm('¿Está seguro de que desea eliminar este formulario? Esta acción no se puede deshacer.');
    if (!confirmacion) return;

    this.apiService.delete(`api/historiales/formularios`,this.formularioId).subscribe({
      next: () => {
        this.mostrarExito('Formulario eliminado exitosamente');
        this.router.navigate(['/formularios']);
      },
      error: (err) => {
        console.error('Error al eliminar el formulario:', err);
        this.mostrarError('Error al eliminar el formulario');
      }
    });
  }

  toggleEstadoFormulario(): void {
    if (!this.formulario) return;

    const nuevoEstado = !this.formulario.activo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    
    const confirmacion = confirm(`¿Está seguro de que desea ${accion} este formulario?`);
    if (!confirmacion) return;

    const datosActualizacion = {
      ...this.formulario,
      activo: nuevoEstado
    };

    this.apiService.put(`api/historiales/formularios/`, this.formularioId, datosActualizacion).subscribe({
      next: (formularioActualizado) => {
        this.formulario = formularioActualizado as Formulario;
        this.mostrarExito(`Formulario ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al actualizar el estado del formulario:', err);
        this.mostrarError('Error al actualizar el estado del formulario');
      }
    });
  }

  volver(): void {
    this.router.navigate(['/formularios']);
  }

  getTipoDatoInfo(tipoDato: string): { label: string; icon: string } {
    return this.tiposDatoLabels[tipoDato] || { label: tipoDato, icon: 'help' };
  }

  get isLoading(): boolean {
    return this.loadingFormulario || this.loadingEspecialidad || this.loadingPreguntas;
  }

  get preguntasObligatorias(): number {
    return this.preguntas.filter(p => p.obligatorio).length;
  }

  get preguntasOpcionales(): number {
    return this.preguntas.filter(p => !p.obligatorio).length;
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private mostrarExito(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private mostrarInfo(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }
}