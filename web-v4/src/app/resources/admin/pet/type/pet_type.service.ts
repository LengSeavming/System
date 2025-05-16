// ================================================================>> Core Library (Angular)
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

// ================================================================>> Third-Party Library (RxJS)
import { Observable, catchError, of, switchMap, tap } from 'rxjs';

// ================================================================>> Custom Library
import { env } from 'envs/env';
import { Data, List } from './pet_type.types';

// Injectable decorator is used to define the service as a provider
@Injectable({
    providedIn: 'root',
})
export class PetTypeService {
    constructor(private httpClient: HttpClient) {}

    // Method to retrieve a list of product types from the backend
    list(): Observable<List> {
        return this.httpClient
            .get<List>(`${env.API_BASE_URL}/admin/pet/types/data`, {
                headers: new HttpHeaders().set(
                    'Content-Type',
                    'application/json'
                ),
            })
            .pipe(
                switchMap((response: List) => {
                    return of(response);
                }),

                catchError((error) => {
                    return new Observable((observer) => {
                        observer.error(error);
                        observer.complete();
                    });
                }),

                tap((_response: List) => {})
            );
    }

    // Method to create a new product type
    create(body: {
        name: string;
        image: string;
    }): Observable<{ data: Data; message: string }> {
        return this.httpClient.post<{ data: Data; message: string }>(
            `${env.API_BASE_URL}/admin/pet/types`,
            body,
            {
                headers: new HttpHeaders().set(
                    'Content-Type',
                    'application/json'
                ),
            }
        );
    }

    // Method to update an existing product type
    update(
        id: number,
        body: { name: string; image: string }
    ): Observable<{ data: Data; message: string }> {
        return this.httpClient.put<{ data: Data; message: string }>(
            `${env.API_BASE_URL}/admin/pet/types/${id}`,
            body,
            {
                headers: new HttpHeaders().set(
                    'Content-Type',
                    'application/json'
                ),
            }
        );
    }

    // Method to delete an existing product type
    delete(
        id: number = 0
    ): Observable<{ status_code: number; message: string }> {
        return this.httpClient.delete<{ status_code: number; message: string }>(
            `${env.API_BASE_URL}/admin/pet/types/${id}`,
            {
                headers: new HttpHeaders().set(
                    'Content-Type',
                    'application/json'
                ),
            }
        );
    }
}
