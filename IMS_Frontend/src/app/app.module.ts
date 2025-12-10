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
import { ColorListComponent } from './master-entry/color/color-list/color-list.component';
import { ColorCreateComponent } from './master-entry/color/color-create/color-create.component';
import { DeliveyConditionListComponent } from './master-entry/Delivery-Condition/delivey-condition-list/delivey-condition-list.component';
import { DeliveyConditionCreateComponent } from './master-entry/Delivery-Condition/delivey-condition-create/delivey-condition-create.component';
import { TermsOfDeliveryListComponent } from './master-entry/Terms-of-Delivery/terms-of-delivery-list/terms-of-delivery-list.component';
import { TermsOfDeliveryCreateComponent } from './master-entry/Terms-of-Delivery/terms-of-delivery-create/terms-of-delivery-create.component';
import { ForceMajeureListComponent } from './master-entry/Force-Majeure/force-majeure-list/force-majeure-list.component';
import { ForceMajeureCreateComponent } from './master-entry/Force-Majeure/force-majeure-create/force-majeure-create.component';
import { LoadingModeListComponent } from './master-entry/Loading-Mode/loading-mode-list/loading-mode-list.component';
import { LoadingModeCreateComponent } from './master-entry/Loading-Mode/loading-mode-create/loading-mode-create.component';
import { PackagingListComponent } from './master-entry/Packaging/packaging-list/packaging-list.component';
import { PackagingCreateComponent } from './master-entry/Packaging/packaging-create/packaging-create.component';
import { PackingListComponent } from './master-entry/Packing/packing-list/packing-list.component';
import { PackingCreateComponent } from './master-entry/Packing/packing-create/packing-create.component';
import { PaymentTermsListComponent } from './master-entry/Payment-Terms/payment-terms-list/payment-terms-list.component';
import { PaymentTermsCreateComponent } from './master-entry/Payment-Terms/payment-terms-create/payment-terms-create.component';
import { PriceTermsListComponent } from './master-entry/Price-Terms/price-terms-list/price-terms-list.component';
import { PriceTermsCreateComponent } from './master-entry/Price-Terms/price-terms-create/price-terms-create.component';
import { ShipmentConditionListComponent } from './master-entry/Shipment-Condition/shipment-condition-list/shipment-condition-list.component';
import { ShipmentConditionCreateComponent } from './master-entry/Shipment-Condition/shipment-condition-create/shipment-condition-create.component';
import { PIBottomPriceCreateComponent } from './master-entry/PI-Bottom-Price/pi-bottom-price-create/pi-bottom-price-create.component';
import { PIBottomPriceListComponent } from './master-entry/PI-Bottom-Price/pi-bottom-price-list/pi-bottom-price-list.component';
import { WidthListComponent } from './master-entry/Width/width-list/width-list.component';
import { WidthCreateComponent } from './master-entry/Width/width-create/width-create.component';
import { UnitListComponent } from './master-entry/Unit/unit-list/unit-list.component';
import { UnitCreateComponent } from './master-entry/Unit/unit-create/unit-create.component';
import { RawMaterialListComponent } from './master-entry/Raw-Material/raw-material-list/raw-material-list.component';
import { RawMaterialCreateComponent } from './master-entry/Raw-Material/raw-material-create/raw-material-create.component';
import { MaterialListComponent } from './master-entry/Material/material-list/material-list.component';
import { MaterialCreateComponent } from './master-entry/Material/material-create/material-create.component';



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