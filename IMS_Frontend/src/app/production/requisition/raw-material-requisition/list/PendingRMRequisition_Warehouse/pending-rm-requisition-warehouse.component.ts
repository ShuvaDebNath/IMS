import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import swal from 'sweetalert2';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    standalone: true,
    selector: 'app-pending-rm-requisition',
    templateUrl: './pending-rm-requisition-warehouse.component.html',
    styleUrls: ['./pending-rm-requisition-warehouse.component.css'],
    imports: [TableModule, InputTextModule],
})
export class PendingRMRequisitionWareHouseComponent implements OnInit {
    pendingRequisitions: any[] = [];

    constructor(
        private masterEntryService: MasterEntryService,
        private gs: GlobalServiceService,
        private title: Title,
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

        this.masterEntryService.GetInitialData(procedureData).subscribe({
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

    // pending-rm-requisition.component.ts (handlers)
onEdit(row: any)   { /* navigate to edit or open modal */ }
onDelete(row: any) { /* confirm & delete */ }
onDetails(row: any){ /* navigate to details */ }

}

