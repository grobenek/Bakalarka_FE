import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { UserService } from './service/user/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  public title: string;
  public menuItems: MenuItem[];
  public activeItem: MenuItem;

  private userLoggedInSubscription!: Subscription;

  constructor(
    private userService: UserService,
    private router: Router,
    private zone: NgZone
  ) {
    this.title = 'bakalarkaFE';
    this.menuItems = [
      { label: 'Dashboard', icon: 'pi pi-desktop', routerLink: '/dashboard' },
    ];
    this.activeItem = this.menuItems[0];
  }

  ngOnInit(): void {
    this.userLoggedInSubscription = this.userService.userLoggedIn$.subscribe(
      () => {
        this.updateMenuItems();
      }
    );
    this.updateMenuItems();

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects;
        this.zone.run(() => {
          this.menuItems.forEach((item) => {
            if (item.routerLink === url) {
              this.activeItem = item;
            }
          });
        });
      }
    });
  }

  private updateMenuItems(): void {
    const isLoggedIn = this.userService.getUserLoggedIn();
    this.menuItems = [
      { label: 'Dashboard', icon: 'pi pi-desktop', routerLink: '/dashboard' },
      isLoggedIn
        ? { label: 'Logout', icon: 'pi pi-sign-out', routerLink: '/logout' }
        : {
            label: 'Login',
            icon: 'pi pi-sign-in',
            routerLink: '/login',
          },
    ];
  }

  ngOnDestroy(): void {
    if (this.userLoggedInSubscription) {
      this.userLoggedInSubscription.unsubscribe();
    }
  }
}
