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
import { DateFormat } from 'src/app/shared/date-format';

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
  BaneficiaryAccountList: any;

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
  ) { }

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
      ClientId: [''],
      Beneficiary_Account_ID: [''],
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
          this.ClientList = JSON.parse(results.data).Tables1;
          this.BaneficiaryAccountList = JSON.parse(results.data).Tables2;

          console.log(this.ClientList);
          console.log(this.BaneficiaryAccountList);

        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
        }
      },
      error: (err) => { },
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

    const { fromDate, toDate, ClientId, Beneficiary_Account_ID } = this.dateForm.value;
    if (fromDate > toDate) {
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

    this.fetchPage(1, fromDate, toDate, ClientId, Beneficiary_Account_ID);
  }

  /**
   * Load a specific page using stored keyset cursor.
   */
  loadPage(page: number): void {
    if (this.isLoading || page === this.currentPage || page < 1) return;
    if (this.totalPages > 0 && page > this.totalPages) return;

    if (!this.canNavigateTo(page) || this.dateForm.invalid) {
      return;
    }

    const { fromDate, toDate, ClientId, Beneficiary_Account_ID } = this.dateForm.value;
    this.fetchPage(page, fromDate, toDate, ClientId, Beneficiary_Account_ID);
  }

  /**
   * Core keyset pagination call to backend stored procedure.
   * It never uses OFFSET; it always asks for "next page after cursor".
   */
  private fetchPage(
    page: number,
    fromDate: string,
    toDate: string,
    ClientId: any,
    Beneficiary_Account_ID: any
  ): void {
    this.isLoading = true;

    // Keyset cursor for requested page
    const key = this.pageKeys[page] || { page, lastDate: null, lastLedgerId: null };

    const procedureData = {
      procedureName: 'usp_ProformaInvoice_DeliveryLog_Report',
      parameters: {
        FromDate: DateFormat.toApiDate(fromDate),
        ToDate: DateFormat.toApiDate(toDate),
        Client_Id: ClientId,
        Beneficiary_Account_ID: Beneficiary_Account_ID,
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

          this.PIReport = pageRows;
          this.tableVisible = true;
          this.currentPage = page;

          const firstRow: any = pageRows[0];
          const totalLenRaw =
            firstRow?.totallen ??
            firstRow?.TotalLen ??
            firstRow?.TOTALLEN ??
            firstRow?.totalLength ??
            firstRow?.TotalCount ??
            firstRow?.totalcount ??
            firstRow?.Total_Count;
          const backendTotal = Number(totalLenRaw) || 0;
          if (backendTotal > 0) {
            this.totalRecords = backendTotal;
            this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
          }

          if (pageRows.length < this.pageSize) {
            this.totalPages = page;
            if (this.totalRecords === 0) {
              this.totalRecords = (page - 1) * this.pageSize + pageRows.length;
            }
          }

          if (pageRows.length === this.pageSize && !this.pageKeys[page + 1]) {
            const lastRow: any = pageRows[pageRows.length - 1];
            const nextPage = page + 1;
            const lastDate =
              lastRow?.Date ??
              lastRow?.date ??
              lastRow?.DATE ??
              null;
            const lastLedgerId =
              lastRow?.['PI_Ledger_ID'] ??
              lastRow?.['Pi_Ledger_ID'] ??
              lastRow?.['PI_Ledger_Id'] ??
              lastRow?.['pi_ledger_id'] ??
              lastRow?.['PiLedgerId'] ??
              lastRow?.['LedgerID'] ??
              lastRow?.['Ledger_ID'] ??
              null;

            if (lastDate) {
              this.pageKeys[nextPage] = { page: nextPage, lastDate, lastLedgerId };
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

  canNavigateTo(page: number): boolean {
    if (page < 1) return false;
    // totalPages === 0 means "unknown" — don't block; rely on pageKeys instead.
    if (this.totalPages > 0 && page > this.totalPages) return false;
    if (page === 1) return true;
    return !!this.pageKeys[page];
  }

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

  trackByPage(_index: number, page: number): number {
    return page;
  }

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

  piNoClick(piNo: any, lc: any, PIData: any) {
    console.log(piNo, lc, PIData);

    swal.fire({
      title: 'Save Voucher?',
      text: 'Do you want to save, discard, or cancel?',
      icon: 'warning',
      showCancelButton: lc == null ? false : true,
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
  piPrint(PIData: any) {

    const params: Record<string, any> = {
      PI_Master_ID: PIData?.PI_Master_ID
    };

    if (PIData.Beneficiary_Account_ID == 5 || PIData.Beneficiary_Account_ID == 12) {
      this.reportService.showReportDialog('GenericReport/SanxinPIReport', params, 'SanxinPIReport');
    }
    else if (PIData?.IsMPI === true) {
      this.reportService.showReportDialog('GenericReport/CashPIReport', params, 'CashPIReport');
    }
    else {
      this.reportService.showReportDialog('GenericReport/SunshinePIReport', params, 'SunshinePIReport');
    }

  }


  deliveryPrint(PIData: any) {
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

  printDeliveryLogReport(): void {
    if (this.dateForm.invalid) {
      swal.fire('Validation Error!', 'Please select both From Date and To Date.', 'warning');
      return;
    }

    const fromDate = DateFormat.toApiDate(this.dateForm.value.fromDate);
    const toDate = DateFormat.toApiDate(this.dateForm.value.toDate);

    if (fromDate > toDate) {
      swal.fire('Validation Error!', 'From Date cannot be later than To Date.', 'warning');
      return;
    }
    if (fromDate == null || toDate == null) {
      swal.fire('Validation Error!', 'Please select both From Date and To Date.', 'warning');
      return;
    }

    const params: Record<string, any> = {
      FromDate: fromDate,
      ToDate: toDate,
      Client_Id: this.dateForm.value.ClientId ?? '',
      Beneficiary_Account_ID: this.dateForm.value.Beneficiary_Account_ID ?? '',
    };

    this.reportService.showReportDialog('GenericReport/DeliveryLogReport', params, 'DeliveryLogReport');
  }
}
