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
import { ReportService } from 'src/app/services/reportService/report-service.service';

@Component({
  selector: 'app-all-task-report',
  templateUrl: './all-task-report.component.html',
  styleUrls: ['./all-task-report.component.css'],
})
export class AllTaskReportComponent {
  pageIndex = 1;
  searchText = '';
  length = 100;
  pageSize = 10;
  tableData!: [];
  detailsDataTable!: [];
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
  taskId: any;

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
    private title: Title,
    private reportService: ReportService
  ) {}
  ngOnInit(): void {
    var permissions = this.gs.CheckUserPermission('All Task Report');
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;

    this.initForm();
    this.pageSizeOptions = this.gs.GetPageSizeOptions();
    this.title.setTitle('All Task Report');
  }
  initForm(): void {
    this.SearchForm = this.fb.group({
      fromDate: ['', [Validators.required]],
      toDate: ['', [Validators.required]],
    });
  }
  Search() {
    var finput = new Date();
    var fromDate = this.SearchForm.value.fromDate;
    var toDate = this.SearchForm.value.toDate;

    let param = new GetDataModel();
    param.procedureName = '[usp_Task_List]';
    param.parameters = {
      FromDate: fromDate,
      ToDate: toDate,
      PageIndex: this.pageIndex,
      PageSize: this.pageSize,
    };

    this.masterEntryService.GetInitialData(param).subscribe({
      next: (results) => {
        console.log(results);

        if (results.status) {
          this.tableData = [];
          let tables = JSON.parse(results.data);
          this.tableData = tables.Tables1;

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
        html: `<span>Once you delete, you won't be able to revert this!<br> <b>[${item.Task_Report_Code}]</b></span>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      })
      .then((result) => {
        if (result.isConfirmed == true) {
          let param = new GetDataModel();
          param.procedureName = 'usp_Task_Delete';
          param.parameters = {
            Id: item.Task_Report_ID,
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

  ShowTaskDetails(taskReportId: number) {
    this.taskId = taskReportId;
    let param = new GetDataModel();
    param.procedureName = '[usp_Task_Details]';
    param.parameters = {
      Id: taskReportId,
    };

    this.masterEntryService.GetInitialData(param).subscribe({
      next: (results) => {
        if (results.status) {
          this.detailsData = [];
          let tables = JSON.parse(results.data);
          this.detailsData = tables.Tables1;
          console.log(this.detailsData);

          this.detailsDataTable = tables.Tables2;
          this.isDetailsVisible = true;

          //  this.isPage=this.rows[0].totallen>10;
        }
      },
    });
  }

  CloseDetails() {
    this.isDetailsVisible = false;
    this.detailsData = [];
  }

  printDialog() {
    swal.fire({
      title: 'What you want to do?',
      icon: 'question',
      html: `
                    <div style="display: flex; gap: 10px; justify-content: center;">
                      <button id="excelBtn" class="btn btn-primary" style="padding: 8px 16px;">
                        <i class="fa fa-file-excel"></i> Excel
                      </button>
                      <button id="wordBtn" class="btn btn-info" style="padding: 8px 16px;">
                        <i class="fa fa-file-word"></i> Word
                      </button>
                      <button id="pdfBtn" class="btn btn-danger" style="padding: 8px 16px;">
                        <i class="fa fa-file-pdf"></i> PDF
                      </button>
                    </div>
                  `,
      showConfirmButton: false,
      didOpen: () => {
        const excelBtn = document.getElementById('excelBtn');
        const wordBtn = document.getElementById('wordBtn');
        const pdfBtn = document.getElementById('pdfBtn');

        var item = {
          id: this.taskId,
        };

        excelBtn?.addEventListener('click', () => {
          swal.close();
          this.reportService.PrintTaskReport(item, 'excel', 'F');
        });

        wordBtn?.addEventListener('click', () => {
          swal.close();
          this.reportService.PrintTaskReport(item, 'word', 'F');
        });

        pdfBtn?.addEventListener('click', () => {
          swal.close();
          this.reportService.PrintTaskReport(item, 'pdf', 'F');
        });
      },
    });
  }
}
