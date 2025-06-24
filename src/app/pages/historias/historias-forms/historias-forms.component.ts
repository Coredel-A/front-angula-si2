import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
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
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ChangeDetectionStrategy } from '@angular/compiler';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  password: string;
  fecha_nacimiento: Date | null;
  fecha_registro: Date;
  especialidad: Especialidad | null;
  establecimiento: Establecimiento | null;
  rol: Rol | null;
  permisos: string[];
  is_active: boolean;
  is_staff: boolean;
}

interface Historia {
  id: string;
  paciente: string;
  usuario: number;
  especialidad: number;
  fecha: Date;
  motivo_consulta: string;
  fuente: string;
  confiabilidad: string | null;
  diagnostico: string;
  signos_vitales: {
    presion_arterial: string;
    frecuencia_cardiaca: number;
    temperatura: number;
    saturacion_oxigeno: number;
  };
}

interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Component({
  selector: 'app-historias-forms',
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
  templateUrl: './historias-forms.component.html',
  styleUrl: './historias-forms.component.scss'
})
export class HistoriasFormsComponent implements OnInit {
  @Input() pacienteId?: string;

  historiaform!: FormGroup;

  loading: boolean = false;
  submitting = false;

  totalItems = 0;
  pageSize = 10;
  currentPage = 0;

  especialidades = new MatTableDataSource<Especialidad>();
  usuarioCurrent: Usuario | null = null;
  pacienteCurrent: Paciente | null = null;

  // Propiedades para mostrar en el template
  get nombrePaciente(): string {
    return this.pacienteCurrent ? 
      `${this.pacienteCurrent.nombre} ${this.pacienteCurrent.apellido}` : 
      'Cargando...';
  }

  get nombreUsuario(): string {
    return this.usuarioCurrent ? 
      `${this.usuarioCurrent.nombre} ${this.usuarioCurrent.apellido}` : 
      'Cargando...';
  }

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const queryParams = this.route.snapshot.queryParams;
    this.pacienteId = queryParams['pacienteId'];
    const usuarioId = JSON.parse(localStorage.getItem('usuario') || '{}')?.id;

    this.initializeForm();

    if (this.pacienteId) {
      this.cargarDatosPaciente(this.pacienteId);
    }

    if (usuarioId) {
      this.cargarDatosUsuario(Number(usuarioId));
    }

    this.cargarDatosEspecialidad();
  }

  initializeForm(): void {
    this.historiaform = this.fb.group({
      especialidad: ['', Validators.required],
      motivo_consulta: ['', Validators.required],
      fuente: ['', Validators.required],
      confiabilidad: [''],
      diagnostico: ['', Validators.required],
      signos_vitales: this.fb.group({
        presion_arterial: ['', Validators.required],
        frecuencia_cardiaca: ['', [Validators.required, Validators.min(30), Validators.max(200)]],
        temperatura: ['', [Validators.required, Validators.min(30), Validators.max(45)]],
        saturacion_oxigeno: ['', [Validators.required, Validators.min(70), Validators.max(100)]]
      })
    });
  }

  private cargarDatosEspecialidad(): void {
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
        this.snackBar.open('Error al cargar especialidades', 'Cerrar', {
          duration: 3000,
        });
        this.loading = false;
      }
    });
  }

  private cargarDatosPaciente(pacienteId: string): void {
    this.loading = true;

    this.apiService.get<Paciente>(`api/pacientes/${pacienteId}`).subscribe({
      next: (paciente) => {
        this.pacienteCurrent = paciente;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar datos del paciente:', err);
        this.snackBar.open('Error al cargar datos del paciente', 'Cerrar', {
          duration: 3000,
        });
        this.loading = false;
      }
    });
  }

  private cargarDatosUsuario(usuarioId: number): void {
    this.loading = true;

    this.apiService.get<Usuario>(`api/usuarios/${usuarioId}`).subscribe({
      next: (usuario) => {
        this.usuarioCurrent = usuario;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar datos del Usuario:', err);
        this.snackBar.open('Error al cargar datos del usuario', 'Cerrar', {
          duration: 3000,
        });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    // Validar formulario
    if (this.historiaform.invalid) {
      console.warn('Formulario inválido');
      this.marcarCamposComoTocados();
      this.snackBar.open('Por favor, complete todos los campos requeridos', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    // Validar datos esenciales
    if (!this.pacienteId) {
      console.warn('ID del paciente no encontrado');
      this.snackBar.open('Error: ID del paciente no encontrado', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const usuarioId = usuario?.id;
    
    if (!usuarioId) {
      console.warn('ID del usuario no encontrado');
      this.snackBar.open('Error: Datos del usuario no encontrados', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    this.submitting = true;

    const formValue = this.historiaform.value;

    const nuevaHistoria: Omit<Historia, 'id' | 'fecha'> = {
      paciente: this.pacienteId,
      usuario: Number(usuarioId), // Asegurar que sea número
      especialidad: Number(formValue.especialidad), // Asegurar que sea número
      motivo_consulta: formValue.motivo_consulta,
      fuente: formValue.fuente,
      confiabilidad: formValue.confiabilidad || null,
      diagnostico: formValue.diagnostico,
      signos_vitales: {
        presion_arterial: formValue.signos_vitales.presion_arterial,
        frecuencia_cardiaca: Number(formValue.signos_vitales.frecuencia_cardiaca),
        temperatura: Number(formValue.signos_vitales.temperatura),
        saturacion_oxigeno: Number(formValue.signos_vitales.saturacion_oxigeno)
      },
    };

    console.log('Datos a enviar:', nuevaHistoria); // Para debugging

    this.apiService.post<Historia>('api/historiales/historiales/', nuevaHistoria).subscribe({
      next: (res) => {
        this.submitting = false;
        this.snackBar.open('Historia clínica registrada correctamente', 'Cerrar', {
          duration: 3000,
        });
        this.router.navigate(['/pacientes', this.pacienteId, 'details']);
      },
      error: (err) => {
        console.error('Error al registrar historia clínica:', err);
        this.submitting = false;
        
        // Mostrar error más específico
        let errorMessage = 'Error al registrar historia clínica';
        if (err.error && err.error.message) {
          errorMessage = err.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
        });
      }
    });
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.historiaform.controls).forEach(key => {
      const control = this.historiaform.get(key);
      if (control) {
        control.markAsTouched();
        
        // Para FormGroups anidados como signos_vitales
        if (control instanceof FormGroup) {
          Object.keys(control.controls).forEach(nestedKey => {
            control.get(nestedKey)?.markAsTouched();
          });
        }
      }
    });
  }

  // Método para verificar si un campo específico tiene errores
  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.historiaform.get(fieldName);
    if (!field) return false;
    
    if (errorType) {
      return field.hasError(errorType) && (field.dirty || field.touched);
    }
    return field.invalid && (field.dirty || field.touched);
  }

  // Método para obtener el mensaje de error
  getErrorMessage(fieldName: string): string {
    const field = this.historiaform.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Este campo es requerido';
    if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`;
    if (field.errors['max']) return `Valor máximo: ${field.errors['max'].max}`;
    
    return 'Campo inválido';
  }

  cancelar(): void {
    this.router.navigate(['/pacientes', this.pacienteId, 'details']);
  }
}