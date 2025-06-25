import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-side-login',
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: './side-login.component.html',
})
export class AppSideLoginComponent {

  constructor( 
    private router: Router,
    private apiService: ApiService,
  ) {}

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.minLength(6)]),
    password: new FormControl('', [Validators.required]),
  });

  login() {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    const body = {
      email: this.form.value.email,
      password: this.form.value.password
    }
    console.log(body);
    this.apiService.post<any>(`api/usuarios/auth/login/`, body).subscribe({
      next: (body) => {
        console.log('Login exitosamente:', body);
        localStorage.setItem('refresh', body.refresh);
        localStorage.setItem('token', body.access);
        localStorage.setItem('rol', body.user.rol.nombre);
        localStorage.setItem('permisos', body.user.permisos);
        localStorage.setItem('usuario', JSON.stringify(body.user));
        console.log('Cuerpo: ',body.access, body.user.rol, body.user.permisos);
        this.router.navigate(['/user-perfil']);
      }
    });
  }

  submit() {
    // console.log(this.form.value);
    this.router.navigate(['/']);
  }
}
