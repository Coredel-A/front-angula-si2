// role.service.ts (Frontend)
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  constructor(private http: HttpClient) {}

  // Obtener todos los roles disponibles desde el backend
  getAllRoles(): Observable<string[]> {
    return this.http.get<string[]>('/api/roles'); // Aquí la URL del endpoint de roles
  }
}
