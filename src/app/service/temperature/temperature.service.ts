import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Temperature } from '../../interface/temperature';

@Injectable({
  providedIn: 'root',
})
export class TemperatureService {
  private url: string = 'http://localhost:8080/api/temperature';

  constructor(private httpClient: HttpClient) {}

  public getAllTemperatures(): Observable<Temperature[]> {
    return this.httpClient.get<Temperature[]>(this.url);
  }

  public getTemperaturesBetweenDates(
    startDate: Date,
    endDate: Date
  ): Observable<Temperature[]> {
    const startIsoString = startDate.toISOString();
    const endIsoString = endDate.toISOString();
    const url = `${this.url}/${startIsoString}/${endIsoString}`;
    return this.httpClient.get<Temperature[]>(url);
  }

  public getTemperaturesSince(since: Date): Observable<Temperature[]> {
    let sinceString: string = since.toISOString();
    let url = `${this.url}/since/${sinceString}`;
    return this.httpClient.get<Temperature[]>(url);
  }
}
