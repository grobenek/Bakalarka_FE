import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { UserService } from '../../service/user/user.service';
import { Observable, catchError, of, tap, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { UserLoginDetails } from '../../interface/user-login-details';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  providers: [MessageService],
})
export class LoginFormComponent implements OnDestroy {
  public isLoading!: boolean;
  public loginFormGroup!: FormGroup;
  public loginSubscription!: Subscription;

  constructor(
    private messageService: MessageService,
    private userService: UserService,
    private router: Router
  ) {
    this.initialize();
  }

  initialize() {
    this.isLoading = false;
    this.loginFormGroup = new FormGroup({
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
      ]),
    });
  }

  handleLoginResult(result: boolean, jwtToken: string): void {
    if (result) {
      this.userService.setUserLoggedIn(result);
      this.userService.setJwtToken(jwtToken);
      this.router.navigate(['dashboard']);
    } else {
      this.messageService.add({
        severity: 'error',
        detail: 'Invalid username or password',
        closable: false,
      });
    }
  }

  handleError(error: HttpErrorResponse): Observable<string> {
    if (error.status === 404) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error has occured',
        detail: 'Invalid username or password',
        closable: false,
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error has occured',
        detail: 'Server error occured',
        closable: false,
      });
    }
    return of(error.message); // Return a new Observable with the error message to continue the stream
  }

  loginSubmit(): void {
    this.isLoading = true;

    const userLoginDetails: UserLoginDetails = {
      username: this.loginFormGroup.get('username')?.value || '',
      password: this.loginFormGroup.get('password')?.value || '',
    };

    this.loginSubscription = this.userService
      .verifyUser(userLoginDetails)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.handleError(error);
        })
      )
      .subscribe({
        next: (response: any) => {
          const jwtToken = response.headers.get('Authorization');

          this.handleLoginResult(response.body, jwtToken);
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  registerClicked(): void {
    this.router.navigate(['register']);
  }

  ngOnDestroy() {
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }
}
