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
  selector: 'app-all-report',
  templateUrl: './all-report.component.html',
  styleUrls: ['./all-report.component.css'],
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
  errorMessage:string = '';
  errorShow = false;
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
  isApproveQty: boolean = false;
  ApprovedQty = 0;

  sampleData: any;
  sampleStatus: any = '';

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
    var permissions = this.gs.CheckUserPermission('Sample Request Report');
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;

    this.initForm();
    this.pageSizeOptions = this.gs.GetPageSizeOptions();
    this.title.setTitle('Sample Request Report');

    this.roleId = window.localStorage.getItem('roleId');
    console.log(this.roleId);
    
    this.userId = window.localStorage.getItem('userId');

    this.SearchForm.get('fromDate')?.setValue(new Date());
    this.SearchForm.get('toDate')?.setValue(new Date());
  }
  initForm(): void {
    this.SearchForm = this.fb.group({
      fromDate: [''],
      toDate: [''],
      status: [''],
    });
  }
  Search() {
    var fromDate = this.SearchForm.value.fromDate;
    var toDate = this.SearchForm.value.toDate;
    var userId = window.localStorage.getItem('userId');
    let param = new GetDataModel();
    if (fromDate == undefined) {
      const dateString = '2000-01-01';
      const date = new Date(dateString);
      fromDate = date;
      toDate = new Date();
    }
    param.procedureName = '[usp_SampleRequest_Report]';
    param.parameters = {
      FromDate: fromDate,
      ToDate: toDate,
      RequestStatus: this.SearchForm.value.status,
      UserID: userId,
    };

    this.masterEntryService.GetInitialData(param).subscribe({
      next: (results) => {
        if (results.status) {
          this.tableData = [];
          let tables = JSON.parse(results.data);
          this.tableData = tables.Tables1;
          console.log(results);

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
      fromDate: this.SearchForm.value.fromDate,
      toDate: this.SearchForm.value.toDate,
      requestStatus: this.SearchForm.value.status,
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

  ApproveQtyModal() {
    this.ApprovedQty = 0
    this.isApproveQty = true;
  }

  handoverSample() {
    console.log(this.ApprovedQty);
    if (this.ApprovedQty == 0 || this.ApprovedQty==null) {
      this.errorShow = true;
      this.errorMessage = "Approved qty can not be 0 or empty";
    } else {
      
    this.isApproveQty = false;
      var e = this.sampleData;
      var status = this.sampleStatus;
      let param = new MasterEntryModel();
      param.tableName = 'tbl_SampleRequestForm';
      param.whereParams = { Id: e.Id };
      var message = '';
      if (status == 'To Messenger') {
        param.queryParams = {
          MessengerHandoverDate: new Date(),
          MessengerHandoverBy: this.userId,
          HandoverStatus: status,
          ApprovedQty: this.ApprovedQty,
        };
        message = 'Sample handover to messenger Successfully!';
      } else if (status == 'To Client') {
        param.queryParams = {
          ClientHandoverDate: new Date(),
          ClinetHandoverBy: this.userId,
          HandoverStatus: status,
          ApprovedQty: this.ApprovedQty,
        };

        message = 'Sample handover to client Successfully!';
      }else if (status == 'To Marketing') {
        param.queryParams = {
          ClientHandoverDate: new Date(),
          ClinetHandoverBy: this.userId,
          HandoverStatus: status,
          ApprovedQty: this.ApprovedQty,
        };

        message = 'Sample handover to client Successfully!';
      } else if (status == '') {
        param.queryParams = {
          MessengerHandoverDate: null,
          MessengerHandoverBy: null,
          HandoverStatus: status,
          ApprovedQty: 0,
        };

        message = 'Sample handover reverted Successfully!';
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

  InputSampleQty(e: any, status: any) {
    
    this.ApprovedQty = 0
    let param = new MasterEntryModel();
    param.tableName = 'tbl_SampleRequestForm';
    param.whereParams = { Id: e.Id };
    var message = '';
    if (status == '') {
      param.queryParams = {
        MessengerHandoverDate: null,
        MessengerHandoverBy: null,
        HandoverStatus: status,
        ApprovedQty: 0,
      };

      message = 'Sample handover reverted Successfully!';

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
    } else {
      this.sampleData = e;
      this.sampleStatus = status;
      this.isApproveQty = true;
    }
  }

  checkQty() {
    if (this.ApprovedQty > this.sampleData.RequestedQuantity) {
      this.errorShow = true;      
      this.errorMessage = "Approved qty can not be greater then Requested Quantity";
      this.ApprovedQty = 0;
      return;
    } else {
      this.errorShow = false;
    }
  }

  checkDisable(table:any){
    if(table.HandoverStatus != '' && this.roleId!=1 && this.roleId!=2 && this.roleId!=51){
    console.log(table);
      return true
    }
    return false;
  }

  receiveSample(e: any, status: any) {
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
}
