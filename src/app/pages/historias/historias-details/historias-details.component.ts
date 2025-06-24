import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ApiService } from 'src/app/services/api.service';
import { FormularioPersonalizadoComponent } from '../../formulario-personalizado/formulario-personalizado.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';

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

interface Documento {
  id: string;
  historial: string;
  tipo_documento: string;
  fecha_subida: Date;
}

interface Historia {
  id: string;
  documento_adjunto: Documento[];
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
  formulario: {
    id: string;
    preguntas: any[];
    nombre: string;
    actividad: boolean;
  } | null;
  preguntas_respuestas: any[];
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
  preguntas: Pregunta[];
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
  selector: 'app-historias-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatPaginatorModule,
    FormularioPersonalizadoComponent,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatRadioModule,
    MatSelectModule,
  ],
  templateUrl: './historias-details.component.html',
  styleUrl: './historias-details.component.scss'
})
export class HistoriasDetailsComponent implements OnInit {
  historia: Historia | null = null;
  loading = false;
  savingRespuestas = false;
  formularios: Formulario[] = [];
  selectedFormularioId: string | null = null;
  preguntas: Pregunta[] = [];
  respuestas: any = {};
  historiaId: string = '';
  mostrarFormulario = false;
  selectedFile: File | null = null;
  documentos: Documento[] = [];

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.historiaId = id;
        this.cargarHistoria();
        this.cargarFormularios(id);
      }
    });
  }

  cargarHistoria(): void {
    this.loading = true;

    this.apiService.get<Historia>(`api/historiales/historiales/${this.historiaId}/`).subscribe({
      next: (data) => {
        this.historia = data;
        this.loading = false;

        // Si ya tiene un formulario asignado y tiene respuestas, no mostrar la opción de seleccionar formulario
        if (this.historia.formulario && this.historia.preguntas_respuestas.length > 0) {
          this.selectedFormularioId = this.historia.formulario.id;
          this.mostrarFormulario = false; // Ocultar el formulario de selección
        } else {
          // Si no hay formulario o no tiene respuestas, permitir seleccionar uno
          this.selectedFormularioId = null;
          this.mostrarFormulario = true; // Mostrar el formulario de selección
        }

        // Si ya tiene un formulario asignado, cargar sus preguntas
        if (this.historia.formulario) {
          this.cargarPreguntasFormulario(this.historia.formulario.id);
        }

        this.cargarDocumentosAdjuntos();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar la historia clinica:', err);
        this.loading = false;
        this.snackBar.open('Error al cargar la historia clínica', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cargarDocumentosAdjuntos(): void {
    // Verificar si hay documentos adjuntos
    if (this.historia && this.historia.documento_adjunto) {
      this.documentos = this.historia.documento_adjunto;
    }
  }

  descargarDocumento(documentoId: string): void {
    this.apiService.get<Blob>(`api/historiales/documentos/${documentoId}/descargar/`, { responseType: 'blob' }).subscribe({
      next: (blob: Blob) => {
        // Crear un enlace para la descarga
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = 'documento.jpg'; // Asegúrate de usar el nombre adecuado o extraerlo dinámicamente
        link.click();  // Simula el clic para iniciar la descarga
        window.URL.revokeObjectURL(url); // Libera el objeto URL
      },
      error: (err) => {
        console.error('Error al descargar el documento:', err);
        this.snackBar.open('Error al descargar el documento', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cargarFormularios(id: string): void {
    this.apiService.get<Formulario[]>(`api/historiales/historiales/${id}/formularios-especialidad/`).subscribe({
      next: (data) => {
        this.formularios = data;
      },
      error: (err) => {
        console.error('Error al cargar formularios:', err);
        this.snackBar.open('Error al cargar formularios', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onFormularioSeleccionado(formularioId: string): void {
    this.selectedFormularioId = formularioId;
    this.mostrarFormulario = true;
    this.cargarPreguntasFormulario(formularioId);
  }

  cargarPreguntasFormulario(formularioId: string): void {
    const formulario = this.formularios.find(f => f.id === formularioId);
    if (formulario) {
      this.preguntas = formulario.preguntas.sort((a, b) => a.orden - b.orden);
      this.respuestas = {}; // Limpiar respuestas anteriores

      this.preguntas.forEach(pregunta => {
        // Si la historia ya tiene respuestas, cargarlas
        if (this.historia?.preguntas_respuestas && this.historia.preguntas_respuestas.length > 0) {
          const respuestaExistente = this.historia.preguntas_respuestas.find(
            r => r.pregunta_id === pregunta.id
          );
          if (respuestaExistente) {
            // Para campos booleanos, convertir string a boolean
            if (pregunta.tipo_dato === 'booleano') {
              this.respuestas[pregunta.id] = respuestaExistente.respuesta === 'true' || respuestaExistente.respuesta === true;
            } else {
              this.respuestas[pregunta.id] = respuestaExistente.respuesta;
            }
          } else {
            // Inicializar según el tipo de dato
            this.respuestas[pregunta.id] = this.getDefaultValue(pregunta.tipo_dato);
          }
        } else {
          this.respuestas[pregunta.id] = this.getDefaultValue(pregunta.tipo_dato);
        }
      });

      this.cdr.detectChanges();
    }
  }

  private getDefaultValue(tipoDato: string): any {
    switch (tipoDato) {
      case 'booleano':
        return false;
      case 'numero':
        return null;
      case 'fecha':
        return null;
      default:
        return '';
    }
  }

  onRespuestasChange(preguntaId: string, valor: string): void {
    this.respuestas[preguntaId] = valor;
  }

  guardarRespuestas(): void {
    // Validar campos obligatorios
    const preguntasObligatorias = this.preguntas.filter(p => p.obligatorio);
    const respuestasFaltantes = preguntasObligatorias.filter(p => {
      const valor = this.respuestas[p.id];
      return valor === null || valor === undefined ||
        (typeof valor === 'string' && valor.trim() === '') ||
        (p.tipo_dato === 'booleano' && valor === null);
    });

    if (respuestasFaltantes.length > 0) {
      this.snackBar.open(
        `Por favor, complete las preguntas obligatorias: ${respuestasFaltantes.map(p => p.texto).join(', ')}`,
        'Cerrar',
        { duration: 5000 }
      );
      return;
    }

    this.savingRespuestas = true;

    // Preparar las respuestas para enviar
    const respuestasParaEnviar = Object.keys(this.respuestas)
      .filter(preguntaId => {
        const valor = this.respuestas[preguntaId];
        return valor !== null && valor !== undefined &&
          (typeof valor !== 'string' || valor.trim() !== '');
      })
      .map(preguntaId => {
        let valor = this.respuestas[preguntaId];

        // Convertir booleanos a string para el backend
        if (typeof valor === 'boolean') {
          valor = valor.toString();
        }

        return {
          pregunta: preguntaId,
          valor: valor.toString(),
        };
      });

    const payload = {
      formulario: this.selectedFormularioId,
      respuestas: respuestasParaEnviar,
    };

    console.log('Payload a enviar:', payload); // Para debug

    // Usar el endpoint correcto para asignar formulario y respuestas
    this.apiService.patch(`api/historiales/historiales`, this.historiaId, `asignar-formulario/`, payload).subscribe({
      next: (data) => {
        this.savingRespuestas = false;
        this.snackBar.open('Respuestas guardadas correctamente', 'Cerrar', { duration: 3000 });

        // Recargar la historia para mostrar los datos actualizados
        this.cargarHistoria();
      },
      error: (err) => {
        console.error('Error al guardar las respuestas:', err);
        this.savingRespuestas = false;
        this.snackBar.open('Error al guardar las respuestas', 'Cerrar', { duration: 3000 });
      }
    });
  }



  getInputType(tipoDato: string): string {
    switch (tipoDato) {
      case 'texto':
        return 'text';
      case 'numero':
        return 'number';
      case 'booleano':
        return 'checkbox';
      case 'fecha':
        return 'date';
      default:
        return 'text';
    }
  }

  // Método para obtener el valor de una respuesta específica
  getRespuestaValue(preguntaId: string): string {
    if (this.historia?.preguntas_respuestas) {
      const respuesta = this.historia.preguntas_respuestas.find(r => r.pregunta_id === preguntaId);
      return respuesta ? respuesta.respuesta || '' : '';
    }
    return '';
  }

  // Método para verificar si hay respuestas guardadas
  tieneRespuestasGuardadas(): boolean {
    return !!(this.historia?.preguntas_respuestas && this.historia.preguntas_respuestas.length > 0);
  }

  // Método para verificar si se puede mostrar el formulario
  puedeEditarFormulario(): boolean {
    return this.selectedFormularioId !== null && this.preguntas.length > 0;
  }

  trackByPreguntaId(index: number, pregunta: any): any {
    return pregunta.id;
  }

  // Método para cancelar la edición del formulario
  cancelarFormulario(): void {
    this.mostrarFormulario = false;
    this.selectedFormularioId = null;
    this.preguntas = [];
    this.respuestas = {};
  }

  onFileChange(event: any, preguntaId: string): void {
    const file = event.target.files[0];
    if (file) {
      this.respuestas[preguntaId] = file; // Guardamos el archivo en las respuestas para asociarlo con la pregunta

      // Aquí puedes hacer cualquier validación adicional, como asegurarte de que el archivo sea del tipo correcto
      console.log('Archivo seleccionado:', file);
    }
  }

  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  guardarDocumentoAdjunto(): void {
    if (!this.selectedFile) {
      this.snackBar.open('Por favor, seleccione un archivo antes de adjuntarlo.', 'Cerrar', { duration: 3000 });
      return;
    }

    // Crear un FormData
    const formData = new FormData();
    formData.append('archivo', this.selectedFile); // Agregar el archivo
    formData.append('tipo_documento', 'Historial Clínico'); // Tipo de documento
    formData.append('historial', this.historiaId); // ID del historial clínico

    // Usar el endpoint para subir el archivo
    this.apiService.postFormData('api/historiales/documentos/', formData).subscribe({
      next: (data) => {
        this.snackBar.open('Documento adjuntado correctamente', 'Cerrar', { duration: 3000 });
        this.cargarHistoria(); // Recargar historia para mostrar el documento adjunto
      },
      error: (err) => {
        console.error('Error al adjuntar documento:', err);
        this.snackBar.open('Error al adjuntar documento', 'Cerrar', { duration: 3000 });
      }
    });
  }



}