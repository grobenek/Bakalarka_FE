import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Temperature } from '../../interface/temperature';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class TemperatureService {
  private url: string = 'http://localhost:8080/api/temperature';

  constructor(
    private httpClient: HttpClient,
    private messageService: MessageService
  ) {}

  public getAllTemperatures(): Observable<Temperature[]> {
    return this.httpClient.get<Temperature[]>(this.url).pipe(
      catchError((error: Error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Server error has occurred',
          closable: false,
        });
        return throwError(() => error);
      })
    );
  }

  public getTemperaturesBetweenDates(
    startDate: Date,
    endDate: Date
  ): Observable<Temperature[]> {
    const startIsoString = startDate.toISOString();
    const endIsoString = endDate.toISOString();
    const url = `${this.url}/between/${startIsoString}/${endIsoString}`;
    return this.httpClient.get<Temperature[]>(url).pipe(
      catchError((error: Error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Server error has occurred',
          closable: false,
        });
        return throwError(() => error);
      })
    );
  }

  public getTemperaturesSince(since: Date): Observable<Temperature[]> {
    let sinceString: string = since.toISOString();
    let url = `${this.url}/since/${sinceString}`;
    return this.httpClient.get<Temperature[]>(url).pipe(
      catchError((error: Error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Server error has occurred',
          closable: false,
        });
        return throwError(() => error);
      })
    );
  }
}
