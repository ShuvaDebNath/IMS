import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GlobalServiceService } from '../../services/Global-service.service';
import swal from 'sweetalert2';
import { Page } from 'src/app/models/Page';
import { GlobalClass } from 'src/app/shared/global-class';
//Material Datatable
import { MatPaginator } from '@angular/material/paginator';
import { PagesComponent } from 'src/app/pages/pages.component';
import { Title } from '@angular/platform-browser';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import { GetDataModel } from 'src/app/models/GetDataModel';
import { LC } from 'src/app/models/LCModel';
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';
import { DoubleMasterEntryModel } from 'src/app/models/DoubleMasterEntryModel';

@Component({
  selector: 'app-all-application',
  templateUrl: './all-application.component.html',
  styleUrls: ['./all-application.component.css'],
})
export class AllApplicationComponent {
  pageIndex = 1;
  searchText = '';
  length = 100;
  pageSize = 10;
  tableData!: LC[];
  pageSizeOptions: number[] = [];
  displayedColumns: string[] = [
    'Sl',
    'Date',
    'Voucher Type',
    'Voucher No',
    'Debit',
    'Credit',
    'Prepared By',
    'Approved By',
    'Status',
    'Action',
  ];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  page = new Page();
  rows: any;
  SearchForm!: FormGroup;
  fromDate: any;
  toDate: any;
  LCNo: string = '';

  showPaginator = false;
  insertPermissions: boolean = true;
  updatePermissions: boolean = true;
  deletePermissions: boolean = true;
  printPermissions: boolean = true;
  allPersmissions: boolean = true;
  getDataModel: GetDataModel = new GetDataModel();
  detailsData: any;
  isDetailsVisible: boolean = false;
  FormType: any[] = [
    {
      value: '0',
      text: '--Select Form Type--',
    },
    {
      value: 'PI Amendment Application',
      text: 'PI Amendment Application',
    },
    {
      value: 'Special Delivery Application',
      text: 'Special Delivery Application',
    },
    {
      value: 'Cancel PI Application',
      text: 'Cancel PI Application',
    },
    {
      value: 'Exchange Goods Application',
      text: 'Exchange Goods Application',
    },
    {
      value: 'Return Goods Application',
      text: 'Return Goods Application',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private gs: GlobalServiceService,
    private pagesComponent: PagesComponent,
    private masterEntryService: MasterEntryService,
    private title: Title
  ) {}
  ngOnInit(): void {
    var permissions = this.gs.CheckUserPermission('All Application');
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;

    this.initForm();
    this.pageSizeOptions = this.gs.GetPageSizeOptions();
    this.title.setTitle('All Application');

  }
  initForm(): void {
    this.SearchForm = this.fb.group({
      fromDate: ['', [Validators.required]],
      toDate: ['', [Validators.required]],
      applicationType: [''],
    });
  }
  Search() {
    var finput = new Date();
    var fromDate = this.SearchForm.value.fromDate;    
    var toDate = this.SearchForm.value.toDate;

    let param = new GetDataModel();
    param.procedureName = '[usp_Application_List]';
    param.parameters = {
      FromDate: fromDate,
      ToDate: toDate,
      ApplicationType: this.SearchForm.value.applicationType,
      PageIndex: this.pageIndex,
      PageSize: this.pageSize,
    };

    this.masterEntryService.GetInitialData(param).subscribe({
      next: (results) => {
        if (results.status) {
          this.tableData = [];
          let tables = JSON.parse(results.data);
          this.tableData = tables.Tables1;
          if (this.tableData.length > 0) {
            this.length = parseInt(this.tableData[0].totallen);
          } else {
            swal.fire('info', 'No Data Found!!', 'info');
          }
          //  this.isPage=this.rows[0].totallen>10;
        }
      },
    });
  }

  DeleteData(item: any) {
    console.log(item);
    
    swal
      .fire({
        title: 'Wait!',
        html: `<span>Once you delete, you won't be able to revert this!<br> <b>[${item.POno}]</b></span>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      })
      .then((result) => {
        if (result.isConfirmed == true) {
          let param = new GetDataModel();
          param.procedureName = 'usp_Application_Delete';
          param.parameters = {
            Id: item.Id,
          };

          this.masterEntryService.GetInitialData(param).subscribe({
            next: (results: any) => {
              if (results.status) {
                var effectedRows = JSON.parse(results.data).Tables1;
                if (effectedRows[0].AffectedRows > 0) {
                  swal
                    .fire({
                      text: `Data Deleted Successfully !`,
                      title: `Delete Successfully!`,
                      icon: 'success',
                      timer: 5000,
                    })
                    .then((result) => {
                      this.ngOnInit();
                    });
                }

                this.Search();
              } else if (results.message == 'Invalid Token') {
                swal.fire('Session Expierd!', 'Please Login Again.', 'info');
                this.gs.Logout();
              } else {
              }
            },
            error: (err) => {},
          });
        }
      });
  }

  paginatiorChange(e: any) {
    this.pageIndex = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.Search();
  }
}
