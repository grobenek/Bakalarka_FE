import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, map, filter } from 'rxjs';
import { GaugeElectricData } from '../../interface/gauge-electric-data';
import { MessageService } from 'primeng/api';
import { ElectricQuantities } from 'src/app/interface/electric-quantities';
import { ElectricPhase } from 'src/app/interface/electric-phase';
import {
  ElectricData,
  ElectricDataMinMaxMean,
} from 'src/app/interface/electric-data';

@Injectable({
  providedIn: 'root',
})
export class ElectricService {
  private url: string = 'http://localhost:8080/api/electric-quantities';

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) {}

  public getLastElectricQuantity(
    electricQuantity: ElectricQuantities,
    currentPhaseFilters?: ElectricPhase[],
    voltagePhaseFilters?: ElectricPhase[]
  ): Observable<GaugeElectricData> {
    const url: string = this.url + '/last';
    const currentPhaseFiltersString = currentPhaseFilters
      ? currentPhaseFilters.join(',')
      : '';
    const voltagePhaseFiltersString = voltagePhaseFilters
      ? voltagePhaseFilters.join(',')
      : '';

    const params = new HttpParams()
      .set('electricQuantities', electricQuantity)
      .set('currentPhaseFilters', currentPhaseFiltersString)
      .set('voltagePhaseFilters', voltagePhaseFiltersString);

    return this.http.get<any>(url, { params }).pipe(
      map((data) => {
        let transformedData: GaugeElectricData | null = null;

        if (data.currents && data.currents.length > 0) {
          const current = data.currents[0];
          transformedData = {
            value: current.current,
            type: 'current',
          };
        } else if (data.gridFrequencies && data.gridFrequencies.length > 0) {
          const gridFrequency = data.gridFrequencies[0];
          transformedData = {
            value: gridFrequency.frequency,
            type: 'gridFrequency',
          };
        } else if (data.voltages && data.voltages.length > 0) {
          const voltage = data.voltages[0];
          transformedData = {
            value: voltage.voltage,
            type: 'voltage',
          };
        }

        return transformedData;
      }),
      filter((data): data is GaugeElectricData => data !== null),
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

  public getAllElectricQuantitiesBetweenDates(
    startDate: Date,
    endDate: Date,
    electricQuantities: ElectricQuantities[],
    currentPhaseFilters?: ElectricPhase[],
    voltagePhaseFilters?: ElectricPhase[]
  ): Observable<ElectricData> {
    const startIsoString = encodeURIComponent(startDate.toISOString());
    const endIsoString = encodeURIComponent(endDate.toISOString());
    const url: string = this.url + `/between/${startIsoString}/${endIsoString}`;

    const currentPhaseFiltersString = currentPhaseFilters
      ? currentPhaseFilters.join(',')
      : '';
    const voltagePhaseFiltersString = voltagePhaseFilters
      ? voltagePhaseFilters.join(',')
      : '';

    const params = new HttpParams()
      .set('electricQuantities', electricQuantities.join(','))
      .set('currentPhaseFilters', currentPhaseFiltersString)
      .set('voltagePhaseFilters', voltagePhaseFiltersString);

    return this.http.get<ElectricData>(url, { params }).pipe(
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

  public getLastNValues(
    count: number,
    electricQuantities: ElectricQuantities[],
    currentPhaseFilters?: ElectricPhase[],
    voltagePhaseFilters?: ElectricPhase[]
  ): Observable<ElectricData> {
    const url: string = this.url + `/last/${count}`;
    const currentPhaseFiltersString = currentPhaseFilters
      ? currentPhaseFilters.join(',')
      : '';
    const voltagePhaseFiltersString = voltagePhaseFilters
      ? voltagePhaseFilters.join(',')
      : '';

    const params = new HttpParams()
      .set('electricQuantities', electricQuantities.join(','))
      .set('currentPhaseFilters', currentPhaseFiltersString)
      .set('voltagePhaseFilters', voltagePhaseFiltersString);

    return this.http.get<ElectricData>(url, { params }).pipe(
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

  public getElectricQuantitiesSince(
    sinceDate: Date,
    electricQuantities: ElectricQuantities[],
    currentPhaseFilters?: ElectricPhase[],
    voltagePhaseFilters?: ElectricPhase[]
  ): Observable<ElectricDataMinMaxMean> {
    const sinceDateIsoString: string = encodeURIComponent(
      sinceDate.toISOString()
    );
    const url: string = this.url + `/since/${sinceDateIsoString}`;
    const currentPhaseFiltersString = currentPhaseFilters
      ? currentPhaseFilters.join(',')
      : '';
    const voltagePhaseFiltersString = voltagePhaseFilters
      ? voltagePhaseFilters.join(',')
      : '';

    const params = new HttpParams()
      .set('electricQuantities', electricQuantities.join(','))
      .set('currentPhaseFilters', currentPhaseFiltersString)
      .set('voltagePhaseFilters', voltagePhaseFiltersString);

    return this.http.get<ElectricDataMinMaxMean>(url, { params }).pipe(
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

  public getGroupedElectricQuantitiesBetweenDate(
    startDate: Date,
    endDate: Date,
    electricQuantities: ElectricQuantities[],
    currentPhaseFilters?: ElectricPhase[],
    voltagePhaseFilters?: ElectricPhase[]
  ): Observable<ElectricDataMinMaxMean> {
    const startIsoString: string = encodeURIComponent(startDate.toISOString());
    const endIsoString: string = encodeURIComponent(endDate.toISOString());
    const url: string =
      this.url + `/grouped/between/${startIsoString}/${endIsoString}`;
    const currentPhaseFiltersString = currentPhaseFilters
      ? currentPhaseFilters.join(',')
      : '';
    const voltagePhaseFiltersString = voltagePhaseFilters
      ? voltagePhaseFilters.join(',')
      : '';

    const params = new HttpParams()
      .set('electricQuantities', electricQuantities.join(','))
      .set('currentPhaseFilters', currentPhaseFiltersString)
      .set('voltagePhaseFilters', voltagePhaseFiltersString);

    return this.http.get<ElectricDataMinMaxMean>(url, { params }).pipe(
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

  public getAllElectricQuantitiesFromDate(
    startDate: Date,
    electricQuantities: ElectricQuantities[],
    currentPhaseFilters?: ElectricPhase[],
    voltagePhaseFilters?: ElectricPhase[]
  ): Observable<ElectricDataMinMaxMean> {
    const startDateIsoString: string = encodeURIComponent(
      startDate.toISOString()
    );
    const url: string = this.url + `/${startDateIsoString}`;
    const currentPhaseFiltersString = currentPhaseFilters
      ? currentPhaseFilters.join(',')
      : '';
    const voltagePhaseFiltersString = voltagePhaseFilters
      ? voltagePhaseFilters.join(',')
      : '';

    const params = new HttpParams()
      .set('electricQuantities', electricQuantities.join(','))
      .set('currentPhaseFilters', currentPhaseFiltersString)
      .set('voltagePhaseFilters', voltagePhaseFiltersString);

    return this.http.get<ElectricDataMinMaxMean>(url, { params }).pipe(
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
