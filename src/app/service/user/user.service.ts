import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserLoginDetails } from '../../interface/userLoginDetails';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private url: string = 'http://localhost:8080/api/user';
  private userLoggedIn: boolean = false;
  public userLoggedIn$: Subject<boolean> = new Subject<boolean>();

  constructor(private httpClient: HttpClient) {}

  public setUserLoggedIn(isLoggedIn: boolean): void {
    this.userLoggedIn = isLoggedIn;
    this.userLoggedIn$.next(isLoggedIn);
  }

  public getUserLoggedIn(): boolean {
    return this.userLoggedIn;
  }

  public verifyUser(userLoginDetails: UserLoginDetails): Observable<boolean> {
    const validateUrl = this.url + '/verify';
    return this.httpClient.post<boolean>(validateUrl, userLoginDetails);
  }
}
