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
import Swal from 'sweetalert2';
import { ReportService } from 'src/app/services/reportService/report-service.service';

@Component({
  selector: 'app-delivery-log-report',
  templateUrl: './delivery-log-report.component.html',
  styleUrls: ['./delivery-log-report.component.css']
})
export class DeliveryLogReportComponent {
  PIReport: any[] = [];
  detailsData: any = null;
  isDetailsVisible = false;
  PIList: any;
  dateForm!: FormGroup;
  tableVisible = false;
  SuperiorList: any;
  ClientList: any;

  // Pagination state (classic 1,2,3... UI backed by keyset pagination)
  pageSize = 50;
  currentPage = 1;
  totalRecords = 0;
  totalPages = 0;
  /**
   * pageKeys[page] holds the keyset cursor used to request that page:
   * - page 1 uses { lastDate: null, lastLedgerId: null }
   * - page 2 uses the last row from page 1, etc.
   */
  pageKeys: { page: number; lastDate: string | null; lastLedgerId: number | null }[] = [];
  isLoading = false;

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
    private ms: MasterEntryService,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    var permissions = this.gs.CheckUserPermission('Delivey Log Report');
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;

    if (!this.printPermissions) {
      window.location.href = 'dashboard';
    }
    this.title.setTitle('Delivey Log Report');
    this.getInitialData();
    this.dateForm = this.fb.group({
      fromDate: [null, Validators.required],
      toDate: [null, Validators.required],
      PIId: [''],
      SuperiorId: [''],
      ClientId: [''],
    });    

