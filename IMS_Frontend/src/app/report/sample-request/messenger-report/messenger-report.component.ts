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
  selector: 'app-messenger-report',
  templateUrl: './messenger-report.component.html',
  styleUrls: ['./messenger-report.component.css']
})
export class MessengerReportComponent {
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
      text: '--Select Carried By--',
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
  roleId: any = '';
  userId: any = '';

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
    var permissions = this.gs.CheckUserPermission('Messenger Sample Report');
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;
    this.roleId = window.localStorage.getItem('roleId');
    this.userId = window.localStorage.getItem('userId');
    console.log(permissions);
    
    this.initForm();
    this.pageSizeOptions = this.gs.GetPageSizeOptions();
    this.title.setTitle('Messenger Report');
  }
  initForm(): void {
    this.SearchForm = this.fb.group({
    });
  }
  Search() {
    var fromDate = new Date();
    var toDate = new Date();
    let param = new GetDataModel();
    var userId = window.localStorage.getItem('userId');
    param.procedureName = '[usp_SampleRequest_Report]';
    param.parameters = {
      FromDate: fromDate,
      ToDate: toDate,
      RequestStatus:'Messenger',
      UserID:userId
    };

    this.masterEntryService.GetInitialData(param).subscribe({
      next: (results) => {
        if (results.status) {
          this.tableData = [];
          let tables = JSON.parse(results.data);
          this.tableData = tables.Tables1;
          console.log(this.tableData);
          
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

  Print(){
    var userId = window.localStorage.getItem('userId');

    var item = {
      'fromDate':new Date(),
      'toDate':new Date(),
      'requestStatus':'Messenger',
      'UserID':userId
    }

    this.reportService.PrintSampleRequest(item, 'pdf','T');
  }

  handoverSample(e: any, status: any) {
     const nowUtc = new Date();
      const bdOffsetMs = 6 * 60 * 60 * 1000;
      const bdLocal = new Date(nowUtc.getTime() + bdOffsetMs);
      const sqlDate = bdLocal.toISOString().slice(0, 19).replace('T', ' ');
      let param = new MasterEntryModel();
      param.tableName = 'tbl_SampleRequestForm';
      param.whereParams = { Id: e.Id };
      var message = '';
      if (status == 'To Client') {
        param.queryParams = {
          ClientHandoverDate: sqlDate,
          ClinetHandoverBy: this.userId,
          HandoverStatus: status,
        };
        message = 'Sample handover to client Successfully!';
      }
      else if(status=='Received'){
        param.queryParams = {
          ReceiveDate: sqlDate,
          ReceiveBy: this.userId,
          HandoverStatus: 'Received',
        };
        
        message = 'Sample received Successfully!';
      }
      else if(status==''){
        param.queryParams = {
          ClientHandoverDate: null,
          ClinetHandoverBy: null,
          HandoverStatus: status,
        };
        
        message = 'Sample handover to reverted Successfully!';
      }
  
      this.masterEntryService
        .UpdateData(param.queryParams, param.whereParams, param.tableName)
        .subscribe({
          next: (results: any) => {
            if (results.status) {
              swal
                .fire({
                  title: `${results.message}!`,
                  text: message,
                  icon: 'success',
                  timer: 5000,
                })
                .then((result) => {
                  this.Search();
                });
              this.Search();
            } else if (results.message == 'Invalid Token') {
              swal.fire('Session Expierd!', 'Please Login Again.', 'info');
              this.gs.Logout();
            } else {
            }
          },
          error: (err: any) => {},
        });
    }
}
