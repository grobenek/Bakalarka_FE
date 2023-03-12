import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserLoginDetails } from '../../interface/userLoginDetails';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private url: string = 'http://localhost:8080/api/user';

  constructor(private httpClient: HttpClient) {}

  public verifyUser(userLoginDetails: UserLoginDetails): Observable<boolean> {
    const validateUrl = this.url + '/verify';
    return this.httpClient.post<boolean>(validateUrl, userLoginDetails);
  }

}
