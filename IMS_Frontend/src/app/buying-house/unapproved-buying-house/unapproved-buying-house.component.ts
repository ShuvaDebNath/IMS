import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DoubleMasterEntryService } from 'src/app/services/doubleEntry/doubleEntryService.service';
import { GetDataService } from 'src/app/services/getData/getDataService.service';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import swal from 'sweetalert2';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';

@Component({
  selector: 'app-unapproved-buying-house',
  templateUrl: './unapproved-buying-house.component.html',
  styleUrls: ['./unapproved-buying-house.component.css']
})
export class UnapprovedBuyingHouseComponent {
allBuyers: any[] = [];
  detailsData: any = null;
  isDetailsVisible = false;
  BuyerList: any;
  dateForm!: FormGroup;
  tableVisible = false;
  SuperiorList: any;

  insertPermissions: boolean = false;
  updatePermissions: boolean = false;
  deletePermissions: boolean = false;
  printPermissions: boolean = false;

  constructor(
    private getDataService: GetDataService,
    private gs: GlobalServiceService,
    private title: Title,
    private dme: DoubleMasterEntryService,
    private fb: FormBuilder,
    private ms: MasterEntryService
  ) {}

  ngOnInit(): void {
    var permissions = this.gs.CheckUserPermission('All Buying House');
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;

    if (!this.printPermissions) {
      window.location.href = 'dashboard';
    }
    this.title.setTitle('Unapproved Buying House');
    this.getInitialData();
    this.dateForm = this.fb.group({
      fromDate: [null, Validators.required],
      toDate: [null, Validators.required],
      BuyerId: [''],
      SuperioId: [''],
    });
  }
  getInitialData() {
    var ProcedureData = {
      procedureName: '[usp_BuyingHouse_GetInitialData]',
      parameters: {},
    };

    this.getDataService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        if (results.status) {
          this.BuyerList = JSON.parse(results.data).Tables3;
          this.SuperiorList = JSON.parse(results.data).Tables2;
        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
        }
      },
      error: (err) => {},
    });
  }
  loadAllBuyers(): void {
    if (this.dateForm.invalid) {
      swal.fire(
        'Validation Error!',
        'Please select both From Date and To Date.',
        'warning'
      );
      return;
    }
    const { fromDate, toDate, BuyerId, SuperioId } = this.dateForm.value;
    if (new Date(fromDate) > new Date(toDate)) {
      swal.fire(
        'Validation Error!',
        'From Date cannot be later than To Date.',
        'warning'
      );
      return;
    }

    const sentByStr = localStorage.getItem('userId');
    const sentBy = sentByStr ? Number(sentByStr) : null;

    const procedureData = {
      procedureName: 'usp_Buyer_GetBuyerData',
      parameters: {
        FromDateInput: fromDate,
        ToDateInput: toDate,
        Superior_Id: SuperioId,
        Buyer_Id: BuyerId,
        Status: 'Unapproved',
        User: sentBy,
      },
    };

    this.getDataService.GetInitialData(procedureData).subscribe({
      next: (results) => {
        console.log(results, procedureData);
        if (results.status) {
          this.allBuyers = JSON.parse(results.data).Tables1;

          this.tableVisible = true;
        } else if (results.msg === 'Invalid Token') {
          swal.fire('Session Expired!', 'Please Login Again.', 'info');
          this.gs.Logout();
        }
      },
      error: () => swal.fire('Error!', 'Failed to load data.', 'error'),
    });
  }

  onDetails(row: any): void {
    const procedureData = {
      procedureName: 'usp_Buyer_GetDataById',
      parameters: { Buyer_Id: row.Id },
    };

    this.getDataService.GetInitialData(procedureData).subscribe({
      next: (results) => {

        if (results.status) {
          this.detailsData = JSON.parse(results.data).Tables1[0];
          this.isDetailsVisible = true; // open dialog
        } else if (results.msg === 'Invalid Token') {
          swal.fire('Session Expired!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
          swal.fire('Error!', 'Failed to load details.', 'error');
        }
      },
      error: () =>
        swal.fire(
          'Error!',
          'An error occurred while fetching details.',
          'error'
        ),
    });
  }

  onDelete(row: any) {
    console.log(row);
    
    const id = String(row?.Id ?? '');

    if (!id) {
      swal.fire('Missing Id', 'Buyer Id not found.', 'error');
      return;
    }

    swal
      .fire({
        title: 'Are you sure?',
        text: `Delete requisition ${row?.Buyer_Name || ''}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
      })
      .then((res) => {
        if (!res.isConfirmed) return;

        const tableName = 'tbl_Buyer';
        const whereParams = { Id: row?.Id };

        var masterEntryModel = new MasterEntryModel();
        masterEntryModel.tableName = tableName;
        masterEntryModel.whereParams = whereParams;

        this.ms.DeleteData(masterEntryModel).subscribe({
          next: () => {
            swal.fire('Deleted!', 'Customer deleted successfully.', 'success');
            this.loadAllBuyers(); // refresh the table
          },
          error: (err) => {
            console.error(err);
            swal.fire(
              'Delete Failed',
              err?.error?.message || 'Something went wrong.',
              'error'
            );
          },
        });
      });
  }

  approeReq(row: any){
      const id = String(row?.Id ?? '');
      if (!id) {
        swal.fire('Missing Id', 'Buyer Id not found.', 'error');
        return;
      }
  
      swal
        .fire({
          title: 'Are you sure?',
          text: `You want to approve buyer ${row?.Buyer_Name || ''}?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, approve',
          cancelButtonText: 'Cancel',
          reverseButtons: true,
        })
        .then((res) => {
          if (!res.isConfirmed) return;
  
          const tableName = 'tbl_buyer'; 
          const whereParams = { Id: row?.Id };
          const updateParams = { Status: 'Approved' };
  
          this.ms
            .UpdateData(updateParams,whereParams,tableName)
            .subscribe({
              next: () => {
                swal.fire(
                  'Approved!',
                  'Buyer Approved.',
                  'success'
                );
                this.loadAllBuyers(); // refresh the table
              },
              error: (err) => {
                console.error(err);
                swal.fire(
                  'Approve Failed',
                  err?.error?.message || 'Something went wrong.',
                  'error'
                );
              },
            });
        });
    }
}
