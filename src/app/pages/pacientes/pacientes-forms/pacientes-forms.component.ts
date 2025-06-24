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

interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Component({
  selector: 'app-pacientes-forms',
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
  templateUrl: './pacientes-forms.component.html',
  styleUrl: './pacientes-forms.component.scss'
})
export class PacientesFormsComponent implements OnInit {
  @Input() pacienteId?: string;
  @Input() isEditMode: boolean = false;
  @Output() formSubmit = new EventEmitter<Paciente>();
  @Output() formCancel = new EventEmitter<void>();

  pacienteForm!: FormGroup;
  loading = false;
  submitting = false;

  opcionesSexo = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
    { value: 'O', label: 'Otro' }
  ];

  opcionesAsegurado = [
    { value: true, label: 'Asegurado' },
    { value: false, label: 'No Asegurado' }
  ];

  pacientesAsegurados: Paciente[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.cargarPacientesAsegurados();

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.pacienteId = idParam;
        this.isEditMode = true;
        this.cargarPacientePorId();
      }
    });
  }

  private initializeForm(paciente?: Paciente): void {
    this.pacienteForm = this.formBuilder.group({
      nombre: [paciente?.nombre || '', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      apellido: [paciente?.apellido || '', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      ci: [paciente?.ci || '', [Validators.required]],
      telefono: [paciente?.telefono || '', [Validators.pattern(/^[0-9-+\s()]{7,15}$/)]],
      email: [paciente?.email || '', [Validators.required, Validators.email, Validators.maxLength(100)]],
      fecha_nacimiento: [paciente?.fecha_nacimiento ? new Date(paciente.fecha_nacimiento).toISOString().split('T')[0] : '', Validators.required],
      sexo: [paciente?.sexo || '', Validators.required],
      residencia: [paciente?.residencia || '', [Validators.maxLength(200)]],
      direccion: [paciente?.direccion || '', [Validators.maxLength(200)]],
      religion: [paciente?.religion || '', [Validators.maxLength(100)]],
      ocupacion: [paciente?.ocupacion || '', [Validators.maxLength(200)]],
      asegurado: [paciente?.asegurado ?? true], // Valor por defecto true
      beneficiario_de: [paciente?.beneficiario_de?.id || null]
    });
    
    // Configurar el watcher después de crear el formulario
    this.setupAseguradoWatcher();
  }

  private setupAseguradoWatcher(): void {
    this.pacienteForm.get('asegurado')?.valueChanges.subscribe((value) => {
      const beneficiarioDeControl = this.pacienteForm.get('beneficiario_de');

      if (value === false) {
        // Si no está asegurado, requiere beneficiario
        beneficiarioDeControl?.setValidators([Validators.required]);
      } else {
        // Si está asegurado, no necesita beneficiario
        beneficiarioDeControl?.clearValidators();
        beneficiarioDeControl?.setValue(null);
      }

      beneficiarioDeControl?.updateValueAndValidity();
    });

    // Aplicar validación inicial
    const currentValue = this.pacienteForm.get('asegurado')?.value;
    if (currentValue === false) {
      this.pacienteForm.get('beneficiario_de')?.setValidators([Validators.required]);
      this.pacienteForm.get('beneficiario_de')?.updateValueAndValidity();
    }
  }

  /** Cargar los datos del paciente para edición */
  private cargarPacientePorId(): void {
    if (!this.pacienteId) return;

    this.loading = true;
    this.apiService.get<Paciente>(`api/pacientes/${this.pacienteId}/`).subscribe({
      next: (paciente) => {
        this.initializeForm(paciente);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar paciente', err);
        this.loading = false;
      }
    });
  }

  /** Cargar los pacientes asegurados (para lista de aseguradores) */
  private cargarPacientesAsegurados(): void {
    this.apiService.get<ApiResponse<Paciente>>('api/pacientes/', {
      params: { asegurado: 'true' } // Asegurar que se envíe como string
    }).subscribe({
      next: (data) => {
        this.pacientesAsegurados = data.results;
      },
      error: (err) => {
        console.error('Error al cargar pacientes asegurados', err);
      }
    });
  }

  onSubmit(): void {
    // Marcar todos los campos como tocados para mostrar errores
    this.markFormGroupTouched();
    
    if (this.pacienteForm.valid) {
      this.submitting = true;
      const formData = this.pacienteForm.value;

      const pacienteData: any = {
        nombre: (formData.nombre || '').trim(),
        apellido: (formData.apellido || '').trim(),
        ci: (formData.ci || '').trim(),
        telefono: formData.telefono ? formData.telefono.trim() : null,
        email: formData.email ? formData.email.trim().toLowerCase() : null,
        fecha_nacimiento: formData.fecha_nacimiento,
        sexo: formData.sexo,
        residencia: formData.residencia || null,
        direccion: formData.direccion || null,
        religion: formData.religion || null,
        ocupacion: formData.ocupacion || null,
        asegurado: formData.asegurado
      };

      // Solo agregar beneficiario_de_id si no está asegurado y tiene valor
      if (!formData.asegurado && formData.beneficiario_de) {
        pacienteData.beneficiario_de_id = formData.beneficiario_de;
      }

      if (this.isEditMode && this.pacienteId) {
        this.actualizarPaciente(pacienteData);
      } else {
        this.crearPaciente(pacienteData);
      }
    }
  }

  private crearPaciente(pacienteData: any): void {
    this.apiService.post<any>('api/pacientes/', pacienteData).subscribe({
      next: (response) => {
        console.log('Paciente creado exitosamente:', response);
        this.router.navigate(['/pacientes']);
        this.submitting = false;
      },
      error: (err) => {
        console.error('Error al crear paciente:', err);
        this.submitting = false;
      }
    });
  }

  private actualizarPaciente(pacienteData: any): void {
    if (!this.pacienteId) return;

    this.apiService.put<any>(`api/pacientes/`,this.pacienteId, pacienteData).subscribe({
      next: (response) => {
        console.log('Paciente actualizado exitosamente:', response);
        this.router.navigate(['/pacientes', this.pacienteId, 'details']);
        this.submitting = false;
      },
      error: (err) => {
        console.error('Error al actualizar paciente:', err);
        this.submitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/pacientes']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.pacienteForm.controls).forEach(key => {
      const control = this.pacienteForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.pacienteForm.get(fieldName);
    if (field?.hasError('required')) return `${this.getFieldLabel(fieldName)} es requerido`;
    if (field?.hasError('minlength')) return `${this.getFieldLabel(fieldName)} debe tener al menos ${field.errors?.['minlength'].requiredLength} caracteres`;
    if (field?.hasError('maxlength')) return `${this.getFieldLabel(fieldName)} no puede tener más de ${field.errors?.['maxlength'].requiredLength} caracteres`;
    if (field?.hasError('email')) return 'Ingresa un correo electrónico válido';
    if (field?.hasError('pattern')) return 'Formato inválido';
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nombre: 'Nombre',
      apellido: 'Apellido',
      ci: 'CI',
      telefono: 'Teléfono',
      email: 'Correo electrónico',
      fecha_nacimiento: 'Fecha de nacimiento',
      sexo: 'Sexo',
      residencia: 'Residencia',
      direccion: 'Dirección',
      religion: 'Religión',
      ocupacion: 'Ocupación',
      asegurado: '¿Está asegurado?',
      beneficiario_de: 'Beneficiario de'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.pacienteForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}