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
import { LandingPageComponent } from './landing-page/landing-page.component';
import { BeneficiaryCreateComponent } from './Beneficiary/beneficiary-create/beneficiary-create.component';
import { BeneficiaryListComponent } from './beneficiary/beneficiary-list/beneficiary-list.component';
import { ArbitrationCreateComponent } from './arbitration/arbitration-create/arbitration-create.component';
import { ArbitrationListComponent } from './arbitration/arbitration-list/arbitration-list.component';
import { BeneficiarybankCreateComponent } from './BeneficiaryBank/beneficiarybank-create/beneficiarybank-create.component';
import { BeneficiaryBankListComponent } from './BeneficiaryBank/beneficiary-bank-list/beneficiary-bank-list.component';
import { ApplicantbankCreateComponent } from './ApplicantBank/applicantbank-create/applicantbank-create.component';
import { ApplicantbankListComponent } from './ApplicantBank/applicantbank-list/applicantbank-list.component';


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
    BeneficiaryCreateComponent,
    BeneficiaryListComponent,
    ArbitrationCreateComponent,
    ArbitrationListComponent,
    BeneficiarybankCreateComponent,
    BeneficiaryBankListComponent,
    ApplicantbankCreateComponent,
    ApplicantbankListComponent

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
