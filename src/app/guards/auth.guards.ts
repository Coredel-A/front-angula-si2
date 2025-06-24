import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { RoleService } from '../services/role.service';
import { Observable } from 'rxjs';

export const authGuard: (roles?: string[]) => CanActivateFn =
  (allowedRoles: string[] = []) => () => {
    const router = inject(Router);
    const token = localStorage.getItem('token');
    const roles = localStorage.getItem('rol');

    if (!token) {
      router.navigate(['/authentication/login']);
      return false;
    }

    const roleService = inject(RoleService);
    
    return new Observable<boolean>((observer) => {
      roleService.getAllRoles().subscribe((rolesAllowed) => {
        if (rolesAllowed.length && !rolesAllowed.includes(roles || '')) {
          console.log('Rol obtenido: ', roles);
          router.navigate(['/no-autorizado']);
          observer.next(false);  // Bloquear el acceso
          observer.complete();
        } else {
          observer.next(true);  // Permitir el acceso
          observer.complete();
        }
      }, (error) => {
        console.error('Error al obtener los roles', error);
        router.navigate(['/no-autorizado']);
        observer.next(false);
        observer.complete();
      });
    });

    /*if (allowedRoles.length && !allowedRoles.includes(roles || '')) {
      console.log('Rol obtenido: ', roles);
      router.navigate(['/no-autorizado']);
      return false;
    }*/

    //return true;
  };