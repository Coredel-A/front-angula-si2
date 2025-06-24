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

import { MatDialog } from '@angular/material/dialog';
import { EspecialidadesFormsComponent } from './especialidades-forms/especialidades-forms.component';

interface Especialidad {
  id: number;
  nombre: string;
  descripcion: string;
}

interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Component({
  selector: 'app-especialidades',
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
  templateUrl: './especialidades.component.html',
  styleUrl: './especialidades.component.scss'
})
export class EspecialidadesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  especialidades = new MatTableDataSource<Especialidad>();
  especialidadesColumns: string[] = ['nombre', 'descripcion', 'acciones'];

  totalItems = 0;
  pageSize = 10;
  currentPage = 0;

  loading: boolean = false;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.cargarEspecialidades();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.paginator.page.subscribe((event: PageEvent) => {
        this.currentPage = event.pageIndex;
        this.pageSize = event.pageSize;
        this.cargarEspecialidades();
      });
    }
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

  editarEspecialidad(id: number): void {
    this.router.navigate(['/especialidades/editar', id]);
  }

  eliminarEspecialidad(id: number): void {
    if (!confirm('¿Estás seguro de que deseas eliminar esta especialidad?')) {
      return;
    }

    this.loading = true;
    this.apiService.delete(`api/especialidades/`, id).subscribe({
      next: () => {
        console.log('Especialidad eliminada');
        this.cargarEspecialidades();
      },
      error: (err) => {
        console.error('Error al eliminar especialidad:', err);
        this.loading = false;
      }
    });
  }

  abrirModalCrear(): void {
    const dialogRef = this.dialog.open(EspecialidadesFormsComponent, {
      width: '500px',
      data: { isEditMode: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarEspecialidades();
      }
    });
  }

  abrirModalEditar(id: number): void {
    const dialogRef = this.dialog.open(EspecialidadesFormsComponent, {
      width: '500px',
      data: { id: id, isEditMode: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarEspecialidades();
      }
    });
  }

}
