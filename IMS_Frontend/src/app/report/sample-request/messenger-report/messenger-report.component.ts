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
import Swal from 'sweetalert2';

@Component({
  selector: 'app-messenger-report',
  templateUrl: './messenger-report.component.html',
  styleUrls: ['./messenger-report.component.css'],
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
    private reportService: ReportService,
    private title: Title
  ) {}
  ngOnInit(): void {
    var permissions = this.gs.CheckUserPermission('Messenger Report');
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;
    this.roleId = window.localStorage.getItem('roleId');
    this.userId = window.localStorage.getItem('userId');

    this.initForm();
    this.pageSizeOptions = this.gs.GetPageSizeOptions();
    this.title.setTitle('Messenger Report');

    this.SearchForm.get('fromDate')?.setValue(new Date());
    this.SearchForm.get('toDate')?.setValue(new Date());
  }
  initForm(): void {
    this.SearchForm = this.fb.group({});
  }
  Search() {
    var fromDate = new Date();
    var toDate = new Date();
    let param = new GetDataModel();
    var userId = window.localStorage.getItem('userId');
    param.procedureName = '[usp_SampleRequest_Messenger_Report]';
    param.parameters = {
      FromDate: fromDate,
      ToDate: toDate,
      RequestStatus: 'Messenger',
      UserID: userId,
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

  Print() {
    var userId = window.localStorage.getItem('userId');

    var item = {
      fromDate: new Date(),
      toDate: new Date(),
      requestStatus: 'Messenger',
      UserID: userId,
    };

    var actionType = '';
    Swal.fire({
      title: 'Please select what you want to do!!',
      icon: 'info',
      showCancelButton: false,
      showConfirmButton: false,
      allowOutsideClick: true,
      customClass: {
        popup: 'swal-back', // use class name without dot
      },
      html: `
          <div style="display: flex; justify-content: center; gap: 10px;">
            <button id="view" class="swal2-confirm swal2-styled" style="background:green">Excel</button>
            <button id="download" class="swal2-confirm swal2-styled" style="background:red">PDF</button>
            <button id="print" class="swal2-confirm swal2-styled" style="background:blue">Word</button>
          </div>
        `,
    });

    // Add event listeners for buttons after Swal opens
    Swal.getPopup()
      ?.querySelector('#view')
      ?.addEventListener('click', () => {
        this.reportService.PrintSampleRequest(item, 'excel', true);
        Swal.close();
      });

    Swal.getPopup()
      ?.querySelector('#download')
      ?.addEventListener('click', () => {
        this.reportService.PrintSampleRequest(item, 'pdf', true);
        Swal.close();
      });

    Swal.getPopup()
      ?.querySelector('#print')
      ?.addEventListener('click', () => {
        this.reportService.PrintSampleRequest(item, 'word', true);
        Swal.close();
      });
  }

  handoverSample(e: any, status: any) {
      let param = new MasterEntryModel();
      param.tableName = 'tbl_SampleRequestForm';
      param.whereParams = { Id: e.Id };
      var message = '';
      if (status == 'To Client') {
        param.queryParams = {
          ClientHandoverDate: new Date(),
          ClinetHandoverBy: this.userId,
          HandoverStatus: status,
        };
        message = 'Sample handover to client Successfully!';
      }
      else if(status=='Received'){
        param.queryParams = {
          ReceiveDate: new Date(),
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

    revertSample(e: any, status: any) {
      let param = new MasterEntryModel();
      param.tableName = 'tbl_SampleRequestForm';
      param.whereParams = { Id: e.Id };
      var message = '';
      if (e.RequestStatus == 'To Client') {
        param.queryParams = {
          ClientHandoverDate: null,
          ClinetHandoverBy: null,
          HandoverStatus: "Received",
        };
        message = 'Reverted Successfully!';
      }
      else if(e.RequestStatus=='Received'){
        param.queryParams = {
          ReceiveDate: null,
          ReceiveBy: null,
          HandoverStatus: "To Messenger",
        };
        
        message = 'Reverted Successfully!';
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
