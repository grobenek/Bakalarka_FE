import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LineChartComponent } from './charts/line-chart/line-chart.component';
import { DatePipe } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { LoginFormComponent } from './pages/login-form/login-form.component';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { TabMenuModule } from 'primeng/tabmenu';
import { LogoutComponent } from './pages/logout/logout.component';
import { MessageService } from 'primeng/api';
import { RegisterFormComponent } from './pages/register-form/register-form.component';
import { DropdownModule } from 'primeng/dropdown';
import { GaugeChartComponent } from './charts/gauge-chart/gauge-chart.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {CalendarModule} from 'primeng/calendar';
import {ListboxModule} from 'primeng/listbox';

@NgModule({
  declarations: [
    AppComponent,
    LineChartComponent,
    LoginFormComponent,
    LogoutComponent,
    RegisterFormComponent,
    GaugeChartComponent,
    DashboardComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
    InputTextModule,
    PasswordModule,
    FormsModule,
    DividerModule,
    ButtonModule,
    ReactiveFormsModule,
    ToastModule,
    MessagesModule,
    MessageModule,
    TabMenuModule,
    DropdownModule,
    OverlayPanelModule,
    CalendarModule,
    ListboxModule
  ],
  providers: [DatePipe, MessageService],
  bootstrap: [AppComponent],
})
export class AppModule {}
