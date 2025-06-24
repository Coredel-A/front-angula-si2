// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private usuario: any = null;

  setUsuario(usuario: any) {
    this.usuario = usuario;
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }

  getUsuario(): any {
    if (!this.usuario) {
      const stored = localStorage.getItem('usuario');
      this.usuario = stored ? JSON.parse(stored) : null;
    }
    return this.usuario;
  }

  getUsuarioId(): number | null {
    return this.getUsuario()?.id || null;
  }

  clear() {
    this.usuario = null;
    localStorage.removeItem('usuario');
  }

  getAllowedRoles(): string[] {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const allowedRoles = user?.rol?.nombre ? [user.rol.nombre] : [];
    return allowedRoles;
  }
}
