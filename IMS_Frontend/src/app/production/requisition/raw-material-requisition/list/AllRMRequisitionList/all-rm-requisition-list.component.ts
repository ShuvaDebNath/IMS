import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DoubleMasterEntryService } from 'src/app/services/doubleEntry/doubleEntryService.service';
import { GetDataService } from 'src/app/services/getData/getDataService.service';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import swal from 'sweetalert2';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
    standalone: true,
  selector: 'app-all-rm-requisition-list',
  templateUrl: './all-rm-requisition-list.component.html',
  styleUrls: ['./all-rm-requisition-list.component.css'],
    imports: [CommonModule, TableModule, InputTextModule, DialogModule, ReactiveFormsModule],
})
export class AllRMRequisitionListComponent {
  allRequisitions: any[] = [];
  detailsData: any = null;
  isDetailsVisible = false;

  dateForm!: FormGroup; 
  tableVisible = false;

  constructor(
    private getDataService: GetDataService,
    private gs: GlobalServiceService,
    private title: Title,
    private dme: DoubleMasterEntryService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.title.setTitle('All Requisition Form');

    this.dateForm = this.fb.group({
      fromDate: [null, Validators.required],
      toDate: [null, Validators.required]
    });
  }

  loadAllRequisitions(): void {

    if (this.dateForm.invalid) {
      swal.fire('Validation Error!', 'Please select both From Date and To Date.', 'warning');
      return;
    }
    const { fromDate, toDate } = this.dateForm.value;
    if (new Date(fromDate) > new Date(toDate)) {
      swal.fire('Validation Error!', 'From Date cannot be later than To Date.', 'warning');
      return;
    }

    const sentByStr = localStorage.getItem('userId');
        const sentBy = sentByStr ? Number(sentByStr) : null;

        const procedureData = {
            procedureName: 'usp_RawMaterial_GetRequisitionData',
            parameters: {
                FromDateInput: fromDate,
                ToDateInput: toDate,
                Status: 'All',
                User: sentBy
            }
        };
    console.log(procedureData);

    this.getDataService.GetInitialData(procedureData).subscribe({
      next: (results) => {
        if (results.status) {
          this.allRequisitions = JSON.parse(results.data).Tables1;
         
          this.tableVisible = true; 
        } else if (results.msg === 'Invalid Token') {
          swal.fire('Session Expired!', 'Please Login Again.', 'info');
          this.gs.Logout();
        }
      },
      error: () => swal.fire('Error!', 'Failed to load data.', 'error')
    });
  }

  onDetails(row: any): void {
      const procedureData = {
        procedureName: 'usp_Rawmaterial_GetDataById',
        parameters: { RM_Requisition_MasterID: row.RM_Requisition_MasterID }
      };
  
      this.getDataService.GetInitialData(procedureData).subscribe({
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

      onDelete(row: any) { 
    
         const id = String(row?.RM_Requisition_MasterID ?? '');
    
        if (!id) {
          swal.fire('Missing Id', 'RM_Requisition_MasterID not found.', 'error');
          return;
        }
    
        swal.fire({
          title: 'Are you sure?',
          text: `Delete requisition ${row?.RequisitionNumber || ''}?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, delete',
          cancelButtonText: 'Cancel',
          reverseButtons: true
        }).then(res => {
          if (!res.isConfirmed) return;
    
        const fd: any[] = [];                              // detailsData -> empty for delete
        const tableName = 'tbl_rm_send_details';    // child table
        const fdMaster: any = {};                          // data -> empty for delete
        const tableNameMaster = 'tbl_rm_send_master';
        const primaryColumnName = 'RM_Send_MasterID';
        const columnNameForign  = 'RM_Send_MasterID';
        const serialType = '';
        const columnNameSerialNo = '';
        const whereParams = { RM_Send_MasterID: id };
    
        this.dme.DeleteDataMasterDetails(
          fd,
          tableName,
          fdMaster,
          tableNameMaster,
          primaryColumnName,
          columnNameForign,
          serialType,
          columnNameSerialNo,
          whereParams
        ).subscribe({
            next: () => {
              swal.fire('Deleted!', 'Requisition deleted successfully.', 'success');
              this.loadAllRequisitions(); // refresh the table
            },
            error: (err) => {
              console.error(err);
              swal.fire('Delete Failed', err?.error?.message || 'Something went wrong.', 'error');
            }
          });
        });
      
       }
}

