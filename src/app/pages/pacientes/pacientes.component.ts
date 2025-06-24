import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
import { ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Paciente[];
}

interface FiltrosBusqueda {
  nombre?: string;
  apellido?: string;
  ci?: string;
  sexo?: string;
  asegurado?: boolean;
  fecha_nacimiento_after?: string;
  fecha_nacimiento_before?: string;
}

@Component({
  standalone: true,
  selector: 'app-pacientes',
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
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.scss']
})
export class PacientesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  pacientes = new MatTableDataSource<Paciente>();
  pacientesColumns: string[] = ['nombre', 'telefono', 'email', 'estado', 'acciones'];

  totalItems = 0;
  pageSize = 10;
  currentPage = 0;
  loading: boolean = false;

  // Formulario de filtros
  filtrosForm: FormGroup;
  mostrarFiltrosAvanzados = false;

  // Opciones para los selects
  opcionesSexo = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' }
  ];

  opcionesAsegurado = [
    { value: true, label: 'Asegurado' },
    { value: false, label: 'No Asegurado' }
  ];

  // Filtros activos para mostrar chips
  filtrosActivos: Array<{ key: string, value: any, label: string }> = [];

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filtrosForm = this.fb.group({
      busquedaGeneral: [''],
      nombre: [''],
      apellido: [''],
      ci: [''],
      sexo: [''],
      asegurado: [''],
      fechaDesde: [''],
      fechaHasta: ['']
    });
  }

  ngOnInit(): void {
    this.configurarFiltros();
    this.obtenerPacientes();
  }

  private configurarFiltros(): void {
    // Configurar búsqueda general con debounce
    this.filtrosForm.get('busquedaGeneral')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.aplicarFiltros();
      });

    // Configurar filtros específicos
    ['nombre', 'apellido', 'ci', 'sexo', 'asegurado', 'fechaDesde', 'fechaHasta'].forEach(campo => {
      this.filtrosForm.get(campo)?.valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe(() => {
          this.aplicarFiltros();
        });
    });
  }

  obtenerPacientes(): void {
    this.loading = true;

    const filtros = this.construirParametrosFiltros();

    // Debug: ver qué parámetros se están enviando
    console.log('Parámetros enviados al backend:', filtros);
    const variable = localStorage.getItem('token');
    this.apiService.get<ApiResponse>('api/pacientes/', filtros).subscribe({
        next: (data) => {
          this.pacientes.data = data.results || [];
          this.totalItems = data.count || 0;
          this.loading = false;
          console.log('Pacientes obtenidos:', data);
        },
        error: (err) => {
          console.error('Error al obtener pacientes', err);
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

    // Búsqueda general - aplicar a múltiples campos
    if (valores.busquedaGeneral?.trim()) {
      filtros.search = valores.busquedaGeneral.trim();
    } else {
      // Solo aplicar filtros específicos si no hay búsqueda general

      if (valores.nombre?.trim()) {
        filtros.nombre = valores.nombre.trim();
      }

      if (valores.apellido?.trim()) {
        filtros.apellido = valores.apellido.trim();
      }

      if (valores.ci?.trim()) {
        filtros.ci = valores.ci.trim();
      }
    }

    // Filtros que siempre se aplican
    if (valores.sexo) {
      filtros.sexo = valores.sexo;
    }

    if (valores.asegurado !== '' && valores.asegurado !== null && valores.asegurado !== undefined) {
      filtros.asegurado = valores.asegurado;
    }

    // Filtros de fecha - nombres correctos para DateFromToRangeFilter
    if (valores.fechaDesde) {
      filtros.fecha_nacimiento_after = this.formatearFecha(valores.fechaDesde);
    }

    if (valores.fechaHasta) {
      filtros.fecha_nacimiento_before = this.formatearFecha(valores.fechaHasta);
    }

    return filtros;
  }

  private formatearFecha(fecha: Date): string {
    // Asegurar formato YYYY-MM-DD
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  aplicarFiltros(): void {
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.actualizarFiltrosActivos();
    this.obtenerPacientes();
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

    if (valores.ci?.trim()) {
      this.filtrosActivos.push({
        key: 'ci',
        value: valores.ci,
        label: `CI: ${valores.ci}`
      });
    }

    if (valores.sexo) {
      const sexoLabel = this.opcionesSexo.find(op => op.value === valores.sexo)?.label;
      this.filtrosActivos.push({
        key: 'sexo',
        value: valores.sexo,
        label: `Sexo: ${sexoLabel}`
      });
    }

    if (valores.asegurado !== '' && valores.asegurado !== null && valores.asegurado !== undefined) {
      const aseguradoLabel = this.opcionesAsegurado.find(op => op.value === valores.asegurado)?.label;
      this.filtrosActivos.push({
        key: 'asegurado',
        value: valores.asegurado,
        label: `Estado: ${aseguradoLabel}`
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
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.paginator.page.subscribe((event: PageEvent) => {
        this.currentPage = event.pageIndex;
        this.pageSize = event.pageSize;
        this.obtenerPacientes();
      });
    }
  }

  verPaciente(paciente: Paciente): void {
    this.router.navigate(['/pacientes', paciente.id, 'details']);
  }

  editarPaciente(paciente: Paciente): void {
    this.router.navigate(['/pacientes', paciente.id, 'editar']);
  }
}