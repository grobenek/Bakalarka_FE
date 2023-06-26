import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../user/user.service';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService {
  constructor(
    private userService: UserService,
    private router: Router,
    private messageService: MessageService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (this.userService.getUserLoggedIn()) {
      return true;
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Login required',
        detail: 'You must login to use the app',
      });
      return this.router.createUrlTree(['/login']);
    }
  }
}
