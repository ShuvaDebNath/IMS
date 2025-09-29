import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import swal from 'sweetalert2';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { GetDataService } from 'src/app/services/getData/getDataService.service';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';

@Component({
    standalone: true,
    selector: 'app-pending-rm-requisition',
    templateUrl: './pending-rm-requisition-warehouse.component.html',
    styleUrls: ['./pending-rm-requisition-warehouse.component.css'],
    imports: [CommonModule, TableModule, InputTextModule, DialogModule],
})
export class PendingRMRequisitionWareHouseComponent implements OnInit {
    pendingRequisitions: any[] = [];
    detailsData: any = null;
    isDetailsVisible = false;

    constructor(
        private getDataService: GetDataService,
        private gs: GlobalServiceService,
        private title: Title,
        private masterEntryService: MasterEntryService
    ) {

    }

    ngOnInit(): void {
        this.title.setTitle('Pending Requisition Form');
        this.loadPendingRequisitions();
    }

    loadPendingRequisitions(): void {

        const sentByStr = localStorage.getItem('userId');
        const sentBy = sentByStr ? Number(sentByStr) : null;

        const procedureData = {
            procedureName: 'usp_RawMaterial_GetRequisitionData',
            parameters: {
                FromDate: '',
                ToDate: '',
                Status: 'Pending',
                User: sentBy
            }
        };

        this.getDataService.GetInitialData(procedureData).subscribe({
            next: (results) => {

                if (results.status) {
                    this.pendingRequisitions = JSON.parse(results.data).Tables1;

                } else if (results.msg == 'Invalid Token') {
                    swal.fire('Session Expierd!', 'Please Login Again.', 'info');
                    this.gs.Logout();
                } else { }
            },
            error: (err) => { },
        });
    };

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
                        RM_Requisition_MasterID: row.RM_Requisition_MasterID,
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

    onAccept(data: any): void {
        let queryParams = {
            Status: 'Accepted'
        };
        let condition = {
            RM_Requisition_MasterID: data.RM_Requisition_MasterID
        };
        let tableName = 'tbl_rm_requisition_master';

        this.masterEntryService.UpdateData(queryParams, condition, tableName).subscribe((res: any) => {
            if (res.status) {
                swal.fire('Accepted!', 'Requisition has been accepted.', 'success');
                this.isDetailsVisible = false;
                this.loadPendingRequisitions(); 
            } else {
                if (res.message == 'Invalid Token') {
                    swal.fire('Session Expired!', 'Please Login Again.', 'info');
                    this.gs.Logout();
                } else {
                    swal.fire('Rejected!', 'Requisition has been rejected.', 'error');
                    this.isDetailsVisible = false;
                    this.loadPendingRequisitions();
                }
            }
        });

    }

    onReject(data: any): void {

        let queryParams = {
            Status: 'Rejected'
        };
        let condition = {
            RM_Requisition_MasterID: data.RM_Requisition_MasterID
        };
        let tableName = 'tbl_rm_requisition_master';

        this.masterEntryService.UpdateData(queryParams, condition, tableName).subscribe((res: any) => {
            if (res.status) {
                swal.fire('Rejected!', 'Requisition has been rejected.', 'error');
                this.isDetailsVisible = false;
                this.loadPendingRequisitions(); 
            } else {
                if (res.message == 'Invalid Token') {
                    swal.fire('Session Expired!', 'Please Login Again.', 'info');
                    this.gs.Logout();
                } else {
                    swal.fire('Rejected!', 'Requisition has been rejected.', 'error');
                    this.isDetailsVisible = false;
                    this.loadPendingRequisitions();
                }
            }
        });
    }
}

