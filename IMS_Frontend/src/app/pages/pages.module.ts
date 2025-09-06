import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { NgxBootstrapTreeviewModule } from 'ngx-bootstrap-treeview';
import { HttpClientModule } from '@angular/common/http';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxSelectModule,INgxSelectOptions } from 'ngx-select-ex';
import { UiSwitchModule } from 'ngx-ui-switch';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TreeTableModule } from 'primeng/treetable';
import { TreeModule } from 'primeng/tree';
import { DropdownModule } from 'primeng/dropdown'
import { SelectButtonModule } from 'primeng/selectbutton';
import {PopoverModule} from 'ngx-bootstrap/popover';
import {DatePipe} from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
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
import { ChangePasswordComponent } from '../authentication/change-password/change-password.component';
<<<<<<< .mine
import { GenerateCashReceiveComponent } from '../lc/generate-cash-receive/generate-cash-receive.component';
import { AllCashReceiveComponent } from '../lc/all-cash-receive/all-cash-receive.component';
import { TableModule } from 'primeng/table';






=======
import { LandingPageComponent } from '../landing-page/landing-page.component';
import { GenerateLcComponent } from '../lc/generate-lc/generate-lc.component';
import { AllLcComponent } from '../lc/all-lc/all-lc.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import {DialogModule} from 'primeng/dialog'
import { GenerateCommercialInvoiceComponent } from '../commercial-document/generate-commercial-invoice/generate-commercial-invoice.component';
import { AllCommercialInvoiceComponent } from '../commercial-document/all-commercial-invoice/all-commercial-invoice.component';
import { GeneratePiComponent } from '../PI/generate-pi/generate-pi.component';
>>>>>>> .theirs

<<<<<<< .mine
// import {MatSortModule} from '@angular/material/sort';
// import {MatTableModule} from '@angular/material/table';
//!--Material Data Table

=======




>>>>>>> .theirs
const CustomSelectOptions: INgxSelectOptions = { // Check the interface for more options
  keepSelectedItems:false,
  allowClear:true
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
<<<<<<< .mine
    GenerateCashReceiveComponent,
    ChangePasswordComponent,
    AllCashReceiveComponent



=======
    ChangePasswordComponent,
    GenerateLcComponent,
    AllLcComponent,
    GenerateCommercialInvoiceComponent,
    AllCommercialInvoiceComponent
    GeneratePiComponent
>>>>>>> .theirs
    ],
  imports: [

    NgSelectModule,
    CommonModule,
    TableModule,
    HttpClientModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    TreeTableModule,
    TreeModule,
    DropdownModule,
    SelectButtonModule,
    PopoverModule,MultiSelectModule,
    TableModule,
    DialogModule,
    CheckboxModule,
    InputTextModule,
    PopoverModule,    
    DatePipe,
    UiSwitchModule.forRoot({
      size: 'small',
      color: 'rgb(0, 189, 99)',
      switchColor: '#80FFA2',
      defaultBgColor: '#00ACFF',
      defaultBoColor : '#476EFF',
      checkedLabel: 'on',
      uncheckedLabel: 'off'
    }),
    ModalModule.forRoot(),
    RouterModule.forChild([
      {
        path: '', component: PagesComponent,
        children: [
          {path: 'dashboard', component: BaseContentComponent},
          {path: 'role-list', component: RoleListComponent},
          {path: 'create-role', component: RoleCreateComponent},
          {path: 'access-panel', component: AccessPanelComponent},
          { path: 'create-raw-material', component: CreatePageComponent },
          { path: 'edit-raw-material', component: EditPageComponent },
          { path: 'list-raw-material', component: ListPageComponent },
<<<<<<< .mine
          {path: 'change-password', component: ChangePasswordComponent},
          {path: 'generate-cash-receive', component: GenerateCashReceiveComponent},
          {path: 'all-cash-receive', component: AllCashReceiveComponent},




=======
           {path: 'change-password', component: ChangePasswordComponent},       
           {path:"landing-page",component:LandingPageComponent}
           {path: 'all-lc', component: AllLcComponent},
           {path: 'generate-lc', component: GenerateLcComponent},
           {path: 'generate-commercial-invoice', component: GenerateCommercialInvoiceComponent},
           {path: 'all-commercial-invoice', component: AllCommercialInvoiceComponent},
          { path: 'generate-pi', component: GeneratePiComponent },
>>>>>>> .theirs
        ]
      }
    ]),
    BrowserAnimationsModule,
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    BsDatepickerModule.forRoot(),
    AccordionModule.forRoot(),
    UiSwitchModule,
  ]
})
export class PagesModule { }
