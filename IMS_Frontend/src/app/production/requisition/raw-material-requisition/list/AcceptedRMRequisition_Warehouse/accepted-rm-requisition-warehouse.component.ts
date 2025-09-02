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
import { FormsModule } from '@angular/forms';

@Component({
    standalone: true,
    selector: 'app-accepted-rm-requisition',
    templateUrl: './accepted-rm-requisition-warehouse.component.html',
    styleUrls: ['./accepted-rm-requisition-warehouse.component.css'],
    imports: [FormsModule, CommonModule, TableModule, InputTextModule, DialogModule],
})
export class AcceptedRMRequisitionWareHouseComponent implements OnInit {
    pendingRequisitions: any[] = [];
    detailsData: any = null;
    detailsData_for_Issue: any = null;
    isDetailsVisible = false;
    isDetailsVisible_for_Issue = false;

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
                Status: 'Accepted',
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

    showDataBeforeSend(row: any): void {
        // swal.fire('Sent!', 'Requisition has been sent.', 'success');
        const procedureData = {
            procedureName: 'usp_Rawmaterial_GetDataById_With_Stock',
            parameters: { RM_Requisition_MasterID: row.RM_Requisition_MasterID }
        };

        this.getDataService.GetInitialData(procedureData).subscribe({
            next: (results) => {
                if (results.status) {
                    const items = JSON.parse(results.data).Tables1;
                    this.detailsData_for_Issue = {
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

    onAcceptedChange(): void {
        // e.g., recompute accepted totals or enable/disable "Send" button
    }

    // In the component TS
    get canSend(): boolean {
        const items = this.detailsData_for_Issue?.Items ?? [];
        return items.every((it: any) => {
            const qty = Number(it?.IssuedQuantity);
            const max = Number(it?.Quantity);
            // valid only if IssuedQuantity is a number, >= 0, and <= Quantity
            return !Number.isNaN(qty) && qty >= 0 && qty <= max;
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



    onSendFromWarehouse(data: any): void {
        swal.fire('Sent!', 'Requisition has been sent from warehouse.', 'success');
    }

}

