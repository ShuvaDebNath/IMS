import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { HttpClientModule } from '@angular/common/http';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxSelectModule, INgxSelectOptions } from 'ngx-select-ex';
import { UiSwitchModule } from 'ngx-ui-switch';
import { ModalModule } from 'ngx-bootstrap/modal';
import { MatPaginatorModule } from '@angular/material/paginator';
//Material Data Table;
import { Select2Module } from 'ng-select2-component';
import { TreeTableModule } from 'primeng/treetable';
import { TreeModule } from 'primeng/tree';
import { DropdownModule } from 'primeng/dropdown';
import { SelectButtonModule } from 'primeng/selectbutton';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { DatePipe } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PagesComponent } from './pages.component';
import { BaseContentComponent } from '../dashboard/base-content/base-content.component';
import { HeaderComponent } from '../dashboard/header/header.component';
import { FooterComponent } from '../dashboard/footer/footer.component';
import { SidebarComponent } from '../dashboard/sidebar/sidebar.component';
import { RoleListComponent } from '../Roles/role-list/role-list.component';
import { RoleCreateComponent } from '../Roles/role-create/role-create.component';
import { MenuComponent } from '../dashboard/menu/menu.component';
import { AccessNodeComponent } from '../Roles/access-node/access-node.component';
import { AccessPanelComponent } from '../Roles/access-panel/access-panel.component';
import { CreatePageComponent } from '../production/requisition/raw-material-requisition/create/create-page.component';
import { EditPageComponent } from '../production/requisition/raw-material-requisition/edit/edit-page.component';
import { ListPageComponent } from '../production/requisition/raw-material-requisition/list/list-page.component';
import { PendingRMRequisitionProductionComponent } from '../production/requisition/raw-material-requisition/list/PendingRMRequisition_Production/pending-rm-requisition-production.component';
import { IssuedRMRequisitionProductionComponent } from '../production/requisition/raw-material-requisition/list/IssuedRMRequisition_Production/issued-rm-requisition-production.component';
import { ReceivedRMListComponent } from '../production/requisition/raw-material-requisition/list/ReceivedRMList/received-rm-list.component';
import { AllRMRequisitionListComponent } from '../production/requisition/raw-material-requisition/list/AllRMRequisitionList/all-rm-requisition-list.component';
import { ChangePasswordComponent } from '../authentication/change-password/change-password.component';
import { LandingPageComponent } from '../landing-page/landing-page.component';
import { GenerateLcComponent } from '../lc/generate-lc/generate-lc.component';
import { AllLcComponent } from '../lc/all-lc/all-lc.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { GenerateCommercialInvoiceComponent } from '../commercial-document/generate-commercial-invoice/generate-commercial-invoice.component';
import { AllCommercialInvoiceComponent } from '../commercial-document/all-commercial-invoice/all-commercial-invoice.component';
import { GeneratePiComponent } from '../PI/generate-pi/generate-pi.component';
import { BeneficiaryCreateComponent } from '../Beneficiary/beneficiary-create/beneficiary-create.component';
import { ArbitrationCreateComponent } from '../arbitration/arbitration-create/arbitration-create.component';
import { ArbitrationListComponent } from '../arbitration/arbitration-list/arbitration-list.component';
import { BeneficiarybankCreateComponent } from '../BeneficiaryBank/beneficiarybank-create/beneficiarybank-create.component';
import { BeneficiaryBankListComponent } from '../BeneficiaryBank/beneficiary-bank-list/beneficiary-bank-list.component';
import { ApplicantbankCreateComponent } from '../ApplicantBank/applicantbank-create/applicantbank-create.component';
import { ApplicantbankListComponent } from '../ApplicantBank/applicantbank-list/applicantbank-list.component';
import { AllPiComponent } from '../PI/all-pi/all-pi.component';
import { DeliveredPiComponent } from '../PI/delivered-pi/delivered-pi.component';
import { AllCashReceiveComponent } from '../lc/all-cash-receive/all-cash-receive.component';
import { GenerateCashReceiveComponent } from '../lc/generate-cash-receive/generate-cash-receive.component';
import { CashReceiveDetailsComponent } from '../lc/cash-receive-details/cash-receive-details.component';
import { CashReceiveUpdateComponent } from '../lc/cash-receive-update/cash-receive-update.component';
import { GenerateCpiComponent } from '../PI/generate-cpi/generate-cpi.component';
import { AllSalesContractComponent } from '../sales-contract/all-sales-contract/all-sales-contract.component';
import { SalesContractDetailsComponent } from '../sales-contract/sales-contract-details/sales-contract-details.component';
import { GenerateSalesContractComponent } from '../sales-contract/generate-sales-contract/generate-sales-contract.component';
import { DividerModule } from 'primeng/divider';
import { UnApprovePiComponent } from '../PI/un-approve-pi/un-approve-pi.component';
import { PartialApprovePiComponent } from '../PI/partial-approve-pi/partial-approve-pi.component';
import { QuarterApprovePiComponent } from '../PI/quarter-approve-pi/quarter-approve-pi.component';
import { FullApprovePiComponent } from '../PI/full-approve-pi/full-approve-pi.component';

