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
import { DoubleMasterEntryService } from 'src/app/services/doubleEntry/doubleEntryService.service';

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
    private dme: DoubleMasterEntryService,
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
            RM_Send_MasterID: row.RM_Send_MasterID,
            IssueNumber: row.IssueNumber,
            IssueDate: row.IssueDate,
            MasterNote: row.MasterNote,
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
    const aq = Number(it?.AcceptedQuantity);
    const arq = Number(it?.AcceptedRollBag_Qty);

    return (
      Number.isFinite(q) &&
      Number.isFinite(rq) &&
      Number.isFinite(aq) &&
      Number.isFinite(arq) &&
      aq === q &&
      arq === rq
    );
  }



  get canSend(): boolean {
    const items = this.detailsData_for_Accept?.Items ?? [];
    return items.every((it: any) => {
      const qty = Number(it?.AcceptedQuantity);
      const rollQty = Number(it?.AcceptedRollBag_Qty);

      return (
        !Number.isNaN(qty) && qty >= 0 &&
        !Number.isNaN(rollQty) && rollQty >= 0
      );
    });
  }



  onAcceptFromProduction(data: any): void {
    const sentByStr = localStorage.getItem('userId');
    const sentBy = sentByStr ? Number(sentByStr) : null;

    const masterRow = {
      RM_Requisition_MasterID: data.RM_Requisition_MasterID,
      IssueNumber: data.IssueNumber,
      IssueDate: data.IssueDate,
      Note: data.MasterNote ?? '',
      Received_By: sentBy,
      Status: 'Accepted'
    };

    const detailRows = (data.Items as any[]).map(r => ({
      RM_Send_MasterID: data.RM_Send_MasterID,
      AcceptedQuantity: Number(r?.AcceptedQuantity ?? 0),
      AcceptedRollBag_Qty: Number(r?.AcceptedRollBag_Qty ?? 0),
      Note: r?.Note ?? '',
      RawMaterial_ID: r?.RawMaterial_ID,
      Quantity: r?.Quantity,
      Roll: r?.Roll,
      Bag: r?.Bag,
      Roll_Bag: r?.Roll_Bag
    }));

    const whereParams = { RM_Send_MasterID: data.RM_Send_MasterID };
    this.dme.UpdateDataMasterDetails(
      detailRows,                          // fd (details)
      'tbl_rm_send_details',               // details table
      masterRow,                           // fdMaster
      'tbl_rm_send_master',                // master table
      'RM_Send_MasterID',                  // primaryColumnName
      'RM_Send_MasterID',                  // ColumnNameForign
      '',                                  // serialType
      '',                                  // ColumnNameSerialNo
      whereParams                          // where clause
    ).subscribe({
      next: () => {
        swal.fire('Accepted!', 'Issued accepted successfully.', 'success');
        this.isDetailsVisible_for_Issue = false;
        this.loadIssuedRequisitions();
      },
      error: (err) => {
        console.error(err);
        swal.fire('Accept Failed', err?.error?.message || 'Something went wrong.', 'error');
      }
    });
  }

}
