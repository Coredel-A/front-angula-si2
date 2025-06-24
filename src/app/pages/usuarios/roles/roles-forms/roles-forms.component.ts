import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Permiso {
  id: number;
  codename: string;
  descripcion: string | null;
}

interface Rol {
  id: number;
  nombre: string;
  permisos: Permiso[];
}

interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Component({
  selector: 'app-roles-forms',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatDividerModule,
  ],
  templateUrl: './roles-forms.component.html',
  styleUrl: './roles-forms.component.scss'
})
export class RolesFormsComponent implements OnInit {
  @Input() rolId?: string;
  @Input() isEditMode: boolean = false;
  @Output() formSubmit = new EventEmitter<Rol>();
  @Output() formCancel = new EventEmitter<void>();

  rolForm!: FormGroup;
  loading = false;
  submitting = false;

  // Listas de permisos
  permisosDisponibles: Permiso[] = [];
  permisosSeleccionados: Permiso[] = [];

  // Filtros para las listas
  filtroDisponibles = '';
  filtroSeleccionados = '';

  // Permisos filtrados
  permisosDisponiblesFiltrados: Permiso[] = [];
  permisosSeleccionadosFiltrados: Permiso[] = [];

  // Selecciones múltiples
  selectedAvailable: number[] = [];
  selectedChosen: number[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.cargarPermisos();

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.rolId = idParam;
        this.isEditMode = true;
        this.cargarRolById();
      }
    });
  }

  private initializeForm(rol?: Rol): void {
    this.rolForm = this.formBuilder.group({
      nombre: [rol?.nombre || '', [Validators.required, Validators.minLength(2)]],
    });

    if (rol) {
      this.permisosSeleccionados = [...rol.permisos];
      this.actualizarListasPermisos();
    }
  }

  private cargarPermisos(): void {
    this.loading = true;
    let todosLosPermisos: Permiso[] = [];

    const obtenerPagina = (url: string) => {
      const isAbsoluteUrl = /^https?:\/\//i.test(url);
      const request$ = isAbsoluteUrl
        ? this.http.get<ApiResponse<Permiso>>(url)
        : this.apiService.get<ApiResponse<Permiso>>(url);

      request$.subscribe({
        next: (data) => {
          todosLosPermisos = [...todosLosPermisos, ...data.results];

          if (data.next) {
            obtenerPagina(data.next); // sigue con la siguiente página
          } else {
            this.permisosDisponibles = todosLosPermisos.filter(
              permiso => !this.permisosSeleccionados.some(sel => sel.id === permiso.id)
            );
            this.actualizarListasPermisos();
            this.loading = false;
          }
        },
        error: (err) => {
          console.error('Error al cargar permisos:', err);
          this.loading = false;
        }
      });
    };

    obtenerPagina('api/roles/permisos'); // primera página
  }



  private cargarRolById(): void {
    if (!this.rolId) return;

    this.loading = true;
    this.apiService.get<Rol>(`api/roles/roles/${this.rolId}`).subscribe({
      next: (rol) => {
        this.initializeForm(rol);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar rol:', err);
        this.loading = false;
      }
    });
  }

  private actualizarListasPermisos(): void {
    // Filtrar disponibles
    this.permisosDisponiblesFiltrados = this.permisosDisponibles.filter(permiso =>
      permiso.codename.toLowerCase().includes(this.filtroDisponibles.toLowerCase()) ||
      (permiso.descripcion && permiso.descripcion.toLowerCase().includes(this.filtroDisponibles.toLowerCase()))
    );

    // Filtrar seleccionados
    this.permisosSeleccionadosFiltrados = this.permisosSeleccionados.filter(permiso =>
      permiso.codename.toLowerCase().includes(this.filtroSeleccionados.toLowerCase()) ||
      (permiso.descripcion && permiso.descripcion.toLowerCase().includes(this.filtroSeleccionados.toLowerCase()))
    );
  }

  // Filtros
  onFiltroDisponiblesChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.filtroDisponibles = target.value;
    this.actualizarListasPermisos();
  }

  onFiltroSeleccionadosChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.filtroSeleccionados = target.value;
    this.actualizarListasPermisos();
  }

  // Selección múltiple
  toggleAvailableSelection(permisoId: number, event: Event): void {
    event.stopPropagation();
    const index = this.selectedAvailable.indexOf(permisoId);
    if (index > -1) {
      this.selectedAvailable.splice(index, 1);
    } else {
      this.selectedAvailable.push(permisoId);
    }
  }

  toggleChosenSelection(permisoId: number, event: Event): void {
    event.stopPropagation();
    const index = this.selectedChosen.indexOf(permisoId);
    if (index > -1) {
      this.selectedChosen.splice(index, 1);
    } else {
      this.selectedChosen.push(permisoId);
    }
  }

  isAvailableSelected(permisoId: number): boolean {
    return this.selectedAvailable.includes(permisoId);
  }

  isChosenSelected(permisoId: number): boolean {
    return this.selectedChosen.includes(permisoId);
  }

  // Mover permisos
  moverPermisosASeleccionados(): void {
    const permisosAMover = this.permisosDisponibles.filter(
      permiso => this.selectedAvailable.includes(permiso.id)
    );

    // Agregar a seleccionados
    this.permisosSeleccionados.push(...permisosAMover);

    // Remover de disponibles
    this.permisosDisponibles = this.permisosDisponibles.filter(
      permiso => !this.selectedAvailable.includes(permiso.id)
    );

    // Limpiar selección y actualizar filtros
    this.selectedAvailable = [];
    this.actualizarListasPermisos();
  }

  moverPermisosADisponibles(): void {
    const permisosAMover = this.permisosSeleccionados.filter(
      permiso => this.selectedChosen.includes(permiso.id)
    );

    // Agregar a disponibles
    this.permisosDisponibles.push(...permisosAMover);

    // Remover de seleccionados
    this.permisosSeleccionados = this.permisosSeleccionados.filter(
      permiso => !this.selectedChosen.includes(permiso.id)
    );

    // Limpiar selección y actualizar filtros
    this.selectedChosen = [];
    this.actualizarListasPermisos();
  }

  // Mover todos
  moverTodosASeleccionados(): void {
    this.permisosSeleccionados.push(...this.permisosDisponiblesFiltrados);
    this.permisosDisponibles = this.permisosDisponibles.filter(
      permiso => !this.permisosDisponiblesFiltrados.some(filtrado => filtrado.id === permiso.id)
    );
    this.selectedAvailable = [];
    this.actualizarListasPermisos();
  }

  moverTodosADisponibles(): void {
    this.permisosDisponibles.push(...this.permisosSeleccionadosFiltrados);
    this.permisosSeleccionados = this.permisosSeleccionados.filter(
      permiso => !this.permisosSeleccionadosFiltrados.some(filtrado => filtrado.id === permiso.id)
    );
    this.selectedChosen = [];
    this.actualizarListasPermisos();
  }

  // Formulario
  onSubmit(): void {
    if (this.rolForm.valid && !this.submitting) {
      this.submitting = true;

      const rolData: Partial<any> = {
        nombre: this.rolForm.get('nombre')?.value,
        permisos: this.permisosSeleccionados.map(p => p.id) 
      };

      const request = this.isEditMode && this.rolId
        ? this.apiService.put<Rol>(`api/roles/roles`, this.rolId, rolData)
        : this.apiService.post<Rol>('api/roles/roles', rolData);

      request.subscribe({
        next: (response) => {
          console.log('Rol guardado exitosamente:', response);
          this.formSubmit.emit(response);
          this.submitting = false;

          // Redirigir o mostrar mensaje de éxito
          this.router.navigate(['/roles']);
        },
        error: (err) => {
          console.error('Error al guardar rol:', err);
          this.submitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.formCancel.emit();
    this.router.navigate(['/roles']);
  }

  // Helpers
  get formTitle(): string {
    return this.isEditMode ? 'Editar Rol' : 'Crear Nuevo Rol';
  }

  get submitButtonText(): string {
    return this.submitting
      ? (this.isEditMode ? 'Actualizando...' : 'Creando...')
      : (this.isEditMode ? 'Actualizar Rol' : 'Crear Rol');
  }

  get canMoveToChosen(): boolean {
    return this.selectedAvailable.length > 0;
  }

  get canMoveToAvailable(): boolean {
    return this.selectedChosen.length > 0;
  }

  get canMoveAllToChosen(): boolean {
    return this.permisosDisponiblesFiltrados.length > 0;
  }

  get canMoveAllToAvailable(): boolean {
    return this.permisosSeleccionadosFiltrados.length > 0;
  }
}