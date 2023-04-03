import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserLoginDetails } from '../../interface/user-login-details';
import { Observable, Subject, catchError, throwError } from 'rxjs';
import { UserRegisterDetails } from '../../interface/user-register-details';
import { UserInfoWithoutPassword } from '../../interface/user-info-without-password';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private url: string = 'http://localhost:8080/api/user';
  private userLoggedIn: boolean;
  public userLoggedIn$: Subject<boolean> = new Subject<boolean>();

  constructor(private httpClient: HttpClient) {
    this.userLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
  }

  public setUserLoggedIn(isLoggedIn: boolean): void {
    this.userLoggedIn = isLoggedIn;
    const now = new Date();
    const expirationTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
    localStorage.setItem('userLoggedIn', isLoggedIn.toString());
    localStorage.setItem(
      'sessionExpiration',
      expirationTime.getTime().toString()
    );
    this.userLoggedIn$.next(isLoggedIn);
  }

  public getUserLoggedIn(): boolean {
    const now = new Date();
    const sessionExpiration = localStorage.getItem('sessionExpiration');
    const expirationTime = sessionExpiration
      ? parseInt(sessionExpiration, 10)
      : 0; //if sessionExpiration is null, time will be 0

    if (expirationTime && now.getTime() < expirationTime) {
      this.userLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    } else {
      this.userLoggedIn = false;
      localStorage.removeItem('userLoggedIn');
      localStorage.removeItem('sessionExpiration');
    }
    return this.userLoggedIn;
  }

  public verifyUser(userLoginDetails: UserLoginDetails): Observable<boolean> {
    const validateUrl = this.url + '/verify';
    return this.httpClient.post<boolean>(validateUrl, userLoginDetails);
  }

  public registerUser(
    userRegisterDetails: UserRegisterDetails
  ): Observable<UserInfoWithoutPassword> {
    const registerUrl = this.url + '/register';
    return this.httpClient.post<UserInfoWithoutPassword>(
      registerUrl,
      userRegisterDetails
    );
  }
}
