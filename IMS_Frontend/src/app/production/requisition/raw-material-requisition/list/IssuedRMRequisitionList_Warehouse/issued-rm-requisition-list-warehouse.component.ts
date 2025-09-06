import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { GetDataService } from 'src/app/services/getData/getDataService.service';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import swal from 'sweetalert2';

@Component({
    standalone: true,
  selector: 'app-issued-rm-requisition-list-warehouse',
  templateUrl: './issued-rm-requisition-list-warehouse.component.html',
  styleUrls: ['./issued-rm-requisition-list-warehouse.component.css'],
   imports: [FormsModule, CommonModule, TableModule, InputTextModule, DialogModule],
})
export class IssuedRMRequisitionListWarehouseComponent {

  issuedRequisitions: any[] = [];
  detailsData: any = null;
  isDetailsVisible = false;

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
                  Status: 'Accepted',
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
