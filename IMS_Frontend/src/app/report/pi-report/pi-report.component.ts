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
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DateFormat } from 'src/app/shared/date-format';

@Component({
  selector: 'app-pi-report',
  templateUrl: './pi-report.component.html',
  styleUrls: ['./pi-report.component.css'],
})
export class PiReportComponent {
  PIReport: any[] = [];
  detailsData: any = null;
  isDetailsVisible = false;
  PIList: any;
  dateForm!: FormGroup;
  tableVisible = false;
  SuperiorList: any;
  ClientList: any;
  pageSize = 10;
  currentPage = 1;
  searchText='';

  insertPermissions: boolean = false;
  updatePermissions: boolean = false;
  deletePermissions: boolean = false;
  printPermissions: boolean = false;

   isLoading: boolean = false;
   shipperList: any[] = [];
  consigneeList: any[] = [];
  UserList: any[] = [];
  piList: any[] = [];
    private piSearch$ = new Subject<string>();
    private customerSearch$ = new Subject<string>();
  datePipe: any;

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
    var permissions = this.gs.CheckUserPermission('PI Report');
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;

    if (!this.printPermissions) {
      window.location.href = 'dashboard';
    }
    this.title.setTitle('PI Report');

     // PI Search
      this.piSearch$
        .pipe(
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe(keyword => {
          this.callPISearchAPI(keyword);
        });
    
      // Customer Search
      this.customerSearch$
        .pipe(
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe(keyword => {
          this.callCustomerSearchAPI(keyword);
        });

    this.getInitialData();
    this.dateForm = this.fb.group({
      fromDate: [null, Validators.required],
      toDate: [null, Validators.required],
      Beneficiary_Account_ID: [''],
      PI_Master_ID: [''],
      Customer_ID: [''],
      User_ID: ['']
    });
  }
  getInitialData() {

    const procedureData = {
          procedureName: 'usp_GetUserInfo_With_Superior',
          parameters: {
            UserId: this.gs.getSessionData('userId')
          },
        };
    
        this.getDataService.GetInitialData(procedureData).subscribe({
          next: (results) => {
            if (results.status) {
    
              let DataSet = JSON.parse(results.data);
    
              this.UserList = DataSet.Tables1;
              this.piList = DataSet.Tables2;
              this.shipperList = DataSet.Tables3;
              this.consigneeList = DataSet.Tables4;

              if (this.UserList.length === 1) {
                this.dateForm.controls['User_ID'].setValue(
                  this.UserList[0].User_ID
                );
              }
            } else if (results.msg == 'Invalid Token') {
              Swal.fire('Session Expired!', 'Please Login Again.', 'info');
              this.gs.Logout();
              this.isLoading = false;
            }
          },
          error: (err) => {
            this.isLoading = false;
          },
        });
  }
  loadAllPI(): void {
    if (this.dateForm.invalid) {
      swal.fire(
        'Validation Error!',
        'Please select both From Date and To Date.',
        'warning'
      );
      return;
    }
    const { fromDate, toDate, PI_Master_ID, User_ID, Customer_ID, Beneficiary_Account_ID } =
      this.dateForm.value;
    if (new Date(fromDate) > new Date(toDate)) {
      swal.fire(
        'Validation Error!',
        'From Date cannot be later than To Date.',
        'warning'
      );
      return;
    }

    const sentByStr = localStorage.getItem('userId');
    const sentBy = sentByStr ? Number(sentByStr) : null;

    const procedureData = {
      procedureName: 'usp_ProformaInvoice_Report',
      parameters: {
        FromDate:  DateFormat.toApiDate(fromDate),
        ToDate: DateFormat.toApiDate(toDate),
        PI_Master_Id: PI_Master_ID,
        Client_Id: Customer_ID,
        User_Id: User_ID,
        Beneficiary_Account_Id: Beneficiary_Account_ID,
      },
    };

    this.getDataService.GetInitialData(procedureData).subscribe({
      next: (results) => {
        if (results.status) {
          this.PIReport = JSON.parse(results.data).Tables1;
          this.currentPage = 1;
          this.pageSize = 10;
          this.tableVisible = true;
        } else if (results.msg === 'Invalid Token') {
          swal.fire('Session Expired!', 'Please Login Again.', 'info');
          this.gs.Logout();
        }
      },
      error: () => swal.fire('Error!', 'Failed to load data.', 'info'),
    });
  }

  piNoClick(piNo: any, lc: any, PIData: any) {

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
        this.deliveryPrint(PIData);
      } else {
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

  onPageChange(event: any) {
    this.pageSize = event.rows;
    this.currentPage = (event.first / event.rows) + 1;
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

        const sentByStr = localStorage.getItem('userId');
        const sentBy = sentByStr ? Number(sentByStr) : null;
        const item = {
          rptType: '',
          FromDate: this.dateForm.value.fromDate,
          ToDate: this.dateForm.value.toDate,
          PI_Master_Id: this.dateForm.value.PIId,
          ClientId: this.dateForm.value.ClientId,
          User_Id: this.dateForm.value.SuperiorId,
          pageLength: this.pageSize,
          pageNo: this.currentPage,
          searchParam: this.searchText || ''
        };
        excelBtn?.addEventListener('click', () => {
          swal.close();
          this.reportService.PrintPIReport(item, 'excel', 'F');
        });

        wordBtn?.addEventListener('click', () => {
          swal.close();
          this.reportService.PrintPIReport(item, 'word', 'F');
        });

        pdfBtn?.addEventListener('click', () => {
          swal.close();
          this.reportService.PrintPIReport(item, 'pdf', 'F');
        });
      },
    });
  }
    toggleText(item: any) {
    item.showFull = !item.showFull;
  }

  onSearchPI(event: any) {
  
      const keyword = event?.filter?.trim() || '';
      if (!keyword) {
        this.onClearPI();
        return;
      }
  
       this.piSearch$.next(keyword); 
    }
  
     onSearchCustomerName(event: any) {
  
      const keyword = event?.filter?.trim() || '';
      if (!keyword) {
        this.onClearCustomerName();
        return;
      }
  
       this.customerSearch$.next(keyword); 
    }
  
    callPISearchAPI(keyword: string) {  
  
      const userId = this.dateForm.get('User_ID')?.value;
  
      if (!userId) {
        this.piList = [];
  
        Swal.fire({
          icon: 'warning',
          title: 'Select Name First',
          text: 'Please select a user before searching PI No',
          timer: 2000,
          showConfirmButton: false
        });
  
        return;
      }
  
      const procedureData = {
        procedureName: 'usp_PINumberSearchWithUserReference',
        parameters: {
          UserId: this.dateForm.get('User_ID')?.value,
          SearchPI: keyword
        }
      };
  
      this.getDataService.GetInitialData(procedureData).subscribe({
        next: (results) => {
  
          if (results.status) {
  
            const data = JSON.parse(results.data);
  
            this.piList = data?.Tables1 || [];
  
            if (this.piList.length === 1) {
              this.dateForm.get('PINo')?.setValue(this.piList[0].PINo);
            }
  
          }
          else if (results.msg === 'Invalid Token') {
            Swal.fire('Session Expired!', 'Please Login Again.', 'info');
            this.gs.Logout();
          }
  
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
        }
      });
    }
  
   callCustomerSearchAPI(keyword: string) {  
  
      const userId = this.dateForm.get('User_ID')?.value;
  
      if (!userId) {
        this.consigneeList = [];
  
        Swal.fire({
          icon: 'warning',
          title: 'Select Name First',
          text: 'Please select a user before searching PI No',
          timer: 2000,
          showConfirmButton: false
        });
  
        return;
      }
  
      const procedureData = {
        procedureName: 'usp_CustomerNameSearchWithUserReference',
        parameters: {
          UserId: this.dateForm.get('User_ID')?.value,
          SearchCustomerName: keyword
        }
      };
  
      this.getDataService.GetInitialData(procedureData).subscribe({
        next: (results) => {
  
          if (results.status) {
  
            const data = JSON.parse(results.data);
  
            this.consigneeList = data?.Tables1 || [];
  
            if (this.consigneeList.length === 1) {
              this.dateForm.get('Customer_ID')?.setValue(
              this.consigneeList[0].Customer_ID,
              { emitEvent: false } 
            );
            }
  
          }
          else if (results.msg === 'Invalid Token') {
            Swal.fire('Session Expired!', 'Please Login Again.', 'info');
            this.gs.Logout();
          }
  
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
        }
      });
    }
  
    onClearPI() {
  
      const rawUserId = this.dateForm.get('User_ID')?.value;
  
      const userId = rawUserId ? rawUserId : 1;
  
      if (!userId) {
        this.piList = [];
        return;
      }
  
      const procedureData = {
        procedureName: 'usp_PINumberSearchWithUserReference',
        parameters: {
          UserId: userId,
          SearchPI: null,
        }
      };
  
      this.getDataService.GetInitialData(procedureData).subscribe({
        next: (results) => {
          if (results.status) {
  
            const data = typeof results.data === 'string'
              ? JSON.parse(results.data)
              : results.data;
  
            this.piList = data?.Tables1 || [];
          }
        }
      });
    }
  
    onClearCustomerName() {
  
      const rawUserId = this.dateForm.get('User_ID')?.value;
  
      const userId = rawUserId ? rawUserId : 1;
  
      if (!userId) {
        this.consigneeList = [];
        return;
      }
  
      const procedureData = {
        procedureName: 'usp_CustomerNameSearchWithUserReference',
        parameters: {
          UserId: userId,
          SearchCustomerName: null,
        }
      };
  
      this.getDataService.GetInitialData(procedureData).subscribe({
        next: (results) => {
          if (results.status) {
  
            const data = typeof results.data === 'string'
              ? JSON.parse(results.data)
              : results.data;
  
            this.consigneeList = data?.Tables1 || [];
          }
        }
      });
    }
}
