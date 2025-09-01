// List Page Component
import { Component } from '@angular/core';

import { IssuedRMRequisitionComponent } from './IssuedRMRequisition/issued-rm-requisition.component';
import { ReceivedRMListComponent } from './ReceivedRMList/received-rm-list.component';
import { AllRMRequisitionListComponent } from './AllRMRequisitionList/all-rm-requisition-list.component';
import { PendingRMRequisitionProductionComponent } from './PendingRMRequisition_Production/pending-rm-requisition-production.component';
import { PendingRMRequisitionWareHouseComponent } from './PendingRMRequisition_Warehouse/pending-rm-requisition-warehouse.component';

@Component({
  selector: 'app-list-page',
  templateUrl: './list-page.component.html',
  styleUrls: ['./list-page.component.css'],
  standalone: true,
  imports: [PendingRMRequisitionProductionComponent, PendingRMRequisitionWareHouseComponent, IssuedRMRequisitionComponent, ReceivedRMListComponent, AllRMRequisitionListComponent]
})
export class ListPageComponent {
  // Logic to manage the four requisition components
}
