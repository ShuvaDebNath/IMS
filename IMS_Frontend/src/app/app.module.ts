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
import { BeneficiaryListComponent } from './Beneficiary/beneficiary-list/beneficiary-list.component';
import { ArbitrationCreateComponent } from './arbitration/arbitration-create/arbitration-create.component';
import { ArbitrationListComponent } from './arbitration/arbitration-list/arbitration-list.component';
import { BeneficiarybankCreateComponent } from './BeneficiaryBank/beneficiarybank-create/beneficiarybank-create.component';
import { BeneficiaryBankListComponent } from './BeneficiaryBank/beneficiary-bank-list/beneficiary-bank-list.component';
import { ApplicantbankCreateComponent } from './ApplicantBank/applicantbank-create/applicantbank-create.component';
import { ApplicantbankListComponent } from './ApplicantBank/applicantbank-list/applicantbank-list.component';
import { TableModule } from 'primeng/table';
import { GenerateSalesContractComponent } from './sales-contract/generate-sales-contract/generate-sales-contract.component';
import { AllSalesContractComponent } from './sales-contract/all-sales-contract/all-sales-contract.component';
import { SalesContractDetailsComponent } from './sales-contract/sales-contract-details/sales-contract-details.component';
import { UnapprovedBuyingHouseComponent } from './buying-house/unapproved-buying-house/unapproved-buying-house.component';
import { AllBuyingHouseComponent } from './buying-house/all-buying-house/all-buying-house.component';
import { GenerateBuyingHouseComponent } from './buying-house/generate-buying-house/generate-buying-house.component';
import { RmIssueReportComponent } from './warehouse/rm-fg-material-infos-with-stock/rm-issue-report/rm-issue-report.component';
import { PendingRmImportListComponent } from './warehouse/import/pending-rm-import-list/pending-rm-import-list.component';
import { ImportedRmListComponent } from './warehouse/import/imported-rm-list/imported-rm-list.component';
import { RmReturnListToSupplierComponent } from './warehouse/all-return/rm-return-list-to-supplier/rm-return-list-to-supplier.component';
import { RmReturnListFromProductionComponent } from './warehouse/all-return/rm-return-list-from-production/rm-return-list-from-production.component';
import { FinishedGoodReturnListComponent } from './warehouse/all-return/finished-good-return-list/finished-good-return-list.component';

import { ExportRawMaterialComponent } from './export-module/export-raw-material/export-raw-material.component';
import { OtwRawMaterialComponent } from './export-module/otw-raw-material/otw-raw-material.component';
import { BarcodeGenerateComponent } from './production/finishgoods/barcode-generate/barcode-generate.component';
import { SampleRequestFormComponent } from './production/sample-request-form/sample-request-form.component';
import { SampleRequestInsertFormComponent } from './production/sample-request-insert-form/sample-request-insert-form.component';
import { SampleRequestListComponent } from './production/sample-request-list/sample-request-list.component';
import { AllReportComponent } from './report/sample-request/all-report/all-report.component';
import { MessengerReportComponent } from './report/sample-request/messenger-report/messenger-report.component';



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