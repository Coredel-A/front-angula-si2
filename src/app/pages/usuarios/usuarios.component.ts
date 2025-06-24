import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ApiService } from 'src/app/services/api.service';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
  fecha_nacimiento: Date | null;
  fecha_registro: Date;
  especialidad: Especialidad | null;
  establecimiento: Establecimiento | null;
  rol: Rol | null;
  permisos: string[];
  is_active: boolean;
  is_staff: boolean;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Usuario[];
}

// Interfaces para opciones de filtros
interface OpcionFiltro {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-usuarios',
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
    RouterModule,
    ReactiveFormsModule,
  ],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  usuarios = new MatTableDataSource<Usuario>();
  usuariosColumns: string[] = ['nombre', 'email', 'rol', 'especialidad', 'establecimiento', 'estado', 'acciones'];

  totalItems = 0;
  pageSize = 10;
  currentPage = 0;
  loading: boolean = false;

  filtrosForm: FormGroup;
  mostrarFiltrosAvanzados = false;
  filtrosActivos: Array<{ key: string, value: any, label: string}> = [];

  // Opciones para los selectores
  rolesDisponibles: OpcionFiltro[] = [];
  especialidadesDisponibles: OpcionFiltro[] = [];
  establecimientosDisponibles: OpcionFiltro[] = [];

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.filtrosForm = this.fb.group({
      busquedaGeneral: [''],
      nombre: [''],
      apellido: [''],
      email: [''],
      rol: [''],
      especialidad: [''],
      establecimiento: [''],
      fechaDesde: [''],
      fechaHasta: [''],
      is_active: ['']
    });
  }

  ngOnInit(): void {
    this.cargarOpcionesFiltros();
    this.configurarFiltros();
    this.obtenerUsuarios();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.paginator.page.subscribe((event: PageEvent) => {
        this.currentPage = event.pageIndex;
        this.pageSize = event.pageSize;
        this.obtenerUsuarios();
      });
    }
  }

  private cargarOpcionesFiltros(): void {
    // Cargar roles
    this.apiService.get<any>('api/roles/roles').subscribe({
      next: (data) => {
        this.rolesDisponibles = data.results || data;
      },
      error: (err) => console.error('Error al cargar roles:', err)
    });

    // Cargar especialidades
    this.apiService.get<any>('api/especialidades/').subscribe({
      next: (data) => {
        this.especialidadesDisponibles = data.results || data;
      },
      error: (err) => console.error('Error al cargar especialidades:', err)
    });

    // Cargar establecimientos
    this.apiService.get<any>('api/sucursales/establecimientos/').subscribe({
      next: (data) => {
        this.establecimientosDisponibles = data.results || data;
      },
      error: (err) => console.error('Error al cargar establecimientos:', err)
    });
  }

  private configurarFiltros(): void {
    this.filtrosForm.get('busquedaGeneral')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.aplicarFiltros();
    });

    ['nombre', 'apellido', 'email', 'rol', 'especialidad', 'establecimiento', 'fechaDesde', 'fechaHasta', 'is_active'].forEach(campo => {
      this.filtrosForm.get(campo)?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(() => {
        this.aplicarFiltros();
      });
    });
  }

  aplicarFiltros(): void {
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.actualizarFiltrosActivos();
    this.obtenerUsuarios();
  }

  private actualizarFiltrosActivos(): void {
    const valores = this.filtrosForm.value;
    this.filtrosActivos = [];

    if (valores.busquedaGeneral?.trim()) {
      this.filtrosActivos.push({
        key: 'busquedaGeneral',
        value: valores.busquedaGeneral,
        label: `Búsqueda: "${valores.busquedaGeneral}"`
      });
    }

    if (valores.nombre?.trim()) {
      this.filtrosActivos.push({
        key: 'nombre',
        value: valores.nombre,
        label: `Nombre: ${valores.nombre}`
      });
    }

    if (valores.apellido?.trim()) {
      this.filtrosActivos.push({
        key: 'apellido',
        value: valores.apellido,
        label: `Apellido: ${valores.apellido}`
      });
    }

    if (valores.email?.trim()) {
      this.filtrosActivos.push({
        key: 'email',
        value: valores.email,
        label: `Email: ${valores.email}`
      });
    }

    if (valores.rol) {
      const rolNombre = this.rolesDisponibles.find(r => r.id == valores.rol)?.nombre || valores.rol;
      this.filtrosActivos.push({
        key: 'rol',
        value: valores.rol,
        label: `Rol: ${rolNombre}`
      });
    }

    if (valores.especialidad) {
      const especialidadNombre = this.especialidadesDisponibles.find(e => e.id == valores.especialidad)?.nombre || valores.especialidad;
      this.filtrosActivos.push({
        key: 'especialidad',
        value: valores.especialidad,
        label: `Especialidad: ${especialidadNombre}`
      });
    }

    if (valores.establecimiento) {
      const establecimientoNombre = this.establecimientosDisponibles.find(e => e.id == valores.establecimiento)?.nombre || valores.establecimiento;
      this.filtrosActivos.push({
        key: 'establecimiento',
        value: valores.establecimiento,
        label: `Establecimiento: ${establecimientoNombre}`
      });
    }

    if (valores.is_active !== '') {
      this.filtrosActivos.push({
        key: 'is_active',
        value: valores.is_active,
        label: `Estado: ${valores.is_active === 'true' ? 'Activo' : 'Inactivo'}`
      });
    }

    if (valores.fechaDesde || valores.fechaHasta) {
      let rangoLabel = 'Fecha nacimiento: ';
      if (valores.fechaDesde && valores.fechaHasta) {
        rangoLabel += `${this.formatearFecha(valores.fechaDesde)} a ${this.formatearFecha(valores.fechaHasta)}`;
      } else if (valores.fechaDesde) {
        rangoLabel += `desde ${this.formatearFecha(valores.fechaDesde)}`;
      } else {
        rangoLabel += `hasta ${this.formatearFecha(valores.fechaHasta)}`;
      }

      this.filtrosActivos.push({
        key: 'fechaNacimiento',
        value: { desde: valores.fechaDesde, hasta: valores.fechaHasta },
        label: rangoLabel
      });
    }
  }

  eliminarFiltro(filtro: any): void {
    if (filtro.key === 'fechaNacimiento') {
      this.filtrosForm.patchValue({
        fechaDesde: '',
        fechaHasta: ''
      });
    } else {
      this.filtrosForm.patchValue({
        [filtro.key]: ''
      });
    }
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.filtrosActivos = [];
    this.aplicarFiltros();
  }

  toggleFiltrosAvanzados(): void {
    this.mostrarFiltrosAvanzados = !this.mostrarFiltrosAvanzados;
    setTimeout(() => this.cdr.detectChanges(), 0);
  }

  obtenerUsuarios(): void {
    this.loading = true;
    const filtros = this.construirParametrosFiltros();

    this.apiService.get<ApiResponse>('api/usuarios/', filtros).subscribe({
      next: (data) => {
        this.usuarios.data = data.results || [];
        this.totalItems = data.count || 0;
        this.loading = false;
        console.log('Usuarios obtenidos:', data);
      },
      error: (err) => {
        console.error('Error al obtener usuarios:', err);
        this.loading = false;
      }
    });
  }

  private construirParametrosFiltros(): any {
    const valores = this.filtrosForm.value;
    const filtros: any = {
      page: this.currentPage + 1,
      page_size: this.pageSize,
    };

    if (valores.busquedaGeneral?.trim()) {
      filtros.search = valores.busquedaGeneral.trim();
    } else {
      if (valores.nombre?.trim()) {
        filtros.nombre = valores.nombre.trim();
      }
      if (valores.apellido?.trim()) {
        filtros.apellido = valores.apellido.trim();
      }
      if (valores.email?.trim()) {
        filtros.email = valores.email.trim();
      }
    }
    
    if (valores.rol) {
      filtros.rol = valores.rol;
    }
    if (valores.especialidad) {
      filtros.especialidad = valores.especialidad;
    }
    if (valores.establecimiento) {
      filtros.establecimiento = valores.establecimiento;
    }
    if (valores.is_active !== '') {
      filtros.is_active = valores.is_active;
    }
    if (valores.fechaDesde) {
      filtros.fecha_nacimiento_after = this.formatearFecha(valores.fechaDesde);
    }
    if (valores.fechaHasta) {
      filtros.fecha_nacimiento_before = this.formatearFecha(valores.fechaHasta);
    }
    return filtros;
  }

  private formatearFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  verUsuario(usuario: Usuario): void {
    this.router.navigate(['/usuarios', usuario.id,'details']);
  }

  editarUsuario(usuario: Usuario): void {
    this.router.navigate(['/usuarios', usuario.id, 'editar']);
  }

  toggleEstadoUsuario(usuario: Usuario): void {
    const nuevoEstado = !usuario.is_active;
    this.apiService.patch(`api/usuarios/`,usuario.id,'', { is_active: nuevoEstado }).subscribe({
      next: () => {
        usuario.is_active = nuevoEstado;
        console.log(`Usuario ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`);
      },
      error: (err) => {
        console.error('Error al cambiar estado del usuario:', err);
      }
    });
  }
}