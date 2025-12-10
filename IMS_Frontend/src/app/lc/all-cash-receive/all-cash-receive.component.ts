import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';
import { DoubleMasterEntryModel } from 'src/app/models/DoubleMasterEntryModel';
import { CG } from 'src/app/models/cg';
import { ReportService } from 'src/app/services/reportService/report-service.service';

@Component({
  selector: 'app-all-cash-receive',
  templateUrl: './all-cash-receive.component.html',
  styleUrls: ['./all-cash-receive.component.css'],
})
export class AllCashReceiveComponent {
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
    private activeLink: ActivatedRoute,
    private title: Title,
    private reportService: ReportService
  ) {}
  ngOnInit(): void {
    var permissions = this.gs.CheckUserPermission('All Cash Receive');
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;

    if (!this.printPermissions) {
      window.location.href = 'dashboard';
    }

    this.initForm();
    this.pageSizeOptions = this.gs.GetPageSizeOptions();
    this.title.setTitle('All Cash Receive');

    var fDate = new Date();
    const mm = String(fDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(fDate.getDate()).padStart(2, '0');
    const yyyy = fDate.getFullYear();

    const formatted = `${dd}/${mm}/${yyyy}`;

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(fDate.getMonth() - 3);

    const mmT = String(threeMonthsAgo.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const ddT = String(threeMonthsAgo.getDate()).padStart(2, '0');
    const yyyyT = threeMonthsAgo.getFullYear();

    const formattedT = `${ddT}/${mmT}/${yyyyT}`;

    this.SearchForm.get('fromDate')?.setValue(formattedT);
    this.SearchForm.get('toDate')?.setValue(formatted);

    this.Search();
  }
  initForm(): void {
    this.SearchForm = this.fb.group({
      fromDate: ['', [Validators.required]],
      toDate: ['', [Validators.required]],
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
    var finput = new Date();
    var fromDate = convertDateFormat(this.SearchForm.value.fromDate);

    var tinput = new Date();
    var toDate = convertDateFormat(this.SearchForm.value.toDate);

    let param = new GetDataModel();
    param.procedureName = '[usp_CashReceive_List]';
    param.parameters = {
      FromDate: fromDate,
      ToDate: toDate,
      PageIndex: this.pageIndex,
      PageSize: this.pageSize,
    };

    this.masterEntryService.GetInitialData(param).subscribe({
      next: (results) => {
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
          let param = new GetDataModel();
          param.procedureName = 'usp_CashReceiveDelete';
          param.parameters = {
            CR_ID: item.CR_ID,
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

  viewDetails(table: any) {
    this.isDetailsVisible = true;
    this.detailsData = table;
  }

  printCashReceive() {
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

        // Convert dates from dd/mm/yyyy to mm/dd/yyyy
        const convertDateFormat = (dateStr: string): string => {
          if (!dateStr) return '';
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            return `${parts[1]}/${parts[0]}/${parts[2]}`;
          }
          return dateStr;
        };
        console.log(this.SearchForm.value.fromDate);

        var item = {
          fromDate: convertDateFormat(this.SearchForm.value.fromDate),
          toDate: convertDateFormat(this.SearchForm.value.toDate),
        };

        excelBtn?.addEventListener('click', () => {
          swal.close();
          console.log('User selected: Excel format');
          this.reportService.PrintCashReceiveReport(item, 'excel', 'F');
        });

        wordBtn?.addEventListener('click', () => {
          swal.close();
          console.log('User selected: Word format');
          this.reportService.PrintCashReceiveReport(item, 'word', 'F');
        });

        pdfBtn?.addEventListener('click', () => {
          swal.close();
          console.log('User selected: PDF format');
          this.reportService.PrintCashReceiveReport(item, 'pdf', 'T');
        });
      },
    });
  }
}
