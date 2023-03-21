import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Temperature } from '../../interface/temperature';
import { MessageService } from 'primeng/api';
import { TemperatureMinMaxMean } from '../../interface/temperature-min-max-mean';

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
    const startIsoString = encodeURIComponent(startDate.toISOString());
    const endIsoString = encodeURIComponent(endDate.toISOString());
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
    let sinceString: string = encodeURIComponent(since.toISOString());
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

  public getLastTemperature(): Observable<Temperature> {
    let url = this.url + '/last';
    return this.httpClient.get<Temperature>(url).pipe(
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

  public getGroupedTemperaturesBetweenDate(
    startDate: Date,
    endDate: Date
  ): Observable<TemperatureMinMaxMean> {
    const startIsoString = encodeURIComponent(startDate.toISOString());
    const endIsoString = encodeURIComponent(endDate.toISOString());

    const url = `${this.url}/grouped/between/${startIsoString}/${endIsoString}`;
    return this.httpClient.get<TemperatureMinMaxMean>(url).pipe(
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

  public getTemperaturesFromDate(startDate: Date): Observable<TemperatureMinMaxMean> {
    const startDateIsoString = encodeURIComponent(startDate.toISOString());
    const url = `${this.url}/${startDateIsoString}`;
    return this.httpClient.get<TemperatureMinMaxMean>(url).pipe(
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
