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
  selector: 'app-unapproved-customer',
  templateUrl: './unapproved-customer.component.html',
  styleUrls: ['./unapproved-customer.component.css']
})
export class UnapprovedCustomerComponent {
allCustomers: any[] = [];
  detailsData: any = null;
  isDetailsVisible = false;
  CustomerList: any;
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
    var permissions = this.gs.CheckUserPermission('Unapproved Customers');
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;

    if (!this.printPermissions) {
      window.location.href = 'dashboard';
    }
    this.title.setTitle('Unapproved Customer List');
    this.getInitialData();
    this.dateForm = this.fb.group({
      CustomerId: [''],
      SuperioId: [''],
    });
  }
  getInitialData() {
    var userId = window.localStorage.getItem('userId');
    var ProcedureData = {
      procedureName: '[usp_Customer_GetInitialData]',
      parameters: {
        'User_Id':userId
      },
    };

    this.getDataService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        if (results.status) {
          this.CustomerList = JSON.parse(results.data).Tables2;
          if(JSON.parse(results.data).Tables3!=undefined)
          this.SuperiorList = JSON.parse(results.data).Tables3;
        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
        }
      },
      error: (err) => {},
    });
  }
  loadAllCustomers(): void {
    if (this.dateForm.invalid) {
      swal.fire(
        'Validation Error!',
        'Please select both From Date and To Date.',
        'warning'
      );
      return;
    }
    var { fromDate, toDate, CustomerId, SuperioId } = this.dateForm.value;
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
    var userId = window.localStorage.getItem('userId');
    
    if(SuperioId==undefined || SuperioId=='')
      SuperioId = userId

    const procedureData = {
      procedureName: 'usp_Customer_GetCustomerData',
      parameters: {
        Superior_Id: SuperioId,
        Customer_Id: CustomerId,
        Status: 'Unapproved',
        User: sentBy,
      },
    };

    this.getDataService.GetInitialData(procedureData).subscribe({
      next: (results) => {
    console.log(results,procedureData);
        if (results.status) {
          this.allCustomers = JSON.parse(results.data).Tables1;

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
      procedureName: 'usp_Customer_GetDataById',
      parameters: { Customer_Id: row.Customer_ID },
    };

    this.getDataService.GetInitialData(procedureData).subscribe({
      next: (results) => {
      parameters: { Customer_Id: row.Customer_ID }
        console.log(results,row);
        
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
    const id = String(row?.Customer_ID ?? '');

    if (!id) {
      swal.fire('Missing Id', 'Customer Id not found.', 'error');
      return;
    }

    swal
      .fire({
        title: 'Are you sure?',
        text: `Delete requisition ${row?.Company_Name || ''}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
      })
      .then((res) => {
        if (!res.isConfirmed) return;

        const tableName = 'tbl_Customer'; 
        const whereParams = { Customer_Id: row?.Customer_ID };

        var masterEntryModel = new MasterEntryModel();
        masterEntryModel.tableName = tableName;
        masterEntryModel.whereParams = whereParams;

        this.ms
          .DeleteData(masterEntryModel)
          .subscribe({
            next: () => {
              swal.fire(
                'Deleted!',
                'Customer deleted successfully.',
                'success'
              );
              this.loadAllCustomers(); // refresh the table
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
    const id = String(row?.Customer_ID ?? '');
    if (!id) {
      swal.fire('Missing Id', 'Customer Id not found.', 'error');
      return;
    }

    swal
      .fire({
        title: 'Are you sure?',
        text: `You want to approve customer ${row?.Company_Name || ''}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, approve',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
      })
      .then((res) => {
        if (!res.isConfirmed) return;

        const tableName = 'tbl_Customer'; 
        const whereParams = { Customer_Id: row?.Customer_ID };
        const updateParams = { Status: 'Approved' };

        this.ms
          .UpdateData(updateParams,whereParams,tableName)
          .subscribe({
            next: () => {
              swal.fire(
                'Approved!',
                'Customer Approved.',
                'success'
              );
              this.loadAllCustomers(); // refresh the table
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

  getCustomerList(){
    var SuperioId = this.dateForm.value.SuperioId;
    this.CustomerList = this.CustomerList.filter((e:any)=>e.Superior_ID == SuperioId);
    
  }
}
