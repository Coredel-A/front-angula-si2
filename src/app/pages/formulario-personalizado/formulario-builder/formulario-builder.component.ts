import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormArray, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { ApiService } from 'src/app/services/api.service';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface Especialidad {
  id: number;
  nombre: string;
  descripcion: string;
}

interface Respuesta {
  id: string;
  pregunta: string;
  valor: string;
}

interface Pregunta {
  id: string;
  formulario: string;
  texto: string;
  tipo_dato: string;
  obligatorio: boolean;
  orden: number;
  respuesta: string | null;
}

interface Formulario {
  id: string;
  nombre: string;
  especialidad: number;
  activo: boolean;
}

interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Component({
  selector: 'app-formulario-builder',
  standalone: true,
  imports: [
    CommonModule,
    MatDividerModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './formulario-builder.component.html',
  styleUrl: './formulario-builder.component.scss'
})
export class FormularioBuilderComponent implements OnInit {
  @Input() formularioId?: string;
  @Input() isEditMode: boolean = false;
  @Output() formSubmit = new EventEmitter<Formulario>();
  @Output() formCancel = new EventEmitter<void>();

  formBuilderForm!: FormGroup;
  especialidades = new MatTableDataSource<Especialidad>();
  submitting = false;

  loadingFormulario: boolean = false;
  loadingEspecialidades: boolean = false;
  loadingPreguntas: boolean = false;
  totalItems = 0;
  pageSize = 10;
  currentPage = 0;

  // Opciones para tipos de datos
  tiposDato = [
    { value: 'texto', label: 'Texto' },
    { value: 'numero', label: 'Número' },
    { value: 'booleano', label: 'Sí/No' },
    { value: 'fecha', label: 'Fecha' },
    { value: 'textarea', label: 'Texto largo' },
  ];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.cargarEspecialidades();

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.formularioId = idParam;
        this.isEditMode = true;
        this.cargarFormularioById(this.formularioId);
        this.cargarPreguntasById();
      }
    });
  }

  private initializeForm(): void {
    this.formBuilderForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      especialidad: ['', Validators.required],
      preguntas: this.fb.array([]),
    });
  }

  private cargarFormularioById(formularioId: string): void {
    this.loadingFormulario = true;
    this.apiService.get<Formulario>(`api/historiales/formularios/${formularioId}`).subscribe({
      next: (formulario) => {
        this.formBuilderForm.patchValue({
          nombre: formulario.nombre,
          especialidad: formulario.especialidad
        });
        this.loadingFormulario = false;
        this.cargarPreguntasById();
      },
      error: (err) => {
        console.error('Error al cargar el formulario:', err);
        this.mostrarError('Error al cargar el formulario');
        this.loadingFormulario = false;
      }
    });
  }

  private cargarEspecialidades(): void {
    this.loadingEspecialidades = true;
    const params = {
      page: this.currentPage + 1
    };

    this.apiService.get<ApiResponse<Especialidad>>('api/especialidades', params).subscribe({
      next: (data) => {
        this.especialidades.data = data.results;
        this.totalItems = data.count;
        this.loadingEspecialidades = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar Especialidades:', err);
        this.mostrarError('Error al cargar las especialidades');
        this.loadingEspecialidades = false;
      }
    });
  }

  private cargarPreguntasById(): void {
    if (!this.formularioId) return;

    this.loadingPreguntas = true;
    const params = {
      page: this.currentPage + 1,
      formularioID: this.formularioId
    };

    this.apiService.get<ApiResponse<Pregunta>>('api/historiales/preguntas', params).subscribe({
      next: (data) => {
        const preguntasFormArray = this.formBuilderForm.get('preguntas') as FormArray;
        preguntasFormArray.clear();

        // Ordenar preguntas por orden
        const preguntasOrdenadas = data.results.sort((a, b) => a.orden - b.orden);

        preguntasOrdenadas.forEach((pregunta) => {
          preguntasFormArray.push(this.crearPreguntaFormGroup(pregunta));
        });

        this.loadingPreguntas = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar las Preguntas:', err);
        this.mostrarError('Error al cargar las preguntas');
        this.loadingPreguntas = false;
      }
    });
  }

  private crearPreguntaFormGroup(pregunta?: Pregunta): FormGroup {
    const preguntasLength = (this.formBuilderForm.get('preguntas') as FormArray).length;

    return this.fb.group({
      id: [pregunta?.id || null],
      texto: [pregunta?.texto || '', [Validators.required, Validators.minLength(5)]],
      tipo_dato: [pregunta?.tipo_dato || 'texto', Validators.required],
      obligatorio: [pregunta?.obligatorio || false],
      orden: [pregunta?.orden || preguntasLength + 1, [Validators.required, Validators.min(1)]],
      respuesta: [pregunta?.respuesta || '']
    });
  }

  agregarPregunta(): void {
    const preguntasFormArray = this.formBuilderForm.get('preguntas') as FormArray;
    const nuevaPregunta = this.crearPreguntaFormGroup();
    preguntasFormArray.push(nuevaPregunta);
  }

  eliminarPregunta(index: number): void {
    const preguntasFormArray = this.formBuilderForm.get('preguntas') as FormArray;
    preguntasFormArray.removeAt(index);

    // Reordenar las preguntas restantes
    this.reordenarPreguntas();
  }

  private reordenarPreguntas(): void {
    const preguntasFormArray = this.formBuilderForm.get('preguntas') as FormArray;
    preguntasFormArray.controls.forEach((control, index) => {
      control.get('orden')?.setValue(index + 1);
    });
  }

  moverPregunta(fromIndex: number, toIndex: number): void {
    const preguntasFormArray = this.formBuilderForm.get('preguntas') as FormArray;
    const pregunta = preguntasFormArray.at(fromIndex);
    preguntasFormArray.removeAt(fromIndex);
    preguntasFormArray.insert(toIndex, pregunta);
    this.reordenarPreguntas();
  }

  guardarFormulario(): void {
    const formValue = this.formBuilderForm.value;

    // Crear o editar el formulario
    const formularioData = {
      nombre: formValue.nombre,
      especialidad: formValue.especialidad
    };

    const apiCall = this.isEditMode
      ? this.apiService.put<Formulario>(`api/historiales/formularios/`, this.formularioId as string, formularioData) // Editar si estamos en modo de edición
      : this.apiService.post<Formulario>('api/historiales/formularios/', formularioData); // Crear si es un nuevo formulario

    apiCall.subscribe((nuevoFormulario: Formulario) => {
      // Asociar las preguntas al formulario recién creado o editado
      const preguntasConFormulario = formValue.preguntas.map((p: any) => ({
        ...p,
        formulario: nuevoFormulario.id
      }));

      // Enviar todas las preguntas como un array de objetos
      this.apiService.post('api/historiales/preguntas/', preguntasConFormulario).subscribe({
        next: () => {
          alert('Formulario creado con éxito');
          this.formBuilderForm.reset();
          (this.formBuilderForm.get('preguntas') as FormArray).clear();
        },
        error: (err) => {
          console.error('Error al guardar las preguntas:', err);
          alert('Hubo un problema al guardar las preguntas.');
        }
      });
    });
  }


  private guardarPreguntas(formularioId: string, preguntas: any[]): void {
    if (preguntas.length === 0) {
      this.finalizarGuardado();
      return;
    }

    const preguntasConFormulario = preguntas.map((pregunta, index) => ({
      ...pregunta,
      formulario: formularioId,
      orden: index + 1
    }));

    const apiCall = this.isEditMode //para que sirve el bulk?
      ? this.apiService.put(`api/historiales/preguntas/`, formularioId, preguntasConFormulario)
      : this.apiService.post('api/historiales/preguntas/', preguntasConFormulario);

    apiCall.subscribe({
      next: () => {
        this.finalizarGuardado();
      },
      error: (err) => {
        console.error('Error al guardar las preguntas:', err);
        this.mostrarError('Error al guardar las preguntas');
        console.log('Detalles del error:', err.error);
        this.submitting = false;
      }
    });
  }

  private finalizarGuardado(): void {
    this.submitting = false;
    const mensaje = this.isEditMode ? 'Formulario actualizado con éxito' : 'Formulario creado con éxito';
    this.mostrarExito(mensaje);

    if (!this.isEditMode) {
      this.resetearFormulario();
    }

    this.formSubmit.emit();
  }

  private resetearFormulario(): void {
    this.formBuilderForm.reset();
    (this.formBuilderForm.get('preguntas') as FormArray).clear();
    this.initializeForm();
  }

  private marcarCamposComoTocados(): void {
    this.formBuilderForm.markAllAsTouched();
    const preguntasFormArray = this.formBuilderForm.get('preguntas') as FormArray;
    preguntasFormArray.controls.forEach(control => control.markAllAsTouched());
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private mostrarExito(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  cancelar(): void {
    // Si el formulario tiene cambios sin guardar, solicitamos confirmación
    if (this.formBuilderForm.dirty) {
      const confirmacion = confirm('¿Está seguro de que desea cancelar? Se perderán los cambios no guardados.');
      if (!confirmacion) return;
    }

    // Emitir evento de cancelación
    this.formCancel.emit();

    // Redirigir a la vista general de formularios (puedes cambiar la ruta según sea necesario)
    this.router.navigate(['/formularios']);
  }


  get preguntas() {
    const preguntasControl = this.formBuilderForm.get('preguntas');
    return (preguntasControl instanceof FormArray) ? preguntasControl.controls : [];
  }

  get isLoading(): boolean {
    return this.loadingFormulario || this.loadingEspecialidades || this.loadingPreguntas;
  }

  // Método para obtener errores de validación
  getErrorMessage(controlName: string, preguntaIndex?: number): string {
    let control;

    if (preguntaIndex !== undefined) {
      const preguntasArray = this.formBuilderForm.get('preguntas') as FormArray;
      control = preguntasArray.at(preguntaIndex).get(controlName);
    } else {
      control = this.formBuilderForm.get(controlName);
    }

    if (control?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres requeridos`;
    }
    if (control?.hasError('min')) {
      return 'El valor debe ser mayor a 0';
    }

    return '';
  }
}