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
    var permissions = this.gs.CheckUserPermission('PI Report');
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;

    if (!this.printPermissions) {
      window.location.href = 'dashboard';
    }
    this.title.setTitle('PI Report');
    this.getInitialData();
    this.dateForm = this.fb.group({
      fromDate: [null, Validators.required],
      toDate: [null, Validators.required],
      PIId: [''],
      SuperiorId: [''],
      ClientId: [''],
    });
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
          console.log(this.ClientList, this.SuperiorList);
        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
        }
      },
      error: (err) => {},
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
    const { fromDate, toDate, PIId, SuperiorId, ClientId } =
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
        FromDate: fromDate,
        ToDate: toDate,
        PI_Master_Id: PIId,
        Client_Id: ClientId,
        User_Id: SuperiorId,
      },
    };

    this.getDataService.GetInitialData(procedureData).subscribe({
      next: (results) => {
        if (results.status) {
          this.PIReport = JSON.parse(results.data).Tables1;

          console.log(this.PIReport);
          this.tableVisible = true;
        } else if (results.msg === 'Invalid Token') {
          swal.fire('Session Expired!', 'Please Login Again.', 'info');
          this.gs.Logout();
        }
      },
      error: () => swal.fire('Error!', 'Failed to load data.', 'info'),
    });
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
