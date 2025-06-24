import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";


export const authInterceptor: HttpInterceptorFn = (req:HttpRequest<any>, next: HttpHandlerFn) => {
  const token = localStorage.getItem('token'); // Obtener el token del localStorage
  if(token){
    const authRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}` // Agregar el token al header de la solicitud
      }
    });
    return next(authRequest); // Pasar la solicitud modificada al siguiente interceptor o al manejador de solicitudes
  }
  return next(req);
};