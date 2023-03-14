import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginFormComponent } from './pages/login-form/login-form.component';
import { TestChartComponent } from './pages/test-chart/test-chart.component';
import { LogoutComponent } from './pages/logout/logout.component';
import { AuthGuardService } from './service/auth-guard/auth-guard.service';

const routes: Routes = [
  { path: 'login', component: LoginFormComponent },
  { path: 'dashboard', component: TestChartComponent, canActivate: [AuthGuardService] },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'logout', component: LogoutComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