import { RawMaterialStockComponent } from '../warehouse/rm-fg-material-infos-with-stock/raw-material-info-with-stock/raw-material-stock.component';
import { FinishGoodsInfoWithStockComponent } from '../warehouse/rm-fg-material-infos-with-stock/finish-goods-info-with-stock/finish-goods-info-with-stock.component';
import { BeneficiaryListComponent } from '../Beneficiary/beneficiary-list/beneficiary-list.component';
import { PendingRMRequisitionWareHouseComponent } from '../warehouse/requisition/raw-material-requisition/list/PendingRMRequisition_Warehouse/pending-rm-requisition-warehouse.component';
import { AcceptedRMRequisitionWareHouseComponent } from '../warehouse/requisition/raw-material-requisition/list/AcceptedRMRequisition_Warehouse/accepted-rm-requisition-warehouse.component';
import { IssuedRMRequisitionListWarehouseComponent } from '../warehouse/requisition/raw-material-requisition/list/IssuedRMRequisitionList_Warehouse/issued-rm-requisition-list-warehouse.component';
import { SendFinishGoodsComponent } from '../production/finishgoods/send-finish-goods/send-finish-goods.component';
import { AllCustomersComponent } from '../customer/all-customers/all-customers.component';
import { GenerateCustomerComponent } from '../customer/generate-customer/generate-customer.component';
import { UnapprovedCustomerComponent } from '../customer/unapproved-customer/unapproved-customer.component';
import { UnapprovedBuyingHouseComponent } from '../buying-house/unapproved-buying-house/unapproved-buying-house.component';
import { AllBuyingHouseComponent } from '../buying-house/all-buying-house/all-buying-house.component';
import { GenerateBuyingHouseComponent } from '../buying-house/generate-buying-house/generate-buying-house.component';
import { PendingFinishGoodsSentListProductionComponent } from '../production/finishgoods/pending-finish-goods-sent-list-production/pending-finish-goods-sent-list-production.component';
import { ReceivedFinishGoodsProductionComponent } from '../production/finishgoods/received-finish-goods-list-production/received-finish-goods-list-production.component';
import { PendingFinishGoodsSentListWarehouseComponent } from '../warehouse/finishgoods/pending-finish-goods-sent-list-warehouse/pending-finish-goods-sent-list-warehouse.component';
import { ReceivedFinishGoodsWarehouseComponent } from '../warehouse/finishgoods/received-finish-goods-list-warehouse/received-finish-goods-list-warehouse.component';
import { PiReportComponent } from '../report/pi-report/pi-report.component';
import { PiBottomPriceReportComponent } from '../report/pi-bottom-price-report/pi-bottom-price-report.component';
import { DeliveryLogReportComponent } from '../report/delivery-log-report/delivery-log-report.component';
import { DeliveryComponent } from '../delivery/delivery.component';
import { FinishedGoodReturnListComponent } from '../warehouse/all-return/finished-good-return-list/finished-good-return-list.component';
import { RmReturnListFromProductionComponent } from '../warehouse/all-return/rm-return-list-from-production/rm-return-list-from-production.component';
import { PendingRmImportListComponent } from '../warehouse/import/pending-rm-import-list/pending-rm-import-list.component';
import { ImportedRmListComponent } from '../warehouse/import/imported-rm-list/imported-rm-list.component';
import { RmReturnListToSupplierComponent } from '../warehouse/all-return/rm-return-list-to-supplier/rm-return-list-to-supplier.component';


