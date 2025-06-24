import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { ApiService } from 'src/app/services/api.service';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Especialidad {
  id: number;
  nombre: string;
  descripcion: string;
}

interface Respuesta {
  id: string;
  pregunta: string;
  valor: string;
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
  especialidad_nombre?: string; // Agregado para mostrar el nombre de la especialidad
  activo: boolean;
  fecha_creacion?: string;
  fecha_modificacion?: string;
}

interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Component({
  selector: 'app-formulario-table',
  standalone: true,
  imports: [
    MatTableModule,
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSortModule,
    MatTooltipModule,
    RouterModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatDividerModule
  ],
  templateUrl: './formulario-table.component.html',
  styleUrl: './formulario-table.component.scss'
})
export class FormularioTableComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  formularios = new MatTableDataSource<Formulario>();
  formularioColumns: string[] = ['nombre', 'especialidad', 'activo', 'fecha_creacion', 'acciones'];

  totalItems = 0;
  pageSize = 10; // Corregido el typo
  currentPage = 0;
  loading = false;
  
  // Filtros
  filterForm: FormGroup;
  especialidades = new MatTableDataSource<Especialidad>();

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      nombre: [''],
      especialidad: [''],
      activo: ['']
    });
  }

  ngOnInit(): void {
    this.cargarEspecialidades();
    this.cargarFormularios();
    this.setupFilters();
  }

  ngAfterViewInit(): void {
    this.formularios.paginator = this.paginator;
  }

  private setupFilters(): void {
    // Filtro por nombre con debounce
    this.filterForm.get('nombre')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 0;
        this.cargarFormularios();
      });

    // Filtro por especialidad
    this.filterForm.get('especialidad')?.valueChanges
      .subscribe(() => {
        this.currentPage = 0;
        this.cargarFormularios();
      });

    // Filtro por estado activo
    this.filterForm.get('activo')?.valueChanges
      .subscribe(() => {
        this.currentPage = 0;
        this.cargarFormularios();
      });
  }

  private cargarEspecialidades(): void {
    this.loading = true;
    const params = {
      page: this.currentPage + 1
    };

    this.apiService.get<ApiResponse<Especialidad>>('api/especialidades', params).subscribe({
      next: (data) => {
        this.especialidades.data = data.results;
        this.totalItems = data.count;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar Especialidades:', err);
        this.loading = false;
      }
    })
  }

  cargarFormularios(): void {
    this.loading = true;
    
    const params: any = {
      page: this.currentPage + 1,
      page_size: this.pageSize
    };

    // Agregar filtros si están presentes
    const filters = this.filterForm.value;
    if (filters.nombre) {
      params.nombre = filters.nombre;
    }
    if (filters.especialidad) {
      params.especialidad = filters.especialidad;
    }
    if (filters.activo !== '') {
      params.activo = filters.activo;
    }

    this.apiService.get<ApiResponse<Formulario>>('api/historiales/formularios', params).subscribe({
      next: (data) => {
        // Enriquecer los datos con el nombre de la especialidad
        const formulariosEnriquecidos = data.results.map(formulario => ({
          ...formulario,
          especialidad_nombre: this.obtenerNombreEspecialidad(formulario.especialidad)
        }));
        
        this.formularios.data = formulariosEnriquecidos;
        this.totalItems = data.count;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar los formularios', err);
        this.mostrarError('Error al cargar los formularios');
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.cargarFormularios();
  }

  obtenerNombreEspecialidad(especialidadId: number): string {
    const especialidad = this.especialidades.data.find(e => e.id === especialidadId);
    return especialidad ? especialidad.nombre : 'No especificada';
  }

  verFormulario(formulario: Formulario): void {
    this.router.navigate(['/formularios', formulario.id, 'details']);
  }

  toggleActivoFormulario(formulario: Formulario): void {
    const nuevoEstado = !formulario.activo;
    
    this.apiService.patch(`api/historiales/formularios`,formulario.id,'', { activo: nuevoEstado }).subscribe({
      next: () => {
        formulario.activo = nuevoEstado;
        this.mostrarExito(`Formulario ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`);
      },
      error: (err) => {
        console.error('Error al cambiar estado del formulario', err);
        console.error('id del formulario', Number(formulario.id));
        this.mostrarError('Error al cambiar el estado del formulario');
      }
    });
  }

  limpiarFiltros(): void {
    this.filterForm.reset();
    this.currentPage = 0;
    this.cargarFormularios();
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
}