import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute, Router } from '@angular/router';

interface Especialidad {
  id: number;
  nombre: string;
  descripcion: string;
}

interface Sucursal {
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

@Component({
  selector: 'app-sucursales-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatBadgeModule
  ],
  templateUrl: './sucursales-details.component.html',
  styleUrl: './sucursales-details.component.scss'
})
export class SucursalesDetailsComponent implements OnInit {
  @Input() sucursalId?: number;

  sucursal: Sucursal | null = null;
  loading = false;
  error = false;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Si no se pasa sucursalId como Input, lo obtenemos de la ruta
    if (!this.sucursalId) {
      this.sucursalId = Number(this.route.snapshot.paramMap.get('id'));
    }

    if (this.sucursalId) {
      this.cargarSucursal();
    }
  }

  private cargarSucursal(): void {
    if (!this.sucursalId) return;

    this.loading = true;
    this.error = false;

    this.apiService.get<Sucursal>(`api/sucursales/establecimientos/${this.sucursalId}/`).subscribe({
      next: (sucursal) => {
        this.sucursal = sucursal;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar sucursal:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  onEdit(): void {
    if (this.sucursalId) {
      this.router.navigate(['/sucursales/edit', this.sucursalId]);
    }
  }

  onBack(): void {
    this.router.navigate(['/sucursales']);
  }

  onDelete(): void {
    if (this.sucursalId && confirm('¿Está seguro de que desea eliminar esta sucursal?')) {
      this.apiService.delete(`api/sucursales/establecimientos`, this.sucursalId).subscribe({
        next: () => {
          console.log('Sucursal eliminada exitosamente');
          this.router.navigate(['/sucursales']);
        },
        error: (err) => {
          console.error('Error al eliminar sucursal:', err);
        }
      });

    }
  }

  getTipoIcon(): string {
    if (!this.sucursal) return 'business';

    const iconMap: { [key: string]: string } = {
      'hospital': 'local_hospital',
      'clinica': 'medical_services',
      'centro_salud': 'health_and_safety',
      'consultorio': 'person_search',
      'laboratorio': 'biotech',
      'farmacia': 'medication'
    };

    return iconMap[this.sucursal.tipo_establecimiento] || 'business';
  }

  getNivelColor(): string {
    if (!this.sucursal) return 'primary';

    const colorMap: { [key: string]: string } = {
      'nivel_1': 'accent',
      'nivel_2': 'primary',
      'nivel_3': 'warn'
    };

    return colorMap[this.sucursal.nivel] || 'primary';
  }

  retry(): void {
    this.cargarSucursal();
  }

  trackByEspecialidad(index: number, especialidad: Especialidad): number {
    return especialidad.id;
  }
}