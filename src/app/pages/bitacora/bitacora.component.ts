import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
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
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ApiService } from 'src/app/services/api.service';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { BitacoraDetailsComponent } from './bitacora-details/bitacora-details.component';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.vfs;

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

interface Bitacora {
  id: string;
  usuario: Usuario;
  accion: string;
  timestamp: Date;
  ip: string;
}

interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface ExportOptions {
  usuario: boolean;
  accion: boolean;
  timestamp: boolean;
  ip: boolean;
  establecimiento: boolean;
  rol: boolean;
}

interface PDFConfig {
  titulo: string;
  incluirFiltros: boolean;
  incluirResumen: boolean;
  incluirLogo: boolean;
  orientacion: 'portrait' | 'landscape';
  tamanoFuente: number;
  columnas: ExportOptions;
  maxRegistros: number;
  incluirPieDeReporte: boolean;
}

@Component({
  selector: 'app-bitacora',
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
    MatDividerModule,
    MatToolbarModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatSlideToggleModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './bitacora.component.html',
  styleUrl: './bitacora.component.scss'
})
export class BitacoraComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  bitacora = new MatTableDataSource<Bitacora>();
  bitacoraColumns: string[] = ['usuario', 'accion', 'timestamp', 'ip', 'acciones'];

  totalItems = 0;
  pageSize = 10;
  currentPage = 0;

  loading: boolean = false;
  showFilters: boolean = false;
  showPDFConfig: boolean = false;
  generandoPDF: boolean = false;

  // Formulario de filtros
  filterForm: FormGroup;

  // Opciones para filtros
  usuarios: Usuario[] = [];
  acciones: string[] = [];
  ips: string[] = [];

  // Configuración mejorada del PDF
  pdfConfig: PDFConfig = {
    titulo: 'Informe de Bitácora del Sistema',
    incluirFiltros: true,
    incluirResumen: true,
    incluirLogo: false,
    orientacion: 'portrait',
    tamanoFuente: 10,
    columnas: {
      usuario: true,
      accion: true,
      timestamp: true,
      ip: true,
      establecimiento: false,
      rol: false
    },
    maxRegistros: 1000,
    incluirPieDeReporte: true
  };

  // Opciones de tamaño de página disponibles
  pageSizeOptions = [5, 10, 20, 50, 100];

  // Subscripciones
  private subscriptions: Subscription = new Subscription();

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      usuario: [''],
      ip: [''],
      fecha_inicio: [''],
      fecha_fin: [''],
      ordering: ['-timestamp']
    });
  }

  ngOnInit(): void {
    this.cargarBitacora();
    this.cargarOpcionesFiltros();
    this.setupSearchDebounce();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      // Suscribirse al evento de cambio de página
      this.paginator.page.subscribe((event) => {
        this.currentPage = event.pageIndex;
        this.pageSize = event.pageSize;
        this.cargarBitacora();
      });
    }
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private setupSearchDebounce(): void {
    const searchSub = this.filterForm.get('search')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.resetPagination();
        this.cargarBitacora();
      });

    if (searchSub) {
      this.subscriptions.add(searchSub);
    }
  }

  private resetPagination(): void {
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
  }


  private cargarBitacora(): void {
    this.loading = true;
    const formValues = this.filterForm.value;

    const params: any = {
      page: this.currentPage + 1,
      page_size: this.pageSize
    };

    // Agregar parámetros de búsqueda y filtros
    if (formValues.search?.trim()) {
      params.search = formValues.search.trim();
    }

    if (formValues.usuario) {
      params.usuario = formValues.usuario;
    }

    if (formValues.ip) {
      params.ip = formValues.ip;
    }

    if (formValues.fecha_inicio) {
      params.timestamp__gte = this.formatDateForApi(formValues.fecha_inicio);
    }

    if (formValues.fecha_fin) {
      params.timestamp__lte = this.formatDateForApi(formValues.fecha_fin);
    }

    if (formValues.ordering) {
      params.ordering = formValues.ordering;
    }

    // Verificar si los parámetros están correctamente configurados
    console.log('Parámetros enviados para paginación:', params);

    const apiSub = this.apiService.get<ApiResponse<Bitacora>>('api/bitacora', params).subscribe({
      next: (data) => {
        console.log('Respuesta de la API:', data);

        // Actualizar los datos
        this.bitacora.data = data.results || [];
        this.totalItems = data.count || 0;

        // Configurar el paginador correctamente
        if (this.paginator) {
          this.paginator.length = this.totalItems;
          this.paginator.pageSize = this.pageSize;
          this.paginator.pageIndex = this.currentPage;

          // Forzar actualización del paginador
          //this.paginator._changePageSize(this.pageSize);
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar la Bitácora:', err);
        this.loading = false;
        this.mostrarError('Error al cargar los datos de la bitácora');

        // Reiniciar datos en caso de error
        this.bitacora.data = [];
        this.totalItems = 0;

        this.cdr.detectChanges();
      }
    });

    this.subscriptions.add(apiSub);
  }

  private cargarOpcionesFiltros(): void {
    // Cargar usuarios únicos
    const usuariosSub = this.apiService.get<ApiResponse<Usuario>>('api/usuarios', { page_size: 200 }).subscribe({
      next: (data) => {
        this.usuarios = data.results || [];
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
      }
    });

    // Cargar opciones de IP y acciones desde la bitácora
    const opcionesSub = this.apiService.get<ApiResponse<Bitacora>>('api/bitacora', {
      page_size: 500,
      distinct: 'ip,accion'
    }).subscribe({
      next: (data) => {
        const results = data.results || [];

        // Extraer IPs únicas y filtrar valores válidos
        this.ips = [...new Set(results
          .map(b => b.ip)
          .filter(ip => ip && ip.trim() !== '')
        )].sort();

        // Extraer acciones únicas y filtrar valores válidos
        this.acciones = [...new Set(results
          .map(b => b.accion)
          .filter(accion => accion && accion.trim() !== '')
        )].sort();
      },
      error: (err) => {
        console.error('Error al cargar opciones de filtros:', err);
      }
    });

    this.subscriptions.add(usuariosSub);
    this.subscriptions.add(opcionesSub);
  }

  private formatDateForApi(date: Date): string {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  }

  onFilterChange(): void {
    this.resetPagination();
    this.cargarBitacora();
  }

  limpiarFiltros(): void {
    this.filterForm.reset({
      search: '',
      usuario: '',
      ip: '',
      fecha_inicio: '',
      fecha_fin: '',
      ordering: '-timestamp'
    });
    this.resetPagination();
    this.cargarBitacora();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  togglePDFConfig(): void {
    this.showPDFConfig = !this.showPDFConfig;
  }

  abrirDetalles(id: string): void {
    this.dialog.open(BitacoraDetailsComponent, {
      width: '600px',
      data: { id },
    });
  }

  private async obtenerDatosParaPDF(): Promise<Bitacora[]> {
    const formValues = this.filterForm.value;
    const params: any = {
      page_size: Math.min(this.pdfConfig.maxRegistros, this.totalItems || 1000)
    };

    // Aplicar los mismos filtros actuales
    if (formValues.search?.trim()) params.search = formValues.search.trim();
    if (formValues.usuario) params.usuario = formValues.usuario;
    if (formValues.ip) params.ip = formValues.ip;
    if (formValues.fecha_inicio) params.timestamp__gte = this.formatDateForApi(formValues.fecha_inicio);
    if (formValues.fecha_fin) params.timestamp__lte = this.formatDateForApi(formValues.fecha_fin);
    if (formValues.ordering) params.ordering = formValues.ordering;

    return new Promise((resolve, reject) => {
      this.apiService.get<ApiResponse<Bitacora>>('api/bitacora', params).subscribe({
        next: (data) => resolve(data.results || []),
        error: (err) => reject(err)
      });
    });
  }

  private obtenerFiltrosAplicados(): { [key: string]: any } {
    const formValues = this.filterForm.value;
    const filtros: { [key: string]: any } = {};

    if (formValues.search?.trim()) {
      filtros['Búsqueda'] = formValues.search.trim();
    }

    if (formValues.usuario) {
      const usuario = this.usuarios.find(u => u.id === formValues.usuario);
      filtros['Usuario'] = usuario ? `${usuario.nombre} ${usuario.apellido}` : formValues.usuario;
    }

    if (formValues.ip) {
      filtros['Dirección IP'] = formValues.ip;
    }

    if (formValues.fecha_inicio) {
      filtros['Fecha desde'] = new Date(formValues.fecha_inicio).toLocaleDateString();
    }

    if (formValues.fecha_fin) {
      filtros['Fecha hasta'] = new Date(formValues.fecha_fin).toLocaleDateString();
    }

    const ordenamiento = formValues.ordering;
    if (ordenamiento) {
      const ordenamientos: { [key: string]: string } = {
        '-timestamp': 'Fecha (más reciente primero)',
        'timestamp': 'Fecha (más antiguo primero)',
        'usuario__nombre': 'Usuario (A-Z)',
        '-usuario__nombre': 'Usuario (Z-A)'
      };
      filtros['Ordenamiento'] = ordenamientos[ordenamiento] || ordenamiento;
    }

    return filtros;
  }

  private generarResumenDatos(bitacora: Bitacora[]): any[] {
    const totalRegistros = bitacora.length;
    const usuariosUnicos = new Set(bitacora.map(b => b.usuario?.id)).size;
    const accionesUnicas = new Set(bitacora.map(b => b.accion)).size;
    const ipsUnicas = new Set(bitacora.map(b => b.ip)).size;

    const fechaInicio = bitacora.length > 0 ?
      new Date(Math.min(...bitacora.map(b => new Date(b.timestamp).getTime()))) : null;
    const fechaFin = bitacora.length > 0 ?
      new Date(Math.max(...bitacora.map(b => new Date(b.timestamp).getTime()))) : null;

    return [
      { text: 'Resumen de Datos', style: 'sectionHeader' },
      {
        table: {
          headerRows: 0,
          widths: ['*', '*'],
          body: [
            ['Total de registros:', totalRegistros.toString()],
            ['Usuarios únicos:', usuariosUnicos.toString()],
            ['Acciones diferentes:', accionesUnicas.toString()],
            ['Direcciones IP únicas:', ipsUnicas.toString()],
            ['Período de datos:', fechaInicio && fechaFin ?
              `${fechaInicio.toLocaleDateString()} - ${fechaFin.toLocaleDateString()}` : 'N/A']
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 5, 0, 15]
      }
    ];
  }

  exportarBitacoraPDF(): void {
    if (this.generandoPDF) return;

    this.generandoPDF = true;
    this.mostrarExito('Generando PDF...');

    this.obtenerDatosParaPDF().then((bitacora: Bitacora[]) => {
      try {
        // Construir encabezados y filas dinámicamente
        const headers: string[] = [];
        const widths: (string | number)[] = [];

        if (this.pdfConfig.columnas.usuario) {
          headers.push('Usuario');
          widths.push('*');
        }
        if (this.pdfConfig.columnas.accion) {
          headers.push('Acción');
          widths.push('*');
        }
        if (this.pdfConfig.columnas.timestamp) {
          headers.push('Fecha/Hora');
          widths.push(120);
        }
        if (this.pdfConfig.columnas.ip) {
          headers.push('IP');
          widths.push(100);
        }
        if (this.pdfConfig.columnas.establecimiento) {
          headers.push('Establecimiento');
          widths.push('*');
        }
        if (this.pdfConfig.columnas.rol) {
          headers.push('Rol');
          widths.push(80);
        }

        const body: any[][] = [
          headers.map(h => ({ text: h, style: 'tableHeader' })),
          ...bitacora.map(item => {
            const row: any[] = [];

            if (this.pdfConfig.columnas.usuario) {
              row.push(`${item.usuario?.nombre ?? ''} ${item.usuario?.apellido ?? ''}`.trim() || 'N/A');
            }
            if (this.pdfConfig.columnas.accion) {
              row.push(item.accion || 'N/A');
            }
            if (this.pdfConfig.columnas.timestamp) {
              const fecha = new Date(item.timestamp);
              row.push(`${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}`);
            }
            if (this.pdfConfig.columnas.ip) {
              row.push(item.ip || 'N/A');
            }
            if (this.pdfConfig.columnas.establecimiento) {
              row.push(item.usuario?.establecimiento?.nombre || 'N/A');
            }
            if (this.pdfConfig.columnas.rol) {
              row.push(item.usuario?.rol?.nombre || 'N/A');
            }

            return row;
          })
        ];

        // Construir el contenido del documento
        const content: any[] = [
          { text: this.pdfConfig.titulo, style: 'header' },
          { text: `Generado el: ${new Date().toLocaleString()}`, style: 'subheader' },
          { text: '\n' }
        ];

        // Agregar filtros aplicados si está habilitado
        if (this.pdfConfig.incluirFiltros) {
          const filtrosAplicados = this.obtenerFiltrosAplicados();
          if (Object.keys(filtrosAplicados).length > 0) {
            content.push({ text: 'Filtros Aplicados', style: 'sectionHeader' });
            content.push({
              table: {
                headerRows: 0,
                widths: ['30%', '70%'],
                body: Object.entries(filtrosAplicados).map(([key, value]) => [
                  { text: key + ':', style: 'filterLabel' },
                  { text: value.toString(), style: 'filterValue' }
                ])
              },
              layout: 'lightHorizontalLines',
              margin: [0, 5, 0, 15]
            });
          }
        }

        // Agregar resumen si está habilitado
        if (this.pdfConfig.incluirResumen) {
          content.push(...this.generarResumenDatos(bitacora));
        }

        // Agregar tabla principal
        content.push(
          { text: `Registros de Bitácora (${bitacora.length} registros)`, style: 'sectionHeader' },
          {
            table: {
              headerRows: 1,
              widths: widths,
              body: body,
              dontBreakRows: false
            },
            layout: {
              fillColor: function (rowIndex: number) {
                return (rowIndex === 0) ? '#4CAF50' : (rowIndex % 2 === 0 ? '#f9f9f9' : null);
              },
              hLineColor: '#ddd',
              vLineColor: '#ddd'
            },
            style: 'tableContent'
          }
        );

        // Agregar pie de reporte si está habilitado
        if (this.pdfConfig.incluirPieDeReporte) {
          content.push(
            { text: '\n' },
            {
              text: [
                'Este reporte fue generado automáticamente por el sistema de bitácora. ',
                `Total de registros mostrados: ${bitacora.length}${bitacora.length >= this.pdfConfig.maxRegistros ? ' (máximo alcanzado)' : ''}.`
              ],
              style: 'footer'
            }
          );
        }

        // Definición del documento
        const docDefinition = {
          content: content,
          pageOrientation: this.pdfConfig.orientacion,
          pageMargins: [40, 60, 40, 60] as [number, number, number, number],
          defaultStyle: {
            fontSize: this.pdfConfig.tamanoFuente,
            font: 'Roboto'
          },
          styles: {
            header: {
              fontSize: Math.max(16, this.pdfConfig.tamanoFuente + 6),
              bold: true,
              alignment: 'center' as const,
              color: '#2E7D32',
              margin: [0, 0, 0, 10] as [number, number, number, number]
            },
            subheader: {
              fontSize: Math.max(10, this.pdfConfig.tamanoFuente - 2),
              italics: true,
              alignment: 'center' as const,
              color: '#666',
              margin: [0, 0, 0, 15] as [number, number, number, number]
            },
            sectionHeader: {
              fontSize: Math.max(12, this.pdfConfig.tamanoFuente + 2),
              bold: true,
              color: '#1976D2',
              margin: [0, 15, 0, 5] as [number, number, number, number]
            },
            tableHeader: {
              bold: true,
              fillColor: '#4CAF50',
              color: 'white',
              alignment: 'center' as const
            },
            tableContent: {
              margin: [0, 5, 0, 15] as [number, number, number, number],
              fontSize: Math.max(8, this.pdfConfig.tamanoFuente - 1)
            },
            filterLabel: {
              bold: true,
              color: '#333'
            },
            filterValue: {
              color: '#666'
            },
            footer: {
              fontSize: Math.max(8, this.pdfConfig.tamanoFuente - 2),
              italics: true,
              color: '#999',
              alignment: 'justify' as const,
              margin: [0, 20, 0, 0] as [number, number, number, number]
            }
          }
        };

        // Generar y descargar el PDF
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `bitacora_informe_${timestamp}.pdf`;

        pdfMake.createPdf(docDefinition).download(filename);

        this.mostrarExito('PDF generado exitosamente');

      } catch (error) {
        console.error('Error al generar PDF:', error);
        this.mostrarError('Error al generar el PDF');
      } finally {
        this.generandoPDF = false;
      }
    }).catch((error) => {
      console.error('Error al obtener los datos:', error);
      this.mostrarError('Error al obtener los datos para el PDF');
      this.generandoPDF = false;
    });
  }

  private mostrarExito(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  // Métodos auxiliares para la configuración del PDF
  onPDFConfigChange(): void {
    // Se puede agregar lógica adicional cuando cambie la configuración
    console.log('Configuración PDF actualizada:', this.pdfConfig);
  }

  resetPDFConfig(): void {
    this.pdfConfig = {
      titulo: 'Informe de Bitácora del Sistema',
      incluirFiltros: true,
      incluirResumen: true,
      incluirLogo: false,
      orientacion: 'portrait',
      tamanoFuente: 10,
      columnas: {
        usuario: true,
        accion: true,
        timestamp: true,
        ip: true,
        establecimiento: false,
        rol: false
      },
      maxRegistros: 1000,
      incluirPieDeReporte: true
    };
  }
}