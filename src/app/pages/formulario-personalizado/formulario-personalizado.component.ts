import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from 'src/app/services/api.service';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';

/*
Cuando se cargue el historial clínico, se buscará el formulario de la especialidad y se mostrarán sus preguntas automáticamente.
Al guardar, se enviarán todas las respuestas al backend mediante el endpoint respuestas-masivas.
*/

@Component({
  selector: 'app-formulario-personalizado',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './formulario-personalizado.component.html',
  styleUrl: './formulario-personalizado.component.scss'
})
export class FormularioPersonalizadoComponent implements OnInit {
  @Input() especialidadId!: number;
  @Input() historialId!: string;

  form: FormGroup = this.fb.group({});
  preguntas: any[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (this.especialidadId) {
      this.apiService.get<any[]>('api/historiales/formularios/', { especialidad: this.especialidadId })
        .subscribe({
          next: (formularios) => {
            if (formularios.length > 0) {
              const formulario = formularios[0]; // Solo uno por especialidad
              this.preguntas = formulario.preguntas;
              this.buildForm();
            }
          }
        });
    }
  }

  buildForm(): void {
    for (let pregunta of this.preguntas) {
      const validators = pregunta.obligatorio ? [Validators.required] : [];
      this.form.addControl(pregunta.id, this.fb.control(null, validators));
    }
  }

  guardar(): void {
    if (this.form.invalid) return;

    const respuestas = Object.entries(this.form.value).map(([preguntaId, valor]) => ({
      pregunta: preguntaId,
      valor: valor?.toString() ?? ''
    }));

    this.apiService.post(`api/historiales/historiales/${this.historialId}/respuestas-masivas/`, {
      respuestas
    }).subscribe({
      next: () => {
        this.snackBar.open('Formulario guardado con éxito ✅', 'Cerrar', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Error al guardar el formulario ❌', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
