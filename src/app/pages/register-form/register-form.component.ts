import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError, Subscription, throwError } from 'rxjs';
import { UserService } from 'src/app/service/user/user.service';
import { UserRegisterDetails } from '../../interface/user-register-details';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss'],
})
export class RegisterFormComponent implements OnDestroy {
  public isLoading!: boolean;
  public registerFormGroup!: FormGroup;
  public registerSubscription!: Subscription;

  constructor(
    private messageService: MessageService,
    private userService: UserService,
    private router: Router
  ) {
    this.initialize();
  }
  ngOnDestroy(): void {
    if (this.registerSubscription) {
      this.registerSubscription.unsubscribe();
    }
  }

  private initialize(): void {
    this.isLoading = false;
    this.registerFormGroup = new FormGroup({
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
      ]),
      firstname: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
      ]),
      lastname: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  public registerSubmit(): void {
    this.isLoading = true;

    const userRegisterDetails: UserRegisterDetails = {
      username: this.registerFormGroup.get('username')?.value || '',
      password: this.registerFormGroup.get('password')?.value || '',
      firstname: this.registerFormGroup.get('firstname')?.value || '',
      lastname: this.registerFormGroup.get('lastname')?.value || '',
      email: this.registerFormGroup.get('email')?.value || '',
    };

    this.registerSubscription = this.userService
      .registerUser(userRegisterDetails)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error has occured',
            detail: error.error,
            closable: false,
          });
          this.isLoading = false;
          return throwError(() => error);
        })
      )
      .subscribe({
        complete: () => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
      });
  }
}
