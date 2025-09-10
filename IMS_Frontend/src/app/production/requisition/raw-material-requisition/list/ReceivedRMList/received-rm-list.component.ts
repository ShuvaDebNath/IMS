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
  selector: 'app-received-rm-list',
  templateUrl: './received-rm-list.component.html',
  styleUrls: ['./received-rm-list.component.css'],
    imports: [FormsModule, CommonModule, TableModule, InputTextModule, DialogModule]
})
export class ReceivedRMListComponent {
  acceptedRequisitions: any[] = [];
  detailsData: any = null;
  isDetailsVisible = false;

  constructor(
    private getDataService: GetDataService,
    private gs: GlobalServiceService,
    private title: Title
  ) {

  }

  ngOnInit(): void {
    this.title.setTitle('Accepted Requisition List');
    this.loadAcceptedRequisitions();
  }

  loadAcceptedRequisitions(): void {
    const sentByStr = localStorage.getItem('userId');
        const sentBy = sentByStr ? Number(sentByStr) : null;
    
        const procedureData = {
          procedureName: 'usp_RawMaterial_GetAcceptedData',
          parameters: {
            FromDate: '',
            ToDate: '',
            Status: 'Accepted',
            User: sentBy
          }
        };
    
        this.getDataService.GetInitialData(procedureData).subscribe({
          next: (results) => {
    
            if (results.status) {
              this.acceptedRequisitions = JSON.parse(results.data).Tables1;
    
            } else if (results.msg == 'Invalid Token') {
              swal.fire('Session Expired!', 'Please Login Again.', 'info');
              this.gs.Logout();
            } else { }
          },
          error: (err) => { },
        });
  }

  onDetails(row: any): void {
    console.log(`RM_Send_MasterID: ${row.RM_Send_MasterID}`);

      const procedureData = {
        procedureName: 'usp_RawMaterial_GetAcceptedDataById',
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

}
