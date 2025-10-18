import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { ReportService } from 'src/app/services/reportService/report-service.service';

@Component({
  selector: 'app-all-report',
  templateUrl: './all-report.component.html',
  styleUrls: ['./all-report.component.css']
})
export class AllReportComponent {

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
  RequestStatus: any = [
    {
      value: '',
      text: '--Select Request Status--',
    },
    {
      value: 'Messenger',
      text: 'Messenger',
    },
    {
      value: 'By Own',
      text: 'By Own',
    },
  ];

  showPaginator = false;
  insertPermissions: boolean = true;
  updatePermissions: boolean = true;
  deletePermissions: boolean = true;
  printPermissions: boolean = true;
  allPersmissions: boolean = true;
  getDataModel: GetDataModel = new GetDataModel();
  detailsData: any;
  isDetailsVisible: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private gs: GlobalServiceService,
    private pagesComponent: PagesComponent,
    private masterEntryService: MasterEntryService,
    private reportService:ReportService,
    private title: Title
  ) {}
  ngOnInit(): void {
    var permissions = this.gs.CheckUserPermission('Sample Request List');
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;

    this.initForm();
    this.pageSizeOptions = this.gs.GetPageSizeOptions();
    this.title.setTitle('Sample Request List');
  }
  initForm(): void {
    this.SearchForm = this.fb.group({
      fromDate: ['', [Validators.required]],
      toDate: ['', [Validators.required]],
      status:['']
    });
  }
  Search() {
    var fromDate = this.SearchForm.value.fromDate;
    var toDate = this.SearchForm.value.toDate;
    let param = new GetDataModel();
    param.procedureName = '[usp_SampleRequest_Report]';
    param.parameters = {
      FromDate: fromDate,
      ToDate: toDate,
      RequestStatus:this.SearchForm.value.status
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
            swal.fire('error', 'No Data Found!!', 'error');
          }
          //  this.isPage=this.rows[0].totallen>10;
        }
      },
    });
  }

  Print(){

    var item = {
      'fromDate':this.SearchForm.value.fromDate,
      'toDate':this.SearchForm.value.toDate,
      'requestStatus':this.SearchForm.value.status,
    }

    this.reportService.PrintSampleRequest(item, 'pdf','T');
  }
}
