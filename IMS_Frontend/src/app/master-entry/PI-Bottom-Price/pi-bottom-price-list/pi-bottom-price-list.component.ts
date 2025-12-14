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
  selector: 'app-pi-bottom-price-list',
  templateUrl: './pi-bottom-price-list.component.html',
  styleUrls: ['./pi-bottom-price-list.component.css']
})
export class PIBottomPriceListComponent {
allCustomers: any[] = [];
  detailsData: any = null;
  isDetailsVisible = false;
  CustomerList: any;
  dateForm!: FormGroup;
  tableVisible = false;
  allPIBottomPriceList: any;

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
    var permissions = this.gs.CheckUserPermission('PI Bottom Price List ');
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;

    if (!this.printPermissions) {
      window.location.href = 'dashboard';
    }
    this.title.setTitle('PI Bottom Price List ');
    this.loadAllPIBottomPrice();
  }
  
  loadAllPIBottomPrice(): void {

    const procedureData = {
      procedureName: 'usp_PIBottomPrice_List',
      parameters: {
      },
    };
    this.getDataService.GetInitialData(procedureData).subscribe({
      next: (results) => {
        console.log(results, procedureData);
        if (results.status) {
          this.allPIBottomPriceList = JSON.parse(results.data).Tables1;

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
    const id = String(row?.PI_Bottom_Price_ID ?? '');

    if (!id) {
      swal.fire('Missing Id', 'PI Bottom not found.', 'info');
      return;
    }

    swal
      .fire({
        title: 'Are you sure?',
        text: `Delete PI Bottom Price ${row?.Article_No || ''}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
      })
      .then((res) => {
        if (!res.isConfirmed) return;

        const tableName = 'tbl_pi_bottom_price';
        const whereParams = { PI_Bottom_Price_ID: row?.PI_Bottom_Price_ID };

        var masterEntryModel = new MasterEntryModel();
        masterEntryModel.tableName = tableName;
        masterEntryModel.whereParams = whereParams;

        this.ms.DeleteData(masterEntryModel).subscribe({
          next: () => {
            swal.fire('Deleted!', 'PI Bottom Price deleted successfully.', 'success');
            this.loadAllPIBottomPrice(); // refresh the table
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
