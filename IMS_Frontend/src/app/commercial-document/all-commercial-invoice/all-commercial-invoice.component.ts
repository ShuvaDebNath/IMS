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
import { CD } from 'src/app/models/CDModel';
import Swal from 'sweetalert2';
import { ReportService } from 'src/app/services/reportService/report-service.service';

@Component({
  selector: 'app-all-commercial-invoice',
  templateUrl: './all-commercial-invoice.component.html',
  styleUrls: ['./all-commercial-invoice.component.css']
})
export class AllCommercialInvoiceComponent {
pageIndex = 1;
  searchText = '';
  length = 100;
  pageSize = 10;
  detailsTableData:any;
  // totals for details table
  detailsTotalQuantity: number = 0;
  detailsTotalAmount: number = 0;
  detailsTotalDelivered: number = 0;
    tableData!: CD[];
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
  CDNo:string='';

  showPaginator = false;
  insertPermissions: boolean = true;
  updatePermissions: boolean = true;
  deletePermissions: boolean = true;
  printPermissions: boolean = true;
  allPersmissions: boolean = true;
  getDataModel: GetDataModel = new GetDataModel();
  detailsData:any;
  isDetailsVisible:boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private gs: GlobalServiceService,
    private pagesComponent: PagesComponent,
    private masterEntryService: MasterEntryService,
    private title:Title,
    private reportService: ReportService,
  ) {
  }
  ngOnInit(): void {
    this.initForm();
    this.pageSizeOptions = this.gs.GetPageSizeOptions();
    this.title.setTitle('All Commercial Documents');
    

    this.SearchForm.get('fromDate')?.setValue(new Date().toISOString().split('T')[0]);
    this.SearchForm.get('toDate')?.setValue(new Date().toISOString().split('T')[0]);

    this.Search();
  }
  initForm(): void {
    this.SearchForm = this.fb.group({
      fromDate: ['',[Validators.required]],
      toDate: ['',[Validators.required]],
      cdNo: [''],
    });
  }
  Search(){
    var finput = new Date();    
    var fromDate = this.SearchForm.value.fromDate;
    if (this.SearchForm.value.fromDate instanceof Date) {
      finput = new Date(this.SearchForm.value.fromDate); // try converting if it's not already a Date
      const fday = String(finput.getDate()).padStart(2, '0');
      const fmonth = String(finput.getMonth() + 1).padStart(2, '0'); // months are 0-based
      const fyear = finput.getFullYear();
      
      fromDate = `${fday}/${fmonth}/${fyear}`;
    }    

    var tinput = new Date();
    var toDate = this.SearchForm.value.toDate;
    if (this.SearchForm.value.toDate instanceof Date) {
      tinput = new Date(this.SearchForm.value.toDate); // try converting if it's not already a Date
      
      const tday = String(tinput.getDate()).padStart(2, '0');
      const tmonth = String(tinput.getMonth() + 1).padStart(2, '0'); // months are 0-based
      const tyear = tinput.getFullYear();

      toDate = `${tday}/${tmonth}/${tyear}`;
    }
    
    let param = new GetDataModel();
    param.procedureName = '[usp_CD_List]';
    param.parameters = {
      FromDate: fromDate,
      ToDate: toDate,
      CDNo: this.SearchForm.value.cdNo,
      PageIndex:this.pageIndex,
      PageSize:this.pageSize      
    };
    
    this.masterEntryService.GetInitialData(param).subscribe({
      next: (results) => {
        
        if (results.status) {
          this.tableData = [];
          let tables = JSON.parse(results.data);
          this.tableData = tables.Tables1; 
          //  this.isPage=this.rows[0].totallen>10;
          this.length = parseInt(this.tableData[0].totallen);
        }

      }

    });

  }

  DeleteData(item:any){
    swal
                .fire({
                  title: 'Wait!',
                  html: `<span>Once you delete, you won't be able to revert this!<br> <b>[${item.LC_No}]</b></span>`,
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonColor: '#3085d6',
                  cancelButtonColor: '#d33',
                  confirmButtonText: 'Yes, delete it!',
                })
                .then((result) => {
                  if (result.isConfirmed==true) {
                    let param = new GetDataModel();
                    param.procedureName = "usp_CD_Delete";
                    param.parameters = 
                    {
                      'Commercial_Invoice_ID':item.Commercial_Invoice_ID
                    };
          
      
          this.masterEntryService.GetInitialData(param).subscribe({
            next: (results:any) => {
              
              if (results.status) {
                var effectedRows = JSON.parse(results.data).Tables1;
                if(effectedRows[0].AffectedRows>0){
                  swal.fire({
                            text: `Data Deleted Successfully !`,
                            title: `Delete Successfully!`,
                            icon: 'success',
                            timer: 5000,
                          })
                          .then((result) => {
                            this.ngOnInit();
                            this.Search();
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

    viewDetails(table:any){
      this.isDetailsVisible = true;
      
      let param = new GetDataModel();
      param.procedureName = '[usp_LC_Details]';
      param.parameters = {
        Commercial_Invoice_ID: table.Commercial_Invoice_ID,     
      };

    this.masterEntryService.GetInitialData(param).subscribe({
      next: (results) => {
        
        if (results.status) {
          let tables = JSON.parse(results.data);
          
          this.detailsData = tables.Tables1[0]; 
          this.detailsTableData = tables.Tables2;
          // compute totals for details table
          this.computeDetailsTotals();
        }
      }
    });
    }

  computeDetailsTotals() {
    this.detailsTotalQuantity = 0;
    this.detailsTotalAmount = 0;
    this.detailsTotalDelivered = 0;
    if (!this.detailsTableData || !Array.isArray(this.detailsTableData)) return;
    for (const row of this.detailsTableData) {
      this.detailsTotalQuantity += Number(row.Quantity) || 0;
      this.detailsTotalAmount += Number(row.Total_Amount) || 0;
      this.detailsTotalDelivered += Number(row.Delivered_Quantity) || 0;
    }
  }

  CIPrint(){  
    this.ReportViewerOptionsBySwal('CI');  
  }
  PLPrint(){
    this.ReportViewerOptionsBySwal('PL');
  }

  DCPrint(){
    this.ReportViewerOptionsBySwal('DC');
  }

  BOEPrint(){
    this.ReportViewerOptionsBySwal('BOE');
  }

  ICPrint(){
    this.ReportViewerOptionsBySwal('IC');
  }

  OriginPrint(){
    this.ReportViewerOptionsBySwal('Origin');
  }

  BeneficiaryPrint(){
    this.ReportViewerOptionsBySwal('Beneficiary');
  }

   ReportViewerOptionsBySwal(reportType?: string) {
      var actionType = '';
      const item: any = {
        Commercial_Invoice_No: this.detailsData?.Commercial_Invoice_No,
        reportType: reportType || null,
      };
      Swal.fire({
        title: 'Please select what you want to do!!',
        icon: 'info',
        showCancelButton: false,
        showConfirmButton: false,
        allowOutsideClick: true,
        // Put Swal container/popup on top of other app modals by assigning high z-index classes
        customClass: {
          container: 'swal-container-high',
          popup: 'swal-popup-high',
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
          this.reportService.PrintCommercialInvoiceReports(item, 'excel', true);
          Swal.close();
        });

      Swal.getPopup()
        ?.querySelector('#download')
        ?.addEventListener('click', () => {
          this.reportService.PrintCommercialInvoiceReports(item, 'pdf', true);
          Swal.close();
        });

      Swal.getPopup()
        ?.querySelector('#print')
        ?.addEventListener('click', () => {
          this.reportService.PrintCommercialInvoiceReports(item, 'word', true);
          Swal.close();
        });

      // The caller-specific reportType is included in `item` so the report service
      // can dispatch the correct report variant based on that flag.
    }
}
