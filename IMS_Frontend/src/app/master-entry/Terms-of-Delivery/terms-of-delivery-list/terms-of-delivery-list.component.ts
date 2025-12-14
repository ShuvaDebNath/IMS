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
  selector: 'app-terms-of-delivery-list',
  templateUrl: './terms-of-delivery-list.component.html',
  styleUrls: ['./terms-of-delivery-list.component.css']
})
export class TermsOfDeliveryListComponent {
allCustomers: any[] = [];
  detailsData: any = null;
  isDetailsVisible = false;
  CustomerList: any;
  dateForm!: FormGroup;
  tableVisible = false;
  allTodDescList: any;

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
    var permissions = this.gs.CheckUserPermission('Terms of Delivery List');
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;

    if (!this.printPermissions) {
      window.location.href = 'dashboard';
    }
    this.title.setTitle('Terms of Delivery List');
    this.loadAllMateialList();
  }
  
  loadAllMateialList(): void {

    const procedureData = {
      procedureName: 'usp_TOD_List',
      parameters: {
      },
    };
    this.getDataService.GetInitialData(procedureData).subscribe({
      next: (results) => {
        console.log(results, procedureData);
        if (results.status) {
          this.allTodDescList = JSON.parse(results.data).Tables1;

          this.tableVisible = true;
        } else if (results.msg === 'Invalid Token') {
          swal.fire('Session Expired!', 'Please Login Again.', 'info');
          this.gs.Logout();
        }
      },
      error: () => swal.fire('Error!', 'Failed to load data.', 'info'),
    });
  }

  onDelete(row: any) {
    const id = String(row?.Id ?? '');

    if (!id) {
      swal.fire('Missing Id', 'Terms of Delivery not found.', 'info');
      return;
    }

    swal
      .fire({
        title: 'Are you sure?',
        text: `Delete Terms of Delivery?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
      })
      .then((res) => {
        if (!res.isConfirmed) return;

        const tableName = 'tbl_terms_of_delivery';
        const whereParams = { Id: row?.Id };

        var masterEntryModel = new MasterEntryModel();
        masterEntryModel.tableName = tableName;
        masterEntryModel.whereParams = whereParams;

        this.ms.DeleteData(masterEntryModel).subscribe({
          next: () => {
            swal.fire('Deleted!', 'Terms of delivery deleted successfully.', 'success');
            this.loadAllMateialList(); // refresh the table
          },
          error: (err) => {
            console.error(err);
            swal.fire(
              'Delete Failed',
              err?.error?.message || 'Something went wrong.',
              'info'
            );
          },
        });
      });
  }
}
