import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/service/user/user.service';

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
        Validators.minLength(2)
      ]),
      lastname: new FormControl('', [
        Validators.required,
        Validators.minLength(2)
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.email
      ])
    })
  }

  public registerSubmit(): void {}
}
