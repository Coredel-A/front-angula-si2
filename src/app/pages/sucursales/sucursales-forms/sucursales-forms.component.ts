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
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute, Router } from '@angular/router';

interface TipoEstablecimiento {
  value: string;
  viewValue: string;
}

interface Nivel {
  value: string;
  viewValue: string;
}

interface Especialidad {
  id: number;
  nombre: string;
  descripcion: string;
}

interface Sucursal {
  id?: number;
  nombre: string;
  direccion: string;
  telefono: string;
  correo: string;
  tipo_establecimiento: string;
  nivel: string;
  especialidades_ids: number[];
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Component({
  selector: 'app-sucursales-forms',
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
  ],
  templateUrl: './sucursales-forms.component.html',
  styleUrl: './sucursales-forms.component.scss'
})
export class SucursalesFormsComponent implements OnInit {
  @Input() sucursalId?: number;
  @Input() isEditMode: boolean = false;
  @Output() formSubmit = new EventEmitter<Sucursal>();
  @Output() formCancel = new EventEmitter<void>();

  sucursalForm!: FormGroup;
  loading = false;
  submitting = false;

  tiposEstablecimiento: TipoEstablecimiento[] = [
    { value: 'hospital', viewValue: 'Hospital' },
    { value: 'clinica', viewValue: 'Clinica' },
    { value: 'centro_salud', viewValue: 'Centro de Salud' },
    { value: 'consultorio', viewValue: 'Consultorio' },
    { value: 'laboratorio', viewValue: 'Laboratorio' },
    { value: 'farmacia', viewValue: 'Farmacia' },
  ];

  niveles: Nivel[] = [
    { value: 'nivel_1', viewValue: 'Primer Nivel' },
    { value: 'nivel_2', viewValue: 'Segundo Nivel' },
    { value: 'nivel_3', viewValue: 'Tercer Nivel' }
  ];

  especialidadesDisponibles: Especialidad[] = [];
  especialidadesSeleccionadas: Especialidad[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.cargarEspecialidades();
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.sucursalId = +idParam;
        this.isEditMode = true;
        this.cargarSucursal();
      }
    });
  }

  private initializeForm(): void {
    this.sucursalForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      direccion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9-+\s()]{7,15}$/)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      tipo_establecimiento: ['', [Validators.required]],
      nivel: ['', Validators.required],
      especialidades_ids: [[]]
    });
  }

  private cargarEspecialidades(): void {
    this.apiService.get<PaginatedResponse<Especialidad>>('api/especialidades/').subscribe({
      next: (data) => {
        this.especialidadesDisponibles = data.results || [];
      },
      error: (err) => {
        console.error('Error al cargar especialidades:', err);
        this.especialidadesDisponibles = [];
      }
    });
  }

  private cargarSucursal(): void {
    if (!this.sucursalId) return;

    this.loading = true;
    this.apiService.get<any>(`api/sucursales/establecimientos/${this.sucursalId}/`).subscribe({
      next: (sucursal) => {
        this.sucursalForm.patchValue({
          nombre: sucursal.nombre,
          direccion: sucursal.direccion,
          telefono: sucursal.telefono,
          correo: sucursal.correo,
          tipo_establecimiento: sucursal.tipo_establecimiento,
          nivel: sucursal.nivel,
          especialidades_ids: sucursal.especialidades?.map((esp: any) => esp.id) || []
        });

        this.especialidadesSeleccionadas = sucursal.especialidades || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar sucursal:', err);
        this.loading = false;
      }
    });
  }

  onEspecialidadSeleccionada(especialidadId: number): void {
    const especialidad = this.especialidadesDisponibles.find(esp => esp.id === especialidadId);
    if (especialidad && !this.especialidadesSeleccionadas.find(esp => esp.id === especialidadId)) {
      this.especialidadesSeleccionadas.push(especialidad);
      this.actualizarEspecialidadesEnForm();
    }
  }

  removerEspecialidad(especialidadId: number): void {
    this.especialidadesSeleccionadas = this.especialidadesSeleccionadas.filter(
      esp => esp.id !== especialidadId
    );
    this.actualizarEspecialidadesEnForm();
  }

  private actualizarEspecialidadesEnForm(): void {
    const especialidadIds = this.especialidadesSeleccionadas.map(esp => esp.id);
    this.sucursalForm.patchValue({ especialidades_ids: especialidadIds });
  }

  getEspecialidadesNoSeleccionadas(): Especialidad[] {
    return this.especialidadesDisponibles.filter(
      esp => !this.especialidadesSeleccionadas.find(selected => selected.id === esp.id)
    );
  }

  onSubmit(): void {
    console.log('onSubmit disparado');
    if (this.sucursalForm.valid) {
      this.submitting = true;
      const formData = {
        ...this.sucursalForm.value,
        especialidades_ids: this.especialidadesSeleccionadas.map(e => e.id)
      };

      const sucursalData: Sucursal = {
        nombre: formData.nombre.trim(),
        direccion: formData.direccion.trim(),
        telefono: formData.telefono.trim(),
        correo: formData.correo.trim().toLowerCase(),
        tipo_establecimiento: formData.tipo_establecimiento,
        nivel: formData.nivel,
        especialidades_ids: formData.especialidades_ids || []
      };
      console.log('Sucursal a enviar:', sucursalData);
      if (this.isEditMode && this.sucursalId) {
        this.actualizarSucursal(sucursalData);
      } else {
        this.crearSucursal(sucursalData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private crearSucursal(sucursalData: Sucursal): void {
    this.apiService.post<any>('api/sucursales/establecimientos/', sucursalData).subscribe({
      next: (response) => {
        console.log('Sucursal creada exitosamente:', response);
        this.router.navigate(['/sucursales']);
        this.submitting = false;
      },
      error: (err) => {
        console.error('Error al crear sucursal:', err);
        this.submitting = false;
      }
    });
  }

  private actualizarSucursal(sucursalData: Sucursal): void {
    if (!this.sucursalId) return;

    this.apiService.put<any>('api/sucursales/establecimientos', this.sucursalId, sucursalData).subscribe({
      next: (response) => {
        console.log('Sucursal actualizada exitosamente:', response);
        this.router.navigate(['/sucursales', this.sucursalId, 'details']);
        this.submitting = false;
      },
      error: (err) => {
        console.error('Error al actualizar sucursal:', err);
        this.submitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/sucursales']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.sucursalForm.controls).forEach(key => {
      const control = this.sucursalForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.sucursalForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} es requerido`;
    }
    if (field?.hasError('minlength')) {
      const requiredLength = field.errors?.['minlength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} debe tener al menos ${requiredLength} caracteres`;
    }
    if (field?.hasError('maxlength')) {
      const requiredLength = field.errors?.['maxlength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} no puede tener más de ${requiredLength} caracteres`;
    }
    if (field?.hasError('email')) {
      return 'Ingresa un correo electrónico válido';
    }
    if (field?.hasError('pattern')) {
      return 'Formato de teléfono inválido';
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nombre: 'Nombre',
      direccion: 'Direccion',
      telefono: 'Telefono',
      correo: 'Correo electronico',
      tipo_establecimiento: 'Tipo de establecimiento',
      nivel: 'Nivel'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.sucursalForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
