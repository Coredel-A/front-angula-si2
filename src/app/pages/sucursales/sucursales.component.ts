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
import { ApiService } from 'src/app/services/api.service';
import { ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';

interface Sucursal {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  correo: string;
  tipo_establecimiento: string;
  tipo_establecimiento_display: string;
  nivel: string;
  nivel_display: string;
  especialidades: any[];
}

interface ApiResponse {
  count: number;
  next: String | null;
  previous: string | null;
  results: Sucursal[];
}

@Component({
  selector: 'app-sucursales',
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
    RouterModule,
  ],
  templateUrl: './sucursales.component.html',
  styleUrl: './sucursales.component.scss'
})
export class SucursalesComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  sucursales = new MatTableDataSource<Sucursal>([]);
  sucursalesColumns: string[] = ['nombre', 'telefono', 'correo', 'tipo_establecimiento_display', 'nivel_display', 'acciones']

  totalItems = 0;
  pageSize = 10;
  currentPage = 0;

  filtroActivo: string = 'todos';
  searchTerm: string = '';
  tiposDisponibles: string[] = [];
  nivelesDisponibles: string[] = [];
  especialidadesDisponibles: any[] = [];

  loading = false;

  private filtrosActivos: any = {};

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.obtenerSucursales();
    this.configurarFiltroPersonalizado();
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.paginator.page.subscribe((event: PageEvent) => {
        this.currentPage = event.pageIndex;
        this.pageSize = event.pageSize;
        this.obtenerSucursales();
      });
    }
  }

  obtenerSucursales(filtrosAdicionales: any = {}) {
    this.loading = true;

    const filtros = {
      ...this.filtrosActivos,
      ...filtrosAdicionales,
      page: this.currentPage + 1,
      page_size: this.pageSize
    };

    if (this.searchTerm.trim()) {
      filtros.nombre = this.searchTerm.trim();
    }

    this.apiService.get<any>('api/sucursales/establecimientos/', filtros).subscribe({
      next: (data) => {
        this.sucursales.data = data.results || [];
        this.totalItems = data.count || 0;

        console.log('Sucursales filtradas:', data);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener sucursales', err);
        this.loading = false;
      }
    });
  }

  cargarFiltrosDisponibles() {
    this.apiService.get<any[]>('api/sucursales/establecimientos/tipos-disponibles/').subscribe({
      next: (tipos) => {
        this.tiposDisponibles = tipos || [];
      },
      error: (err) => console.error('Error al cargar tipos', err)
    });

    this.apiService.get<any[]>('api/sucursales/establecimientos/niveles-disponibles').subscribe({
      next: (niveles) => {
        this.nivelesDisponibles = niveles || [];
      },
      error: (err) => console.error('Error al cargar niveles', err)
    });

    this.apiService.get<any[]>('api/especialidades/').subscribe({
      next: (especialidades) => {
        this.especialidadesDisponibles = especialidades || [];
      },
      error: (err) => console.error('Error al cargar especialidades', err)
    });
  }

  configurarFiltroPersonalizado() {
    this.sucursales.filterPredicate = (data: Sucursal, filter: string) => {
      const str = (val: any) => val?.toString().toLowerCase() || '';
      const searchContent = `
        ${str(data.nombre)}
        ${str(data.telefono)}
        ${str(data.correo)}
        ${str(data.tipo_establecimiento_display)}
        ${str(data.nivel_display)}
      `;
      return searchContent.includes(filter);
    }
  }

  extraerFiltrisDisponibles(data: Sucursal[]) {
    this.tiposDisponibles = [...new Set(data.map(s => s.tipo_establecimiento_display.trim()))];

    this.nivelesDisponibles = [...new Set(data.map(s => s.nivel_display))];
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchTerm = filterValue;

    // Reset a la primera página cuando se busca
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }

    // Hacer la búsqueda después de una pequeña pausa para evitar demasiadas peticiones
    setTimeout(() => {
      this.obtenerSucursales();
    }, 300);
  }
  // Métodos para filtros por botones
  filtrarPorTipo(tipo: string) {
    this.filtroActivo = tipo;
    this.currentPage = 0;

    if (tipo === 'todos') {
      delete this.filtrosActivos.tipo_establecimiento;
    } else {
      this.filtrosActivos.tipo_establecimiento = tipo;
    }

    if (this.paginator) {
      this.paginator.firstPage();
    }

    this.obtenerSucursales();
  }

  filtrarPorNivel(nivel: string) {
    this.filtroActivo = nivel;
    this.currentPage = 0;

    if (nivel === 'todos') {
      delete this.filtrosActivos.nivel;
    } else {
      this.filtrosActivos.nivel = this.obtenerClaveNivel(nivel);
    }

    if (this.paginator) {
      this.paginator.firstPage();
    }

    this.obtenerSucursales();
  }

  // Método para convertir nivel_display a nivel (clave)
  obtenerClaveNivel(nivelDisplay: string): string {
    const niveles: Record<string, string> = {
      'Primer Nivel': 'nivel_1',
      'Segundo Nivel': 'nivel_2',
      'Tercer Nivel': 'nivel_3'
    };
    return niveles[nivelDisplay] || nivelDisplay.toLowerCase().replace(' ', '_');
  }

  filtrarConEspecialidades() {
    this.filtroActivo = 'con-especialidades';
    this.currentPage = 0;

    // Usar el filtro del backend para establecimientos con especialidades
    this.filtrosActivos.tiene_especialidades = 'true';

    if (this.paginator) {
      this.paginator.firstPage();
    }

    this.obtenerSucursales();
  }

  filtrarSinEspecialidades() {
    this.filtroActivo = 'sin-especialidades';
    this.currentPage = 0;

    // Usar el filtro del backend para establecimientos sin especialidades
    this.filtrosActivos.tiene_especialidades = 'false';

    if (this.paginator) {
      this.paginator.firstPage();
    }

    this.obtenerSucursales();
  }

  filtrarPorEspecialidades(especialidadIds: number[]) {
    this.filtroActivo = 'especialidades-seleccionadas';
    this.currentPage = 0;

    if (especialidadIds.length > 0) {
      this.filtrosActivos.especialidades = especialidadIds.join(',');
    } else {
      delete this.filtrosActivos.especialidades;
    }

    if (this.paginator) {
      this.paginator.firstPage();
    }

    this.obtenerSucursales();
  }

  limpiarFiltros() {
    this.filtroActivo = 'todos';
    this.searchTerm = '';
    this.filtrosActivos = {};
    this.currentPage = 0;

    // Limpiar el input de búsqueda
    const searchInput = document.querySelector('input[matInput]') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }

    if (this.paginator) {
      this.paginator.firstPage();
    }

    this.obtenerSucursales();
  }

  // Métodos para las acciones de la tabla
  editarSucursal(sucursal: Sucursal) {
    console.log('Editar sucursal:', sucursal);
    // Implementar lógica de edición
  }

  eliminarSucursal(sucursal: Sucursal) {
    console.log('Eliminar sucursal:', sucursal);
    // Implementar lógica de eliminación
  }

  verDetalles(sucursal: any): void {
    this.router.navigate(['/sucursales', sucursal.id, 'details']); // Esto redirige a /sucursales/123
  }

}
