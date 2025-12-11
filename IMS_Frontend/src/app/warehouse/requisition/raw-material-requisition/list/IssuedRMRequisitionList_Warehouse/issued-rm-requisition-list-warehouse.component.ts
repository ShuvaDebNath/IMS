import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { GetDataService } from 'src/app/services/getData/getDataService.service';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { ReportService } from 'src/app/services/reportService/report-service.service';
import swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-issued-rm-requisition-list-warehouse',
  templateUrl: './issued-rm-requisition-list-warehouse.component.html',
  styleUrls: ['./issued-rm-requisition-list-warehouse.component.css'],
  imports: [
    FormsModule,
    CommonModule,
    TableModule,
    InputTextModule,
    DialogModule,
  ],
})
export class IssuedRMRequisitionListWarehouseComponent {
  issuedRequisitions: any[] = [];
  detailsData: any = null;
  isDetailsVisible = false;
  Id: any = '';

  constructor(
    private getDataService: GetDataService,
    private gs: GlobalServiceService,
    private title: Title,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Issued Raw Material Requisition List');
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
        User: sentBy,
      },
    };

    this.getDataService.GetInitialData(procedureData).subscribe({
      next: (results) => {
        if (results.status) {
          this.issuedRequisitions = JSON.parse(results.data).Tables1;
        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expired!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
        }
      },
      error: (err) => {},
    });
  }

  onDetails(row: any): void {
    const procedureData = {
      procedureName: 'usp_RawmaterialSend_GetDataById',
      parameters: { RM_Send_MasterID: row.RM_Send_MasterID },
    };
    this.Id = row.RM_Send_MasterID;
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
            Items: items,
          };
          this.isDetailsVisible = true; // open dialog
        } else if (results.msg === 'Invalid Token') {
          swal.fire('Session Expired!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
          swal.fire('Error!', 'Failed to load details.', 'info');
        }
      },
      error: () =>
        swal.fire(
          'Error!',
          'An error occurred while fetching details.',
          'info'
        ),
    });
  }

  printApplication() {
    swal.fire({
      title: 'What you want to do?',
      icon: 'question',
      html: `
                    <div style="display: flex; gap: 10px; justify-content: center;">
                      <button id="excelBtn" class="btn btn-primary" style="padding: 8px 16px;">
                        <i class="fa fa-file-excel"></i> Excel
                      </button>
                      <button id="wordBtn" class="btn btn-info" style="padding: 8px 16px;">
                        <i class="fa fa-file-word"></i> Word
                      </button>
                      <button id="pdfBtn" class="btn btn-danger" style="padding: 8px 16px;">
                        <i class="fa fa-file-pdf"></i> PDF
                      </button>
                    </div>
                  `,
      showConfirmButton: false,
      didOpen: () => {
        const excelBtn = document.getElementById('excelBtn');
        const wordBtn = document.getElementById('wordBtn');
        const pdfBtn = document.getElementById('pdfBtn');

        var item = {
          id: this.Id,
        };
        console.log(this.Id);

        excelBtn?.addEventListener('click', () => {
          swal.close();
          console.log('User selected: Excel format');
          this.reportService.PrintRMIssueInvoice(
            item,
            'excel',
            'F'
          );
        });

        wordBtn?.addEventListener('click', () => {
          swal.close();
          console.log('User selected: Word format');
          this.reportService.PrintRMIssueInvoice(
            item,
            'word',
            'F'
          );
        });

        pdfBtn?.addEventListener('click', () => {
          swal.close();

          this.reportService.PrintRMIssueInvoice(
            item,
            'pdf',
            'F'
          );
        });
      },
    });
  }
}
