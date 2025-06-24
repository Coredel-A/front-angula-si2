import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment.prod';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private baseUrl = environment.apiUrl;

    private defaultHeaders = new HttpHeaders({
        'Content-Type': 'application/json',
        //  'myHeaders' : 'cualquierCosa'
    });

    constructor(private http: HttpClient) { }
    // Método para obtener los headers, incluyendo el token si está disponible
    get<T>(endpoint: string, params?: any): Observable<T> {
        return this.http.get<T>(`${this.baseUrl}/${endpoint}`, {
            headers: this.defaultHeaders,
            params: params
        });
    }

    post<T>(endpoint: string, body: any, headers = 0): Observable<T> {
        return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, {
            headers: !headers ? this.defaultHeaders : undefined,
        });
    }

    put<T>(endpoint: string, id: string | number, body: any, headers = 0): Observable<T> {
        return this.http.put<T>(`${this.baseUrl}/${endpoint}/${id}/`, body, {
            headers: !headers ? this.defaultHeaders : undefined
        });
    }

    delete<T>(endpoint: string, id: string | number): Observable<T> {
        return this.http.delete<T>(`${this.baseUrl}/${endpoint}/${id}/`, {
            headers: this.defaultHeaders
        });
    }

    patch<T>(endpoint: string, id: number | string, pathSuffix: string = '', body: any): Observable<T> {
        // Concatenamos el `pathSuffix` si es proporcionado
        return this.http.patch<T>(`${this.baseUrl}/${endpoint}/${id}/${pathSuffix}`, body, {
            headers: this.defaultHeaders
        });
    }

    postFormData<T>(endpoint: string, formData: FormData): Observable<T> {
        return this.http.post<T>(`${this.baseUrl}/${endpoint}`, formData, {
            headers: new HttpHeaders({
                'Accept': 'application/json', // Especifica el tipo de respuesta que esperas
            }),
        });
    }
}