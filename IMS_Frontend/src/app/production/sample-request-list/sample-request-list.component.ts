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
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sample-request-list',
  templateUrl: './sample-request-list.component.html',
  styleUrls: ['./sample-request-list.component.css'],
})
export class SampleRequestListComponent {
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
  roleId: any = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private gs: GlobalServiceService,
    private pagesComponent: PagesComponent,
    private masterEntryService: MasterEntryService,
    private title: Title
  ) {}
  ngOnInit(): void {
    var permissions = this.gs.CheckUserPermission('Sample Request List');
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;
    this.roleId = window.localStorage.getItem('roleId');

    this.initForm();
    this.pageSizeOptions = this.gs.GetPageSizeOptions();
    this.title.setTitle('Sample Request List');

    this.SearchForm.get('fromDate')?.setValue(new Date());
    this.SearchForm.get('toDate')?.setValue(new Date());
  }
  initForm(): void {
    this.SearchForm = this.fb.group({
      fromDate: ['', [Validators.required]],
      toDate: ['', [Validators.required]],
    });
  }
  Search() {
    if (this.SearchForm.invalid) {
          Swal.fire('Invalid Inputs!', 'Please Select From Date and To Date.', 'info');
          return;
        }
    

    var fromDate = this.SearchForm.value.fromDate;
    var toDate = this.SearchForm.value.toDate;
    var userId = window.localStorage.getItem('userId');
    let param = new GetDataModel();
    param.procedureName = '[usp_SampleRequest_List]';
    param.parameters = {
      FromDate: fromDate,
      ToDate: toDate,
      PageIndex: this.pageIndex,
      PageSize: this.pageSize,
      UserId:userId
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
    swal
      .fire({
        title: 'Wait!',
        html: `<span>Once you delete, you won't be able to revert this!</span>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      })
      .then((result) => {
        if (result.isConfirmed == true) {
          let param = new MasterEntryModel();
          param.tableName = 'tbl_SampleRequestForm';
          param.whereParams = { Id: item.Id };

          this.masterEntryService.DeleteData(param).subscribe({
            next: (results: any) => {
              if (results.status) {
                swal
                  .fire({
                    title: `${results.message}!`,
                    text: `Save Successfully!`,
                    icon: 'success',
                    timer: 5000,
                  })
                  .then((result) => {
                     this.Search()
                  });
               
              } else if (results.message == 'Invalid Token') {
                swal.fire('Session Expierd!', 'Please Login Again.', 'info');
                this.gs.Logout();
              } else {
              }
            },
            error: (err:any) => {},
          });
        }
      });
  }

  paginatiorChange(e: any) {
    this.pageIndex = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.Search();
  }

  viewDetails(table: any) {
    let param = new GetDataModel();
    param.procedureName = '[usp_SampleRequest_GetDetails]';
    param.parameters = {
      Id: table.Id,
    };

    this.masterEntryService.GetInitialData(param).subscribe({
      next: (results) => {
        if (results.status) {
          let tables = JSON.parse(results.data);
          this.detailsData = tables.Tables1[0];
          console.log(this.detailsData);

          this.isDetailsVisible = true;

          //  this.isPage=this.rows[0].totallen>10;
        }
      },
    });
  }

  checkPermission(e: any) {
    console.log(e,this.roleId);
    
    if (this.roleId == '50') {
      if (e.HandoverStatus != '') {
        swal.fire(
          'info',
          'Sample already handovered and cannot edit anymore',
          'info'
        );
      } else {
        if (this.updatePermissions) {
          const url = this.router.createUrlTree(['/sample-request-edit-form'], {
            queryParams: { SRId:e.Id },
          });

          const fullUrl = this.router.serializeUrl(url);
          window.open(fullUrl, '_blank');
        } 
      }
    } else {
      if (this.updatePermissions) {
        const url = this.router.createUrlTree(['/sample-request-edit-form'], {
            queryParams: { SRId:e.Id },
          });

          const fullUrl = this.router.serializeUrl(url);
          window.open(fullUrl, '_blank');
      } 
    }
  }
}
