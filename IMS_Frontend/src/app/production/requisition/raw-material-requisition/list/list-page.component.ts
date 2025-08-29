// List Page Component
import { Component } from '@angular/core';
import { PendingRMRequisitionComponent } from './PendingRMRequisition/pending-rm-requisition.component';
import { IssuedRMRequisitionComponent } from './IssuedRMRequisition/issued-rm-requisition.component';
import { ReceivedRMListComponent } from './ReceivedRMList/received-rm-list.component';
import { AllRMRequisitionListComponent } from './AllRMRequisitionList/all-rm-requisition-list.component';

@Component({
  selector: 'app-list-page',
  templateUrl: './list-page.component.html',
  styleUrls: ['./list-page.component.css'],
  standalone: true,
  imports: [PendingRMRequisitionComponent, IssuedRMRequisitionComponent, ReceivedRMListComponent, AllRMRequisitionListComponent]
})
export class ListPageComponent {
  // Logic to manage the four requisition components
}
