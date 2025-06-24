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
import { MatDividerModule } from '@angular/material/divider';
import { ApiService } from 'src/app/services/api.service';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
  selector: 'app-roles',
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
    RouterModule,
    ReactiveFormsModule,
  ],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss'
})
export class RolesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('paginatorPermisos') paginatorPermisos!: MatPaginator;

  roles = new MatTableDataSource<Rol>();
  rolesColumns: string[] = ['nombre', 'descripcion', 'acciones'];

  totalItems = 0;
  pageSize = 10;
  currentPage = 0;

  permisos = new MatTableDataSource<Permiso>();
  permisosColumns: string[] = ['codename', 'descripcion'];

  totalItemsPermisos = 0;
  pageSizePermisos = 10;
  currentPagePermisos = 0;

  loading: boolean = false;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.cargarRoles();
    this.cargarPermisos();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.paginator.page.subscribe((event: PageEvent) => {
        this.currentPage = event.pageIndex;
        this.pageSize = event.pageSize;
        this.cargarRoles();
      });
    }

    if (this.paginatorPermisos) {
      this.paginatorPermisos.page.subscribe((event: PageEvent) => {
        this.currentPagePermisos = event.pageIndex;
        this.pageSizePermisos = event.pageSize;
        this.cargarPermisos();
      });
    }
  }

  private cargarRoles(): void {
    this.loading = true;

    const params = {
      page: this.currentPagePermisos + 1 // Angular empieza en 0, DRF en 1
    };

    this.apiService.get<ApiResponse<Rol>>('api/roles/roles', params).subscribe({
      next: (data) => {
        this.roles.data = data.results;
        this.totalItems = data.count;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar roles:', err);
        this.loading = false;
      }
    });
  }

  private cargarPermisos(): void {
    this.loading = true;

    const params = {
      page: this.currentPagePermisos + 1 // Angular empieza en 0, DRF en 1
    };

    this.apiService.get<ApiResponse<Permiso>>('api/roles/permisos', params).subscribe({
      next: (data) => {
        this.permisos.data = data.results;
        this.totalItemsPermisos = data.count;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar los permisos:', err);
        this.loading = false;
      }
    });
  }

  eliminarRol(rolId: number): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este rol?')) {
      return;
    }

    this.loading = true;

    this.apiService.delete(`api/roles/roles`, rolId).subscribe({
      next: () => {
        console.log('Rol eliminado correctamente');
        this.cargarRoles(); // Recarga la lista de roles
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al eliminar el rol:', err);
        this.loading = false;
      }
    });
  }

  editarRol(rolId: number): void {
    this.router.navigate(['/roles/edit', rolId]);
  }
}
