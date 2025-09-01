import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import swal from 'sweetalert2';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-pending-rm-requisition',
  templateUrl: './pending-rm-requisition-production.component.html',
  styleUrls: ['./pending-rm-requisition-production.component.css'],
  imports: [CommonModule, TableModule, InputTextModule, DialogModule],
})
export class PendingRMRequisitionProductionComponent implements OnInit {
  pendingRequisitions: any[] = [];
  detailsData: any = null;
  isDetailsVisible = false;

  constructor(
    private masterEntryService: MasterEntryService,
    private gs: GlobalServiceService,
    private title: Title,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Pending Requisition Form');
    this.loadPendingRequisitions();
  }

  loadPendingRequisitions(): void {
    const sentByStr = localStorage.getItem('userId');
    const sentBy = sentByStr ? Number(sentByStr) : null;

    const procedureData = {
      procedureName: 'usp_RawMaterial_GetRequisitionData',
      parameters: { FromDate: '', ToDate: '', Status: 'Pending', User: sentBy }
    };

    this.masterEntryService.GetInitialData(procedureData).subscribe({
      next: (results) => {
        if (results.status) {
          this.pendingRequisitions = JSON.parse(results.data).Tables1;
        } else if (results.msg === 'Invalid Token') {
          swal.fire('Session Expired!', 'Please Login Again.', 'info');
          this.gs.Logout();
        }
      },
      error: () => {}
    });
  }

  onEdit(row: any)   { 
    window.open(this.router.serializeUrl(this.router.createUrlTree(['pending-rm-requisition','edit', row.RequisitionNumber])), '_blank');
  }

  onDelete(row: any) { /* TODO: confirm & delete */ }

  // ✅ Opens the dialog and loads detail rows
  onDetails(row: any): void {
    const procedureData = {
      procedureName: 'usp_Rawmaterial_GetDataByRequisitionNumber',
      parameters: { RequisitionNumber: row.RequisitionNumber }
    };

    this.masterEntryService.GetInitialData(procedureData).subscribe({
      next: (results) => {
        if (results.status) {
          const items = JSON.parse(results.data).Tables1;
          this.detailsData = {
            RequisitionNumber: row.RequisitionNumber,
            RequisitionDate: row.RequisitionDate,
            Remarks: row.Remarks,
            TotalQty: row.Total_Qty,
            TotalBag: row.Total_bag,
            TotalRoll: row.Total_Roll,
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
}