    this.dateForm.get('fromDate')?.setValue(new Date().toISOString().split('T')[0]);
    this.dateForm.get('toDate')?.setValue(new Date().toISOString().split('T')[0]);
  }

  getInitialData() {
    var ProcedureData = {
      procedureName: '[usp_ProformaInvoice_GetInitial_Report]',
      parameters: {},
    };

    this.getDataService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        if (results.status) {
          this.PIList = JSON.parse(results.data).Tables1;
          this.SuperiorList = JSON.parse(results.data).Tables2;
          this.ClientList = JSON.parse(results.data).Tables3;
        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
        }
      },
      error: (err) => {},
    });
  }

  /**
   * Load first page of Delivery Log result set (resets pagination and keyset cursor).
   */
  loadAllPI(): void {
    if (this.dateForm.invalid) {
      swal.fire(
        'Validation Error!',
        'Please select both From Date and To Date.',
        'warning'
      );
      return;
    }

    const { fromDate, toDate, PIId, SuperiorId, ClientId } = this.dateForm.value;
    if (new Date(fromDate) > new Date(toDate)) {
      swal.fire(
        'Validation Error!',
        'From Date cannot be later than To Date.',
        'warning'
      );
      return;
    }

    // Reset pagination state for a new search
    this.PIReport = [];
    this.tableVisible = false;
    this.currentPage = 1;
    this.totalRecords = 0;
    this.totalPages = 0;
    this.pageKeys = [];

    // Page 1 always starts with null keyset (top of ordered list)
    this.pageKeys[1] = { page: 1, lastDate: null, lastLedgerId: null };

    this.fetchPage(1, fromDate, toDate, PIId, SuperiorId, ClientId);
  }

  /**
   * Load a specific page using stored keyset cursor.
   */
  loadPage(page: number): void {
    if (this.isLoading || page === this.currentPage || page < 1 || (this.totalPages && page > this.totalPages)) {
      return;
    }

    if (!this.canNavigateTo(page) || this.dateForm.invalid) {
      return;
    }

    const { fromDate, toDate, PIId, SuperiorId, ClientId } = this.dateForm.value;
    this.fetchPage(page, fromDate, toDate, PIId, SuperiorId, ClientId);
  }

  /**
   * Core keyset pagination call to backend stored procedure.
   * It never uses OFFSET; it always asks for "next page after cursor".
   */
  private fetchPage(
    page: number,
    fromDate: string,
    toDate: string,
    PIId: any,
    SuperiorId: any,
    ClientId: any
  ): void {
    this.isLoading = true;

    // Keyset cursor for requested page
    const key = this.pageKeys[page] || { page, lastDate: null, lastLedgerId: null };

    const procedureData = {
      procedureName: 'usp_ProformaInvoice_DeliveryLog_Report',
      parameters: {
        FromDate: fromDate,
        ToDate: toDate,
        PI_Master_Id: PIId,
        Client_Id: ClientId,
        User_Id: SuperiorId,
        PageSize: this.pageSize,
        LastDate: key.lastDate,
        LastLedgerId: key.lastLedgerId
      },
    };

    this.getDataService.GetInitialData(procedureData).subscribe({
      next: (results) => {
        this.isLoading = false;
        if (results.status) {
          const parsed = JSON.parse(results.data);
          const pageRows: any[] = parsed?.Tables1 ?? [];

          if (!pageRows.length) {
            if (page === 1) {
              this.PIReport = [];
              this.tableVisible = false;
              this.totalRecords = 0;
              this.totalPages = 0;
            }
            return;
          }

          // Replace current page data (classic page-based view)
          this.PIReport = pageRows;
          this.tableVisible = true;
          this.currentPage = page;

          // On first page, capture total record count from totallen column
          if (this.totalRecords === 0) {
            const firstRow: any = pageRows[0];
            const totalLenRaw =
              firstRow?.totallen ??
              firstRow?.TotalLen ??
              firstRow?.TOTALLEN ??
              firstRow?.totalLength;
            this.totalRecords = Number(totalLenRaw) || 0;
            this.totalPages = this.totalRecords
              ? Math.ceil(this.totalRecords / this.pageSize)
              : 1;
          }

          // If this page is "full", compute and store keyset for the next page
          if (pageRows.length === this.pageSize) {
            const lastRow: any = pageRows[pageRows.length - 1];
            const nextPage = page + 1;
            const nextKey = {
              page: nextPage,
              lastDate: lastRow?.Date ?? null,
              lastLedgerId:
                lastRow?.['PI_Ledger_ID'] ??
                lastRow?.['Pi_Ledger_ID'] ??
                lastRow?.['pi_ledger_id'] ??
                null
            };

            if (nextKey.lastDate && nextKey.lastLedgerId != null && !this.pageKeys[nextPage]) {
              this.pageKeys[nextPage] = nextKey;
            }
          }
        } else if (results.msg === 'Invalid Token') {
          this.isLoading = false;
          swal.fire('Session Expired!', 'Please Login Again.', 'info');
          this.gs.Logout();
        }
      },
      error: () => {
        this.isLoading = false;
        swal.fire('Error!', 'Failed to load data.', 'info');
      },
    });
  }

  /**
   * Only allow navigation to pages whose keyset cursor we have computed.
   * Page 1 is always allowed; higher pages become available after visiting previous pages.
   */
  canNavigateTo(page: number): boolean {
    if (page < 1 || (this.totalPages && page > this.totalPages)) {
      return false;
    }
    if (page === 1) {
      return true;
    }
    return !!this.pageKeys[page];
  }

  // -------- Pagination navigation API used by the template --------

  goToPage(page: number): void {
    if (!this.canNavigateTo(page)) {
      return;
    }
    this.loadPage(page);
  }

  nextPage(): void {
    const target = this.currentPage + 1;
    if (this.canNavigateTo(target)) {
      this.loadPage(target);
    }
  }

  previousPage(): void {
    const target = this.currentPage - 1;
    if (this.canNavigateTo(target)) {
      this.loadPage(target);
    }
  }

  firstPage(): void {
    if (this.canNavigateTo(1)) {
      this.loadPage(1);
    }
  }

  lastPage(): void {
    if (this.totalPages > 0 && this.canNavigateTo(this.totalPages)) {
      this.loadPage(this.totalPages);
    }
  }

  /**
   * Utility for template to render a sliding window of page numbers
   * around the current page, e.g. 4 5 [6] 7 8 (max 5 buttons).
   */
  get pageArray(): number[] {
    if (this.totalPages <= 0) {
      return [];
    }

    const maxButtons = 5;
    let start = this.currentPage - Math.floor(maxButtons / 2);
    if (start < 1) {
      start = 1;
    }

    let end = start + maxButtons - 1;
    if (end > this.totalPages) {
      end = this.totalPages;
      start = Math.max(1, end - maxButtons + 1);
    }

    const pages: number[] = [];
    for (let p = start; p <= end; p++) {
      pages.push(p);
    }
    return pages;
  }

  piNoClick(piNo: any,lc:any,PIData:any) {
    console.log(piNo,lc,PIData);
    
    swal.fire({
      title: 'Save Voucher?',
      text: 'Do you want to save, discard, or cancel?',
      icon: 'warning',
      showCancelButton: lc==null?false:true,
      showDenyButton: true,
      confirmButtonText: 'PI Report',
      denyButtonText: 'Delivery Report',
      cancelButtonText: 'Cash Report',
    }).then((result) => {
      if (result.isConfirmed) {
        //this.updateVoucherData(); // your Angular fn
        this.piPrint(PIData);
      } else if (result.isDenied) {
        console.log('Changes discarded.');
        this.deliveryPrint(PIData);
      } else {
        console.log('User canceled.');
        this.piPrint(PIData);
      }
    });
  }
  piPrint(PIData:any) {
      var item = {
        PI_Master_ID: PIData?.PI_Master_ID,
        IsMPI: PIData?.IsMPI,
      };
  
      Swal.fire({
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
  
  
          excelBtn?.addEventListener('click', () => {
            Swal.close();
          this.reportService.PrintProformaInvoiceRequest(item, 'word', 'F');
          });
  
          wordBtn?.addEventListener('click', () => {
            Swal.close();
          this.reportService.PrintProformaInvoiceRequest(item, 'word', 'F');
          });
  
          pdfBtn?.addEventListener('click', () => {
            Swal.close();
          this.reportService.PrintProformaInvoiceRequest(item, 'pdf', 'F');
          });
        },
      });
    }


    deliveryPrint(PIData:any) {
      var item = {
        PI_Master_ID: PIData?.PI_Master_ID
      };
  
      Swal.fire({
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
  
  
          excelBtn?.addEventListener('click', () => {
            Swal.close();
          this.reportService.PrintDeliveryReport(item, 'word', 'F');
          });
  
          wordBtn?.addEventListener('click', () => {
            Swal.close();
          this.reportService.PrintDeliveryReport(item, 'word', 'F');
          });
  
          pdfBtn?.addEventListener('click', () => {
            Swal.close();
          this.reportService.PrintDeliveryReport(item, 'pdf', 'F');
          });
        },
      });
    }
}
