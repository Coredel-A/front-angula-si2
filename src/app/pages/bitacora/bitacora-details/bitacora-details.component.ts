import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';

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
  fecha_nacimiento: Date | null;
  fecha_registro: Date;
  especialidad: Especialidad | null;
  establecimiento: Establecimiento | null;
  rol: Rol | null;
  permisos: string[];
  is_active: boolean;
  is_staff: boolean;
}

interface Bitacora {
  id: string;
  usuario: Usuario;
  accion: string;
  timestamp: Date;
  ip: string
}

interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Component({
  selector: 'app-bitacora-details',
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
    MatDialogModule
  ],
  templateUrl: './bitacora-details.component.html',
  styleUrl: './bitacora-details.component.scss'
})
export class BitacoraDetailsComponent implements OnInit {
  bitacora: Bitacora | null = null;
  loading = false;

  constructor(
    private apiService: ApiService,
    private dialogRef: MatDialogRef<BitacoraDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string }
  ) {}

  ngOnInit(): void {
    this.cargarDetalleBitacora(this.data.id);
  }

  cargarDetalleBitacora(id: string): void {
    const encodedId = encodeURIComponent(this.data.id);
    this.apiService.get<Bitacora>(`api/bitacora/${encodedId}`).subscribe({
      next: (res) => {
        this.bitacora = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar bitacora:', err);
        this.loading = false;
      }
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
  
}
