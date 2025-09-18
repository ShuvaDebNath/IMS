// List Page Component
import { Component } from '@angular/core';
import { PendingRMRequisitionWareHouseComponent } from './PendingRMRequisition_Warehouse/pending-rm-requisition-warehouse.component';
import { IssuedRMRequisitionListWarehouseComponent } from './IssuedRMRequisitionList_Warehouse/issued-rm-requisition-list-warehouse.component';
import { AcceptedRMRequisitionWareHouseComponent } from './AcceptedRMRequisition_Warehouse/accepted-rm-requisition-warehouse.component';

@Component({
  selector: 'app-list-page',
  templateUrl: './list-page.component.html',
  styleUrls: ['./list-page.component.css'],
  standalone: true,
  imports: [
    PendingRMRequisitionWareHouseComponent, 
    IssuedRMRequisitionListWarehouseComponent,
    AcceptedRMRequisitionWareHouseComponent
  ]
})
export class ListPageComponent {
  // Logic to manage the four requisition components
}
