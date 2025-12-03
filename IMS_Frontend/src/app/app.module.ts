import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PagesModule } from './pages/pages.module';
import { PageNotFoundComponent } from './error/page-not-found/page-not-found.component';
import { InternalServerErrorComponent } from './error/internal-server-error/internal-server-error.component';
import { ForbiddenErrorComponent } from './error/forbidden-error/forbidden-error.component';
import { LogoutComponent } from './authentication/logout/logout.component';
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';
import { LoginComponent } from './authentication/login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxSelectModule, INgxSelectOptions } from 'ngx-select-ex';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { DatePipe } from '@angular/common';
import { MatPaginatorModule } from "@angular/material/paginator";
import { GenerateTaskReportComponent } from './task-report/generate-task-report/generate-task-report.component';
import { AllTaskReportComponent } from './task-report/all-task-report/all-task-report.component';
import { AllTaskDetailsReportComponent } from './task-report/all-task-details-report/all-task-details-report.component';
import { CancelPiApplicationComponent } from './application/cancel-pi-application/cancel-pi-application.component';
import { ExchangeGoodsApplicationComponent } from './application/exchange-goods-application/exchange-goods-application.component';
import { ReturnGoodsApplicationComponent } from './application/return-goods-application/return-goods-application.component';



const CustomSelectOptions: INgxSelectOptions = {
  keepSelectedItems: false,
  allowClear: true,
};

@NgModule({
  declarations: [	
    AppComponent,
    LoginComponent,
    PageNotFoundComponent,
    InternalServerErrorComponent,
    ForbiddenErrorComponent,
    PageNotFoundComponent,
    LogoutComponent,
    ResetPasswordComponent,
  ],

  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgxDatatableModule,
    NgMultiSelectDropDownModule.forRoot(),
    RouterModule.forRoot([
        { path: '', component: LoginComponent },
        {
            path: 'pages',
            loadChildren: () => import('./pages/pages.module').then((m) => m.PagesModule),
        },
        { path: 'login', component: LoginComponent },
        { path: '**', component: PageNotFoundComponent },
    ], { useHash: false, onSameUrlNavigation: 'reload' }),
    PagesModule,
    BrowserAnimationsModule,
    NgxSelectModule.forRoot(CustomSelectOptions),
    BsDropdownModule.forRoot(),
    MatPaginatorModule,
],
exports:[

],
  providers: [DatePipe],
  bootstrap: [AppComponent],
})
export class AppModule {}