const CustomSelectOptions: INgxSelectOptions = {
  // Check the interface for more options
  keepSelectedItems: false,
  allowClear: true,
};

@NgModule({
  declarations: [
    BaseContentComponent,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    PagesComponent,
    RoleListComponent,
    RoleCreateComponent,
    MenuComponent,
    AccessNodeComponent,
    AccessPanelComponent,
    ChangePasswordComponent,
    GenerateLcComponent,
    AllLcComponent,
    GenerateCommercialInvoiceComponent,
    AllCommercialInvoiceComponent,
    GeneratePiComponent,
    LandingPageComponent,
    DeliveredPiComponent,
    AllPiComponent,
    AllCashReceiveComponent,
    GenerateCashReceiveComponent,
    CashReceiveDetailsComponent,
    CashReceiveUpdateComponent,
    AllCommercialInvoiceComponent,
    ChangePasswordComponent,
    GeneratePiComponent,
    GenerateCpiComponent,
    AllSalesContractComponent,
    SalesContractDetailsComponent,
    GenerateSalesContractComponent,
    BeneficiaryCreateComponent,
    ArbitrationCreateComponent,
    ArbitrationListComponent,
    BeneficiarybankCreateComponent,
    BeneficiaryBankListComponent,
    ApplicantbankCreateComponent,
    ApplicantbankListComponent,
    PiReportComponent,
    PiBottomPriceReportComponent,
    DeliveryLogReportComponent,
    UnapprovedCustomerComponent,
    GenerateCustomerComponent,
    AllCustomersComponent,
    UnapprovedCustomerComponent,
    UnapprovedBuyingHouseComponent,
    GenerateBuyingHouseComponent,
    AllBuyingHouseComponent,
    GeneratePiComponent,
    BeneficiaryListComponent,  
    PendingRmImportListComponent,
    ImportedRmListComponent,
    RmReturnListToSupplierComponent,
    RmReturnListFromProductionComponent,
    FinishedGoodReturnListComponent  
  ],
  imports: [
    CommonModule,
    Select2Module,
    HttpClientModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    TreeTableModule,
    TreeModule,
    DropdownModule,
    SelectButtonModule,
    PopoverModule,
    MultiSelectModule,
    TableModule,
    DialogModule,
    CheckboxModule,
    InputTextModule,
    PopoverModule,
    DatePipe,
    CheckboxModule,
    InputTextModule,
    PopoverModule,
    DatePipe,
    DividerModule,
    UiSwitchModule.forRoot({
      size: 'small',
      color: 'rgb(0, 189, 99)',
      switchColor: '#80FFA2',
      defaultBgColor: '#00ACFF',
      defaultBoColor: '#476EFF',
      checkedLabel: 'on',
      uncheckedLabel: 'off',
    }),
    ModalModule.forRoot(),
    RouterModule.forChild([
      {
        path: '',
        component: PagesComponent,
        children: [
          { path: 'dashboard', component: BaseContentComponent },
          { path: 'role-list', component: RoleListComponent },
          { path: 'create-role', component: RoleCreateComponent },
          { path: 'access-panel', component: AccessPanelComponent },
          { path: 'create-raw-material', component: CreatePageComponent },
          { path: 'edit-raw-material', component: EditPageComponent },
          { path: 'list-raw-material', component: ListPageComponent },
          {
            path: 'pending-rm-requisition-production',
            component: PendingRMRequisitionProductionComponent,
          },
          {
            path: 'pending-rm-requisition-warehouse',
            component: PendingRMRequisitionWareHouseComponent,
          },
          {
            path: 'accepted-rm-requisition-warehouse',
            component: AcceptedRMRequisitionWareHouseComponent,
          },
          {
            path: 'issued-rm-requisition-production',
            component: IssuedRMRequisitionProductionComponent,
          },
          {
            path: 'received-raw-material-production',
            component: ReceivedRMListComponent,
          },
          {
            path: 'all-rm-requisition-list',
            component: AllRMRequisitionListComponent,
          },
          {
            path: 'issued-rm-requisition-list-warehouse',
            component: IssuedRMRequisitionListWarehouseComponent,
          },
          { path: 'raw-material-stock', component: RawMaterialStockComponent },
          { path: 'finish-goods-stock', component: FinishGoodsInfoWithStockComponent },
          { path: 'send-finish-goods', component: SendFinishGoodsComponent },
          { path: 'pending-fg-sent-list-production', component: PendingFinishGoodsSentListProductionComponent },
          { path: 'received-fg-list-production', component: ReceivedFinishGoodsProductionComponent },
          { path: 'pending-fg-sent-list-warehouse', component: PendingFinishGoodsSentListWarehouseComponent },
          { path: 'received-fg-list-warehouse', component: ReceivedFinishGoodsWarehouseComponent },
          {
            path: 'finish-goods-stock',
            component: FinishGoodsInfoWithStockComponent,
          },
          {
            path: 'pending-rm-requisition/edit/:reqId',
            loadComponent: () =>
              import(
                '../production/requisition/raw-material-requisition/edit/PendingRMRequisitionProduction/pending-rm-requisition-production-edit.component'
              ).then((m) => m.PendingRMRequisitionProductionEditComponent),
          },
          { path: 'change-password', component: ChangePasswordComponent },
          { path: 'landing-page', component: LandingPageComponent },
          { path: 'all-lc', component: AllLcComponent },
          { path: 'generate-lc', component: GenerateLcComponent },
          {
            path: 'all-commercial-invoice',
            component: AllCommercialInvoiceComponent,
          },
          {
            path: 'generate-commercial-invoice',
            component: GenerateCommercialInvoiceComponent,
          },
          { path: 'generate-pi', component: GeneratePiComponent },
          {
            path: 'arbitration-create',
            component: ArbitrationCreateComponent,
          },
          {
            path: 'arbitration-list',
            component: ArbitrationListComponent,
          },
          {
            path: 'beneficiary-create',
            component: BeneficiaryCreateComponent,
          },
          {
            path: 'beneficiarybank-create',
            component: BeneficiarybankCreateComponent,
          },
          {
            path: 'beneficiarybank-list',
            component: BeneficiaryBankListComponent,
          },
          {
            path: 'applicantbank-create',
            component: ApplicantbankCreateComponent,
          },
          {
            path: 'applicantbank-list',
            component: ApplicantbankListComponent,
          },
          { path: 'all-pi', component: AllPiComponent },
          { path: 'delivered-pi', component: DeliveredPiComponent },
          { path: 'all-cash-receive', component: AllCashReceiveComponent },
          {
            path: 'generate-cash-receive',
            component: GenerateCashReceiveComponent,
          },
          {
            path: 'cash-receive-details',
            component: CashReceiveDetailsComponent,
          },
          {
            path: 'cash-receive-update',
            component: CashReceiveUpdateComponent,
          },
          { path: 'generate-cpi', component: GenerateCpiComponent },
          {
            path: 'generate-sales-contract',
            component: GenerateSalesContractComponent,
          },
          { path: 'all-sales-contract', component: AllSalesContractComponent },
          {
            path: 'sales-contract-details',
            component: SalesContractDetailsComponent,
          },
          { path: 'generate-cpi', component: GenerateCpiComponent },
          { path: 'unapproved-pi', component: UnApprovePiComponent },
          { path: 'partialapproved-pi', component: PartialApprovePiComponent },
          { path: 'quarterapproved-pi', component: QuarterApprovePiComponent },
          { path: 'fullapproved-pi', component: FullApprovePiComponent },
          { path: 'pi-report', component: PiReportComponent },
          { path: 'pi-bottom-price-report', component: PiBottomPriceReportComponent },
          { path: 'delivery-log-report', component: DeliveryLogReportComponent },
          { path: 'fullapproved-pi', component: FullApprovePiComponent },
          { path: 'pending-rm-import-list', component: PendingRmImportListComponent },
          { path: 'imported-rm-list', component: ImportedRmListComponent },
          { path: 'rm-return-list-to', component: RmReturnListToSupplierComponent },
          { path: 'rm-return-from-production', component: RmReturnListFromProductionComponent },
          { path: 'finished-good-return-list', component: FinishedGoodReturnListComponent }
        ],
      },

    ]),
    BrowserAnimationsModule,
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgxSelectModule.forRoot(CustomSelectOptions),
    AccordionModule.forRoot(),
    UiSwitchModule,
    MatPaginatorModule,
  ],
})
export class PagesModule {}