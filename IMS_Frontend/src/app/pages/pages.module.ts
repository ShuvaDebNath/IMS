import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { NgxBootstrapTreeviewModule } from 'ngx-bootstrap-treeview';
import { HttpClientModule } from '@angular/common/http';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxSelectModule, INgxSelectOptions } from 'ngx-select-ex';
import { UiSwitchModule } from 'ngx-ui-switch';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PagesComponent } from './pages.component';
import { BaseContentComponent } from '../dashboard/base-content/base-content.component';
import { HeaderComponent } from '../dashboard/header/header.component';
import { FooterComponent } from '../dashboard/footer/footer.component';
import { SidebarComponent } from '../dashboard/sidebar/sidebar.component';

//Material Data Table
import { MatPaginatorModule } from '@angular/material/paginator';
import { Select2Module } from 'ng-select2-component';
import { TreeTableModule } from 'primeng/treetable';
import { TreeModule } from 'primeng/tree';
import { DropdownModule } from 'primeng/dropdown'
import { SelectButtonModule } from 'primeng/selectbutton';
// import { ProjectWiseExpenseComponent } from '../Project-Wise-Income-Expense/project-wise-expense/project-wise-expense.component';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { DatePipe } from '@angular/common';
import { RoleListComponent } from '../Roles/role-list/role-list.component';
import { RoleCreateComponent } from '../Roles/role-create/role-create.component';
import { MenuComponent } from '../dashboard/menu/menu.component';
import { AccessNodeComponent } from '../Roles/access-node/access-node.component';
import { AccessPanelComponent } from '../Roles/access-panel/access-panel.component';
import { CreatePageComponent } from '../production/requisition/raw-material-requisition/create/create-page.component';
import { EditPageComponent } from '../production/requisition/raw-material-requisition/edit/edit-page.component';
import { ListPageComponent } from '../production/requisition/raw-material-requisition/list/list-page.component';
import { PendingRMRequisitionProductionComponent } from '../production/requisition/raw-material-requisition/list/PendingRMRequisition_Production/pending-rm-requisition-production.component';
import { IssuedRMRequisitionComponent } from '../production/requisition/raw-material-requisition/list/IssuedRMRequisition/issued-rm-requisition.component';
import { ReceivedRMListComponent } from '../production/requisition/raw-material-requisition/list/ReceivedRMList/received-rm-list.component';
import { AllRMRequisitionListComponent } from '../production/requisition/raw-material-requisition/list/AllRMRequisitionList/all-rm-requisition-list.component';
import { PendingRMRequisitionWareHouseComponent } from '../production/requisition/raw-material-requisition/list/PendingRMRequisition_Warehouse/pending-rm-requisition-warehouse.component';

// import {MatSortModule} from '@angular/material/sort';
// import {MatTableModule} from '@angular/material/table';
//!--Material Data Table

const CustomSelectOptions: INgxSelectOptions = { // Check the interface for more options
  keepSelectedItems: false,
  allowClear: true
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
    AccessPanelComponent
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
    UiSwitchModule.forRoot({
      size: 'small',
      color: 'rgb(0, 189, 99)',
      switchColor: '#80FFA2',
      defaultBgColor: '#00ACFF',
      defaultBoColor: '#476EFF',
      checkedLabel: 'on',
      uncheckedLabel: 'off'
    }),
    ModalModule.forRoot(),
    RouterModule.forChild([
      {
        path: '', component: PagesComponent,
        children: [
          { path: 'dashboard', component: BaseContentComponent },
          { path: 'role-list', component: RoleListComponent },
          { path: 'create-role', component: RoleCreateComponent },
          { path: 'access-panel', component: AccessPanelComponent },
          { path: 'create-raw-material', component: CreatePageComponent },
          { path: 'edit-raw-material', component: EditPageComponent },
          { path: 'list-raw-material', component: ListPageComponent },
          { path: 'pending-rm-requisition', component: PendingRMRequisitionProductionComponent },
          { path: 'pending-rm-requisition-warehouse', component: PendingRMRequisitionWareHouseComponent },
          { path: 'issued-rm-requisition', component: IssuedRMRequisitionComponent },
          { path: 'received-rm-list', component: ReceivedRMListComponent },
          { path: 'all-rm-requisition-list', component: AllRMRequisitionListComponent },

          {
            path: 'pending-rm-requisition/edit/:reqId',
            loadComponent: () =>
              import('../production/requisition/raw-material-requisition/edit/PendingRMRequisitionProduction/pending-rm-requisition-production-edit.component')
                .then(m => m.PendingRMRequisitionProductionEditComponent)
          }

        ]
      }
    ]),
    BrowserAnimationsModule,
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgxSelectModule.forRoot(CustomSelectOptions),
    AccordionModule.forRoot(),
    UiSwitchModule,
    MatPaginatorModule
  ]
})
export class PagesModule { }
