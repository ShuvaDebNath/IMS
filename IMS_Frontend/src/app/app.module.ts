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
import { Select2Module } from 'ng-select2-component';
import { DatePipe } from '@angular/common';
import { RoleListComponent } from './Roles/role-list/role-list.component';
import { RoleCreateComponent } from './Roles/role-create/role-create.component';
import { MatPaginatorModule } from "@angular/material/paginator";
import { ArbitrationComponent } from './arbitration/arbitration.component';
import { TableComponent } from './common/table/table.component';
import { LandingPageComponent } from './landing-page/landing-page.component';



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
    ArbitrationComponent,
    TableComponent,
    LandingPageComponent

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
