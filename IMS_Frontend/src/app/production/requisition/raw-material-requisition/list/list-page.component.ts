// List Page Component
import { Component } from '@angular/core';

import { IssuedRMRequisitionProductionComponent } from './IssuedRMRequisition_Production/issued-rm-requisition-production.component';
import { ReceivedRMListComponent } from './ReceivedRMList/received-rm-list.component';
import { AllRMRequisitionListComponent } from './AllRMRequisitionList/all-rm-requisition-list.component';
import { PendingRMRequisitionProductionComponent } from './PendingRMRequisition_Production/pending-rm-requisition-production.component';

@Component({
  selector: 'app-list-page',
  templateUrl: './list-page.component.html',
  styleUrls: ['./list-page.component.css'],
  standalone: true,
  imports: [
    PendingRMRequisitionProductionComponent, 
    IssuedRMRequisitionProductionComponent, 
    ReceivedRMListComponent, 
    AllRMRequisitionListComponent
  ]
})
export class ListPageComponent {
  // Logic to manage the four requisition components
}
