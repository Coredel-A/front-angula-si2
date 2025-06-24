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

interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Component({
  selector: 'app-usuarios-forms',
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
  templateUrl: './usuarios-forms.component.html',
  styleUrl: './usuarios-forms.component.scss'
})
export class UsuariosFormsComponent implements OnInit {
  @Input() usuarioId?: string;
  @Input() isEditMode: boolean = false;
  @Output() formSubmit = new EventEmitter<Usuario>();
  @Output() formCancel = new EventEmitter<void>();

  usuarioForm!: FormGroup;
  loading = false;
  submitting = false;

  rolDisponibles: Rol[] = [];
  especialidadesDisponibles: Especialidad[] = [];
  establecimientoDisponibles: Establecimiento[] = [];
  //no coloco el de permisos por que para eso esta el rol
  //is staff en el back lo asigna automaticamente como false
  //is activate se pone automaticamente en en true

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.cargarRoles();
    this.cargarEspecialidades();
    this.cargarEstablecimiento();

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.usuarioId = idParam;
        this.isEditMode = true;
        this.cargarUsuarioPorId();
      }
    });
  }

  private passwordsMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      form.get('confirmPassword')?.setErrors(null);
    }

    return null;
  }

  private initializeForm(usuario?: Usuario): void {
    this.usuarioForm = this.formBuilder.group({
      nombre: [usuario?.nombre || '', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      apellido: [usuario?.apellido || '', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      email: [usuario?.email || '', [Validators.required, Validators.email, Validators.maxLength(100)]],
      fecha_nacimiento: [usuario?.fecha_nacimiento ? new Date(usuario.fecha_nacimiento).toISOString().split('T')[0] : '', Validators.required],
      especialidad: [usuario?.especialidad || null],
      establecimiento: [usuario?.establecimiento || null],
      rol: [usuario?.rol || null],
      ...(this.isEditMode ? {} : {
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      })
    }, {
      validators: this.isEditMode ? undefined : this.passwordsMatchValidator
    });
  }

  private cargarUsuarioPorId(): void {
    if (!this.usuarioId) return;

    this.loading = true;
    this.apiService.get<Usuario>(`api/usuarios/${this.usuarioId}/`).subscribe({
      next: (usuario) => {
        this.initializeForm(usuario);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar Usuario', err);
        this.loading = false;
      }
    });
  }

  private cargarEspecialidades(): void {
    this.apiService.get<ApiResponse<Especialidad>>('api/especialidades/').subscribe({
      next: (data) => {
        this.especialidadesDisponibles = data.results;
      },
      error: (err) => {
        console.error('Error al cargar Espcialidades', err);
      }
    });
  }

  private cargarEstablecimiento(): void {
    this.apiService.get<ApiResponse<Establecimiento>>('api/sucursales/establecimientos/').subscribe({
      next: (data) => {
        this.establecimientoDisponibles = data.results;
      },
      error: (err) => {
        console.error('Error al cargar Establecimientos', err);
      }
    });
  }

  private cargarRoles(): void {
    this.apiService.get<ApiResponse<Rol>>('api/roles/roles').subscribe({
      next: (data) => {
        this.rolDisponibles = data.results;
      },
      error: (err) => {
        console.error('Error al cargar Roles:', err);
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.usuarioForm.controls).forEach(key => {
      const control = this.usuarioForm.get(key);
      control?.markAsTouched();
    });
  }

  onSubmit(): void {
    this.markFormGroupTouched();

    if (this.usuarioForm.valid) {
      this.submitting = true;
      const formData = this.usuarioForm.value;

      const usuarioData: any = {
        nombre: (formData.nombre || '').trim(),
        apellido: (formData.apellido || '').trim(),
        email: formData.email ? formData.email.trim().toLowerCase() : null,
        fecha_nacimiento: formData.fecha_nacimiento,
        especialidad_id: formData.especialidad?.id || null,
        establecimiento_id: formData.establecimiento?.id || null,
        rol_id: formData.rol?.id || null,
      };
      if (this.isEditMode && this.usuarioId) {
        this.actualizarUsuario(usuarioData);
      } else {
        usuarioData.password = formData.password;
        this.crearUsuario(usuarioData);
      }
    }
  }

  private crearUsuario(usuarioData: any): void {
    this.apiService.post<any>('api/usuarios/', usuarioData).subscribe({
      next: (response) => {
        console.log('Usuario creado exitosamente:', response);
        this.router.navigate(['/usuarios']);
        this.submitting = false;
      },
      error: (err) => {
        console.error('Error al crear usuario:', err);
        this.submitting = false;
      }
    });
  }

  private actualizarUsuario(usuarioData: any): void {
    if (!this.usuarioId) return;
    this.apiService.put<any>(`api/usuarios`, this.usuarioId, usuarioData).subscribe({
      next: (response) => {
        console.log('Usuario actualizado exitosamente:', response);
        this.router.navigate(['/usuarios', this.usuarioId, 'details']);
        this.submitting = false;
      },
      error: (err) => {
        console.error('Error al actualizar paciente:', err);
        this.submitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/usuarios']);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.usuarioForm.get(fieldName);
    if (field?.hasError('required')) return `${this.getFieldLabel(fieldName)} es requerido`;
    if (field?.hasError('minlength')) return `${this.getFieldLabel(fieldName)} debe tener al menos ${field.errors?.['minlength'].requiredLength} caracteres`;
    if (field?.hasError('maxlength')) return `${this.getFieldLabel(fieldName)} no puede tener más de ${field.errors?.['maxlength'].requiredLength} caracteres`;
    if (field?.hasError('email')) return 'Ingresa un correo electrónico válido';
    if (field?.hasError('pattern')) return 'Formato inválido';
    if (fieldName === 'confirmPassword' && field?.hasError('mismatch')) {
      return 'Las contraseñas no coinciden';
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nombre: 'Nombre',
      apellido: 'Apellido',
      password: 'Password',
      confirmPassword: 'Confirmar password',
      email: 'Correo electrónico',
      fecha_nacimiento: 'Fecha de nacimiento',
      establecimiento: 'Establecimiento',
      especialidad: 'Especialidad',
      rol: 'Rol'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.usuarioForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
