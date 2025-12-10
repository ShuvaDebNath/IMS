import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import swal from 'sweetalert2';
import { Page } from 'src/app/models/Page';
import { GlobalClass } from 'src/app/shared/global-class';
//Material Datatable
import { MatPaginator } from '@angular/material/paginator';
import { PagesComponent } from 'src/app/pages/pages.component';
import { Title } from '@angular/platform-browser';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import { GetDataModel } from 'src/app/models/GetDataModel';
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';
import { DoubleMasterEntryModel } from 'src/app/models/DoubleMasterEntryModel';
import { CG } from 'src/app/models/cg';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { ReportService } from 'src/app/services/reportService/report-service.service';

@Component({
  selector: 'app-all-fg-sent-report',
  templateUrl: './all-fg-sent-report.component.html',
  styleUrls: ['./all-fg-sent-report.component.css'],
})
export class AllFgSentReportComponent {
  pageIndex = 1;
  searchText = '';
  length = 100;
  pageSize = 10;
  tableData!: CG[];
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
  isEdit: any;
  page = new Page();
  rows: any;
  SearchForm!: FormGroup;
  fromDate: any;
  toDate: any;
  LCNo: string = '';
  CR_Id: any;
  tableVisible: boolean = false;
  detailsTableData: any;

  showPaginator = false;
  insertPermissions: boolean = true;
  updatePermissions: boolean = true;
  deletePermissions: boolean = true;
  printPermissions: boolean = true;
  allPersmissions: boolean = true;
  getDataModel: GetDataModel = new GetDataModel();
  detailsData: any;
  isDetailsVisible: boolean = false;
  RMReturnID = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private gs: GlobalServiceService,
    private pagesComponent: PagesComponent,
    private masterEntryService: MasterEntryService,
    private activeLink: ActivatedRoute,
    private title: Title,
    private reportService: ReportService
  ) {}
  ngOnInit(): void {
    var permissions = this.gs.CheckUserPermission('All FG Sent Report');
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;

    if (!this.printPermissions) {
      window.location.href = 'dashboard';
    }

    this.initForm();
    this.pageSizeOptions = this.gs.GetPageSizeOptions();
    this.title.setTitle('All FG Sent Report');

    //this.Search();
  }
  initForm(): void {
    this.SearchForm = this.fb.group({
      InvoiceNo: [''],
      fromDate: [''],
      toDate: [''],
    });
  }
  Search() {
    const convertDateFormat = (dateStr: string): string => {
      if (!dateStr) return '';
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return `${parts[1]}/${parts[0]}/${parts[2]}`;
      }
      return dateStr;
    };
    var InvoiceNo = this.SearchForm.value.InvoiceNo;
    var fromDate = this.SearchForm.value.fromDate;
    var toDate = this.SearchForm.value.toDate;

    let param = new GetDataModel();
    param.procedureName = '[usp_FinishGoods_Send_and_Receive_Report]';
    param.parameters = {
      InvoiceNo: InvoiceNo,
      FromDate: fromDate,
      ToDate: toDate,
      PageIndex: this.pageIndex,
      PageSize: this.pageSize,
    };

    this.masterEntryService.GetInitialData(param).subscribe({
      next: (results) => {
        if (results.status) {
          this.tableData = [];
          this.tableVisible = true;
          let tables = JSON.parse(results.data);
          this.tableData = tables.Tables1;
          //  this.isPage=this.rows[0].totallen>10;
        }
      },
    });
  }

  paginatiorChange(e: any) {
    this.pageIndex = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.Search();
  }

  printDialog() {
    const convertDateFormat = (dateStr: string): string => {
      if (!dateStr) return '';
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return `${parts[1]}/${parts[0]}/${parts[2]}`;
      }
      return dateStr;
    };
    swal.fire({
      title: 'What you want to do?',
      icon: 'question',
      html: `<div style="display: flex; gap: 10px; justify-content: center;">
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

    var InvoiceNo = this.SearchForm.value.InvoiceNo;
        var item = {
          fromDate: convertDateFormat(this.SearchForm.value.fromDate),
          toDate: convertDateFormat(this.SearchForm.value.toDate),
          InvoiceNo: InvoiceNo,
        };

        excelBtn?.addEventListener('click', () => {
          swal.close();
          this.reportService.PrintFGSentAndReceiveReport(item, 'excel', 'F');
        });

        wordBtn?.addEventListener('click', () => {
          swal.close();
          this.reportService.PrintFGSentAndReceiveReport(item, 'word', 'F');
        });

        pdfBtn?.addEventListener('click', () => {
          swal.close();
          this.reportService.PrintFGSentAndReceiveReport(item, 'pdf', 'F');
        });
      },
    });
  }
}
