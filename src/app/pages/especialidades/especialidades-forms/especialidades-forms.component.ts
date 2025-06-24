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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';

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
  selector: 'app-especialidades-forms',
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
    MatDialogModule,
  ],
  templateUrl: './especialidades-forms.component.html',
  styleUrl: './especialidades-forms.component.scss'
})
export class EspecialidadesFormsComponent implements OnInit {
  @Input() especialidadId?: string;
  @Input() isEditMode: boolean = false;
  @Output() formSubmit = new EventEmitter<Especialidad>();
  @Output() formCancel = new EventEmitter<void>();

  especialidadForm!: FormGroup;
  loading = false;
  submitting = false;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private dialogRef: MatDialogRef<EspecialidadesFormsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id?: number, isEditMode: boolean },
  ) { }

  ngOnInit(): void {
    this.isEditMode = this.data?.isEditMode;
    this.especialidadId = this.data?.id?.toString();

    this.initializeForm();
    if (this.isEditMode && this.especialidadId) {
      this.cargarEspecialidadById();
    }
  }

  private initializeForm(especialidad?: Especialidad): void {
    this.especialidadForm = this.formBuilder.group({
      nombre: [especialidad?.nombre || '', [Validators.required, Validators.minLength(2)]],
      descripcion: [especialidad?.descripcion || '', [Validators.required, Validators.minLength(10)]],
    });
  }

  private cargarEspecialidadById(): void {
    if (!this.especialidadId) return;
    this.loading = true;
    this.apiService.get<Especialidad>(`api/especialidades/${this.especialidadId}`).subscribe({
      next: (especialidad) => {
        this.initializeForm(especialidad);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar Especialidad:', err);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.especialidadForm.valid && !this.submitting) {
      this.submitting = true;

      const especialidadData: Partial<any> = {
        nombre: this.especialidadForm.get('nombre')?.value,
        descripcion: this.especialidadForm.get('descripcion')?.value,
      };

      const request = this.isEditMode && this.especialidadId
        ? this.apiService.put<Especialidad>(`api/especialidades/`, this.especialidadId, especialidadData)
        : this.apiService.post<Especialidad>(`api/especialidades/`, especialidadData);

      request.subscribe({
        next: (response) => {
          console.log('Especialidad guardada exitosamente:', response);
          this.dialogRef.close(response);
          this.submitting = false;

          this.router.navigate(['/especialidades']);
        },
        error: (err) => {
          console.error('Erros al guardar la especialidad:', err);
          this.submitting = false;
        }
      });
    }
  }

  oncancel(): void {
    this.dialogRef.close();
  }

  get formTitle(): string {
    return this.isEditMode ? 'Editar Especialidad' : 'Crear Nueva Especialidad';
  }

  get submitButtonText(): string {
    return this.submitting
      ? (this.isEditMode ? 'Actualizando...' : 'Creando...')
      : (this.isEditMode ? 'Actualizar Especialidad' : 'Crear Especialidad');
  }
}
