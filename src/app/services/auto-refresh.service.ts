import { Injectable } from '@angular/core';
import { interval, BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AutoRefreshService {
  private datosActualizados$ = new BehaviorSubject<any>(null); // para compartir los datos

  constructor(private apiService: ApiService) {
    this.startAutoFetch();
  }

  private startAutoFetch() {
    // Llamada inmediata
    this.fetchData();

    // Luego cada 10 minutos
    interval(10 * 60 * 1000).pipe(
      switchMap(() => this.apiService.get<any>('api/especialidades/')) // cambia 'mi-endpoint'
    ).subscribe(data => {
      console.log('Actualización automática:', data);
      this.datosActualizados$.next(data);
    });
  }

  private fetchData() {
    this.apiService.get<any>('mi-endpoint').subscribe(data => {
      console.log('Primera llamada automática:', data);
      this.datosActualizados$.next(data);
    });
  }

  // Método para que otros componentes escuchen los datos actualizados
  getDatosActualizados$() {
    return this.datosActualizados$.asObservable();
  }
}
