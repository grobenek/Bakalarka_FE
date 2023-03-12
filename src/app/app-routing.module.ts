import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginFormComponent } from './pages/login-form/login-form.component';
import { TestChartComponent } from './pages/test-chart/test-chart.component';

const routes: Routes = [
  { path: '', component: LoginFormComponent },
  { path: 'dashboard', component: TestChartComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
