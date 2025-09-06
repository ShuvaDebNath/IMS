import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { GetDataService } from 'src/app/services/getData/getDataService.service';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import swal from 'sweetalert2';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-issued-rm-requisition-production',
  templateUrl: './issued-rm-requisition-production.component.html',
  styleUrls: ['./issued-rm-requisition-production.component.css'],
     imports: [FormsModule, CommonModule, TableModule, InputTextModule, DialogModule],
})
export class IssuedRMRequisitionProductionComponent {
  issuedRequisitions: any[] = [];
  detailsData: any = null;
  isDetailsVisible = false;
  
    detailsData_for_Accept: any = null;
  
    isDetailsVisible_for_Issue = false;

  constructor(
    private getDataService: GetDataService,
    private gs: GlobalServiceService,
    private title: Title
  ) {

  }

  ngOnInit(): void {
    this.title.setTitle('Issued Requisition Form');
    this.loadIssuedRequisitions();
  }

  loadIssuedRequisitions(): void {

    const sentByStr = localStorage.getItem('userId');
    const sentBy = sentByStr ? Number(sentByStr) : null;

    const procedureData = {
      procedureName: 'usp_RawMaterial_GetSendData',
      parameters: {
        FromDate: '',
        ToDate: '',
        Status: 'Sent',
        User: sentBy
      }
    };

    this.getDataService.GetInitialData(procedureData).subscribe({
      next: (results) => {

        if (results.status) {
          this.issuedRequisitions = JSON.parse(results.data).Tables1;

        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expired!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else { }
      },
      error: (err) => { },
    });
  };

  onDetails(row: any): void {
    const procedureData = {
      procedureName: 'usp_RawmaterialSend_GetDataById',
      parameters: { RM_Send_MasterID: row.RM_Send_MasterID }
    };

    this.getDataService.GetInitialData(procedureData).subscribe({
      next: (results) => {
        if (results.status) {
          const items = JSON.parse(results.data).Tables1;
          this.detailsData = {
            RM_Send_MasterID: row.RM_Send_MasterID,
            RM_Requisition_MasterID: row.RM_Requisition_MasterID,
            RequisitionNumber: row.RequisitionNumber,
            RequisitionDate: row.RequisitionDate,
            IssueNumber: row.IssueNumber,
            IssueDate: row.IssueDate,
            Remarks: row.MasterNote,
            Items: items
          };
          this.isDetailsVisible = true;   // open dialog
        } else if (results.msg === 'Invalid Token') {
          swal.fire('Session Expired!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
          swal.fire('Error!', 'Failed to load details.', 'error');
        }
      },
      error: () => swal.fire('Error!', 'An error occurred while fetching details.', 'error')
    });
  }

   showDataBeforeAccept(row: any): void {
          // swal.fire('Sent!', 'Requisition has been sent.', 'success');
          const procedureData = {
              procedureName: 'usp_RawmaterialSend_GetDataById',
      parameters: { RM_Send_MasterID: row.RM_Send_MasterID }
          };
  
          this.getDataService.GetInitialData(procedureData).subscribe({
              next: (results) => {
                  if (results.status) {
                      const items = JSON.parse(results.data).Tables1;
                      this.detailsData_for_Accept = {
                          RM_Requisition_MasterID: row.RM_Requisition_MasterID,
                          RequisitionNumber: row.RequisitionNumber,
                          RequisitionDate: row.RequisitionDate,
                          Remarks: row.Remarks,
                          TotalQty: row.Total_Qty,
                          TotalBag: row.Total_bag,
                          TotalRoll: row.Total_Roll,
                          Items: items
                      };
                      this.isDetailsVisible_for_Issue = true;
                  } else if (results.msg === 'Invalid Token') {
                      swal.fire('Session Expired!', 'Please Login Again.', 'info');
                      this.gs.Logout();
                  } else {
                      swal.fire('Error!', 'Failed to load details.', 'error');
                  }
              },
              error: () => swal.fire('Error!', 'An error occurred while fetching details.', 'error')
          });
  
      }

      isFull(it: any): boolean {
        const q = Number(it?.Quantity);
        const rq = Number(it?.RollBag_Quantity);
        const iq = Number(it?.IssuedQuantity);
        const irq = Number(it?.IssuedRoll_Bag);

        return Number.isFinite(q) && Number.isFinite(rq) &&
            Number.isFinite(iq) && Number.isFinite(irq) &&
            iq === q && irq === rq;        // Full only if both match exactly
    }

     get canSend(): boolean {
        const items = this.detailsData_for_Accept?.Items ?? [];
        return items.every((it: any) => {
            const qty = Number(it?.IssuedQuantity);
            const max = Number(it?.Quantity);
            // valid only if IssuedQuantity is a number, >= 0, and <= Quantity
            return !Number.isNaN(qty) && qty >= 0 && qty <= max;
        });
    }

     onAcceptFromProduction(data: any): void {}

}
