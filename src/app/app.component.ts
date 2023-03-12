import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { UserService } from './service/user/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  public title: string = 'bakalarkaFE';
  public menuItems: MenuItem[] = [];

  private userLoggedInSubscription!: Subscription;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userLoggedInSubscription = this.userService.userLoggedIn$.subscribe(
      () => {
        this.updateMenuItems();
      }
    );
    this.updateMenuItems();
  }

  private updateMenuItems(): void {
    const isLoggedIn = this.userService.getUserLoggedIn();
    this.menuItems = [
      { label: 'Dashboard', icon: 'pi pi-desktop', routerLink: '/dashboard' },
      isLoggedIn
        ? { label: 'Logout', icon: 'pi pi-sign-out', routerLink: '/logout' }
        : { label: 'Login', icon: 'pi pi-sign-in', routerLink: '/login' },
    ];
  }

  ngOnDestroy(): void {
    if (this.userLoggedInSubscription) {
      this.userLoggedInSubscription.unsubscribe();
    }
  }
}
