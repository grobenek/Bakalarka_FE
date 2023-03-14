import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginFormComponent } from './pages/login-form/login-form.component';
import { TestChartComponent } from './pages/test-chart/test-chart.component';
import { LogoutComponent } from './pages/logout/logout.component';
import { AuthGuardService } from './service/auth-guard/auth-guard.service';
import { RegisterFormComponent } from './pages/register-form/register-form.component';

const routes: Routes = [
  { path: 'login', component: LoginFormComponent },
  {
    path: 'dashboard',
    component: TestChartComponent,
    canActivate: [AuthGuardService],
  },
  { path: 'logout', component: LogoutComponent },
  { path: 'register', component: RegisterFormComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
