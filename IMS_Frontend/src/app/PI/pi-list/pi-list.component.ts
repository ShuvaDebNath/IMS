import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { GetDataService } from 'src/app/services/getData/getDataService.service';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import Swal from 'sweetalert2';
import { DividerModule } from 'primeng/divider';
import { FieldsetModule } from 'primeng/fieldset';
import { DropdownModule } from "primeng/dropdown";
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import { GetDataModel } from 'src/app/models/GetDataModel';
import { Router } from '@angular/router';
import { ReportService } from 'src/app/services/reportService/report-service.service';

@Component({
  standalone:true,
  selector: 'app-pi-list',
  templateUrl: './pi-list.component.html',
  styleUrls: ['./pi-list.component.css'],
  imports: [FormsModule,ReactiveFormsModule, CommonModule, TableModule, InputTextModule, DialogModule, ButtonModule, BsDatepickerModule, DividerModule, FieldsetModule, DropdownModule, RouterModule]
})
export class PiListComponent implements OnInit {
  @Input() PiStatus!:any;
  isLoading: boolean = false;
  datePipe = new DatePipe('en-US');
  DataTable!:any[];
  PIData!:any;
  PIDetails!:any[];
  // Totals for PI details table
  totalsOrderQty: number = 0;
  totalsDeliveredQty: number = 0;
  totalsAmount: number = 0;
  totalsProdCost: number = 0;
  totalsRolls: number = 0;
  PITypeList:any[]=[{value:1,text:'LC'},{value:2,text:'Cash'}];
  first: any=1;
  rows: any=10;
  totalRecords!: number;
  isViewDetails: boolean=false;
  PageTitle: any;

  ShowbtnPar:boolean=false;
  ShowbtnQar:boolean=false;
  ShowbtnFull:boolean=false;
  ShowbtnRej:boolean=false;
  ShowbtnSpecial:boolean=false;

  SearchFormgroup!: FormGroup;
  selectedRows: any[] = []; 

  insertPermissions: boolean = true;
  updatePermissions: boolean = true;
  deletePermissions: boolean = true;
  printPermissions: boolean = true;
  allPermissions: boolean = true;

   isDeliveryDetailsVisible = false;
   deliveryDetailsData: any = null;
  // Delivery totals
  deliveryTotalsOrdered: number = 0;
  deliveryTotalsDelivered: number = 0;
  deliveryTotalsOrderedMeter: number = 0;
  deliveryTotalsDeliveredMeter: number = 0;
  deliveryTotalsRolls: number = 0;


  constructor( private service:MasterEntryService,
      private getDataService: GetDataService,
      private gs: GlobalServiceService,
      private title: Title,
      private fb: FormBuilder,
      private router: Router,      
      private reportService:ReportService,
  ) { }

  /**
   * Open the generate-pi route in a new browser tab with PI_No as query param.
   * Uses window.open with an absolute URL so the browser opens a new tab.
   */
  OpenInNewTab(piNo: string) {
    try {
      const payload = { PI_No: piNo, ts: Date.now() };
      // store a short-lived transfer key for the new tab to consume
      localStorage.setItem('IMS_temp_open_pi', JSON.stringify(payload));

      const origin = window.location.origin;
      // open generate-pi without query params so PI_No isn't visible in URL
      const url = `${origin}/generate-pi`;
      window.open(url, '_blank');
    } catch (e) {
      // Fallback: try to navigate using router in same tab (will show query param)
      this.router.navigate(['/generate-pi'], { queryParams: { PI_No: piNo } });
    }
  }
  
  computeDeliveryTotals(items: any[]) {
    this.deliveryTotalsOrdered = 0;
    this.deliveryTotalsDelivered = 0;
    this.deliveryTotalsOrderedMeter = 0;
    this.deliveryTotalsDeliveredMeter = 0;
    this.deliveryTotalsRolls = 0;

    if (!items || !Array.isArray(items)) return;
    for (const it of items) {
      this.deliveryTotalsOrdered += Number(it.Ordered) || 0;
      this.deliveryTotalsDelivered += Number(it.Delivered) || 0;
      this.deliveryTotalsOrderedMeter += Number(it.Orderd_In_Meter) || 0;
      this.deliveryTotalsDeliveredMeter += Number(it.Deliverd_In_Meter) || 0;
      this.deliveryTotalsRolls += Number(it.Roll) || 0;
    }
  }

  GenerateSearchFrom() {
    this.SearchFormgroup = this.fb.group({
      PI_Status: [this.PiStatus],
      PINo: [''],
      FromDate: [''],
      ToDate: [''],
      Shipper: [''],
      Consignee: [''],
      CreateBY: [''],
      PIType: [''],
      PageNumber: [''],
      PageSize : ['']
    });

 
  }



  ngOnInit() {

    this.DataTable = [];

    this.ShowbtnPar = false;
    this.ShowbtnQar = false;
    this.ShowbtnFull = false;
    this.ShowbtnRej = false;
    this.ShowbtnSpecial = false;

    if (this.PiStatus == 'Pending') {
      this.PageTitle = 'Unapproved PI'
      this.ShowbtnPar = true;
      this.ShowbtnQar = true;
      this.ShowbtnFull = true;
      this.ShowbtnRej = true;

      var permissions = this.gs.CheckUserPermission(this.PageTitle);
      this.insertPermissions = permissions.insertPermissions;
      this.updatePermissions = permissions.updatePermissions;
      this.deletePermissions = permissions.deletePermissions;
      this.printPermissions = permissions.printPermissions;

      if (!this.printPermissions) {
        window.location.href = 'dashboard';
      }
    }
    else if (this.PiStatus == 'Partial Approved') {
      this.PageTitle = 'Partially Approved PI'
      this.ShowbtnQar = true;
      this.ShowbtnFull = true;
      this.ShowbtnSpecial = true;

      var permissions = this.gs.CheckUserPermission(this.PageTitle);
      this.insertPermissions = permissions.insertPermissions;
      this.updatePermissions = permissions.updatePermissions;
      this.deletePermissions = permissions.deletePermissions;
      this.printPermissions = permissions.printPermissions;

      if (!this.printPermissions) {
        window.location.href = 'dashboard';
      }
    }
    else if (this.PiStatus == 'Quartar Approved') {
      this.PageTitle = 'Quartar Approved PI'
      this.ShowbtnFull = true;
      this.ShowbtnSpecial = true;

      var permissions = this.gs.CheckUserPermission(this.PageTitle);
      this.insertPermissions = permissions.insertPermissions;
      this.updatePermissions = permissions.updatePermissions;
      this.deletePermissions = permissions.deletePermissions;
      this.printPermissions = permissions.printPermissions;

      if (!this.printPermissions) {
        window.location.href = 'dashboard';
      }
    }
    else if (this.PiStatus == 'Full Approved') {
      this.PageTitle = 'Full Approved PI'

      var permissions = this.gs.CheckUserPermission(this.PageTitle);
      this.insertPermissions = permissions.insertPermissions;
      this.updatePermissions = permissions.updatePermissions;
      this.deletePermissions = permissions.deletePermissions;
      this.printPermissions = permissions.printPermissions;
      
      if (!this.printPermissions) {
        window.location.href = 'dashboard';
      }
    }
    else if (this.PiStatus == 'Delivered') {
      this.PageTitle = 'Delivered PI'

      var permissions = this.gs.CheckUserPermission(this.PageTitle);
      this.insertPermissions = permissions.insertPermissions;
      this.updatePermissions = permissions.updatePermissions;
      this.deletePermissions = permissions.deletePermissions;
      this.printPermissions = permissions.printPermissions;

      if (!this.printPermissions) {
        window.location.href = 'dashboard';
      }
    }
    else if (this.PiStatus == 'ALL') {
      this.PageTitle = 'All PI'

      var permissions = this.gs.CheckUserPermission(this.PageTitle);
      this.insertPermissions = permissions.insertPermissions;
      this.updatePermissions = permissions.updatePermissions;
      this.deletePermissions = permissions.deletePermissions;
      this.printPermissions = permissions.printPermissions;

      if (!this.printPermissions) {
        window.location.href = 'dashboard';
      }
    }
    this.title.setTitle(this.PageTitle);
    // this.LoadTableData();
    this.GenerateSearchFrom();
  }
  ReloadTable(event:any) {
    this.first = event.first;
    this.rows = event.rows;
    this.first=(this.first/this.rows)+1;
    this.LoadTableData();
  }
OpenSpecialApprove(Id:number){
  Swal.fire('Not yet worked!', Id+'', 'info');
}
  ViewDetails(Id:number){

    const procedureData = {
        procedureName: 'usp_ProformaInvoice_GetDataById',
        parameters: {
          PI_Master_ID :Id
        }
      };
   
    this.isViewDetails=true;
        this.getDataService.GetInitialData(procedureData).subscribe({
        next: (results) => {
          if (results.status) {
            this.PIDetails = JSON.parse(results.data).Tables1;
            this.PIData = this.PIDetails[0];
            console.clear();
            console.log(this.PIData);
            // compute totals for details
            this.computePidTotals();
          } else if (results.msg == 'Invalid Token') {
            Swal.fire('Session Expired!', 'Please Login Again.', 'info');
            this.gs.Logout();
          }
        },
        error: (err) => { },
      });
  }

  LoadTableData(): void {
    this.SearchFormgroup.controls['PageNumber'].setValue(this.first);
    this.SearchFormgroup.controls['PageSize'].setValue(this.rows);
    let permas=this.SearchFormgroup.value;

    this.DataTable=[];
    this.isLoading = true;
    
      const procedureData = {
        procedureName: 'usp_ProformaInvoice_GetDataDataTable',
        parameters: {
          PINO :permas.PINo?permas.PINo:'',
          FromDate :permas.FromDate? this.datePipe.transform(permas.FromDate, 'yyyy-MM-dd') :'',
          ToDate :permas.ToDate? this.datePipe.transform(permas.ToDate, 'yyyy-MM-dd') :'',
          Shipper :permas.Shipper?permas.Shipper:'',
          Consignee :permas.Consignee?permas.Consignee:'',
          CreateBY :permas.CreateBY?permas.CreateBY:'',
          PIType :permas.PIType?permas.PIType:null,
          PI_Status   : this.PiStatus,
          PageNumber   : this.first,
          PageSize    : this.rows
        }
      };
     
      this.getDataService.GetInitialData(procedureData).subscribe({
        next: (results) => {
          if (results.status) {
            this.DataTable = JSON.parse(results.data).Tables1;
            this.totalRecords=this.DataTable[0]?.TotalCount;      
            this.isLoading = false;

          } else if (results.msg == 'Invalid Token') {
            Swal.fire('Session Expired!', 'Please Login Again.', 'info');
            this.gs.Logout();
            this.isLoading = false;
          }
        },
        error: (err) => { this.isLoading = false; },
      });
    }

    clearField() {
      this.GenerateSearchFrom();
      this.LoadTableData();
    }


    getSelectedRows(status:string) {
      if (this.selectedRows.length<=0) {
        return;
      }
      const selectedIds = this.selectedRows.map(r => r.PI_Master_ID);

      Swal.fire({
        title: `Do you want to ${status}?`,
        showDenyButton: true,
        confirmButtonText: "Yes",
      }).then((result) => {

        if (result.isConfirmed) {

          selectedIds.forEach((id:any)=>{
            let queryParams={Status:status,LastUpdateDate:new Date()};
            let condition={PI_Master_ID:id};
            
            this.service.UpdateData(queryParams,condition,'tbl_pi_master').subscribe({
              next: (results) => {

                if (results.status) {

                  Swal.fire(results.messageType, results.message, 'success').then(()=>{
                    this.ngOnInit();
                  });
                } 
                else if (results.message == 'Invalid Token') {
                  Swal.fire('Session Expired!', 'Please Login Again.', 'info');
                  this.gs.Logout();
                }
              },
              error: (err) => { },
            });
          });
        }
      });
    }

    DeleteData(item: any) {
        
        Swal
          .fire({
            title: 'Wait!',
            html: `<span>Once you delete, you won't be able to revert this!<br> <b>[${item.PINo}]</b></span>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
          })
          .then((result) => {
            if (result.isConfirmed == true) {
              let param = new GetDataModel();
              param.procedureName = 'usp_ProformaInvoice_Delete';
              param.parameters = {
                PI_Id: item.PI_Master_ID,
              };
    
              this.service.GetInitialData(param).subscribe({
                next: (results: any) => {
                  
                  if (results.status) {
                    var effectedRows = JSON.parse(results.data).Tables1;
                    if (effectedRows[0].AffectedRows > 0) {
                      Swal
                        .fire({
                          text: `Data Deleted Successfully !`,
                          title: `Delete Successfully!`,
                          icon: 'success',
                          timer: 5000,
                        })
                        .then((result) => {
                          this.ngOnInit();
                          this.LoadTableData();
                        });
                    }
                  } else if (results.message == 'Invalid Token') {
                    Swal.fire('Session Expired!', 'Please Login Again.', 'info');
                    this.gs.Logout();
                  } else {
                  }
                },
                error: (err) => {},
              });
            }
          });
      }

  OpenDeliveryDetails(PI_Master_ID: any) {

    const procedureData = {
      procedureName: 'usp_ProformaInvoice_DeliveryDetails_with_LCInfo',
      parameters: { PI_Master_ID: PI_Master_ID },
    };

    this.getDataService.GetInitialData(procedureData).subscribe({
      next: (results) => {
        if (results.status) {
          const items = JSON.parse(results.data).Tables1;
          this.deliveryDetailsData = {
            Items: items,
          };

          console.log(items);
          // compute delivery totals
          this.computeDeliveryTotals(items);

          this.isDeliveryDetailsVisible = true;
        } else if (results.msg === 'Invalid Token') {
          Swal.fire('Session Expired!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
          Swal.fire('Error!', 'Failed to load details.', 'error');
        }
      },
      error: () =>
        Swal.fire(
          'Error!',
          'An error occurred while fetching details.',
          'error'
        ),
    });
  }
  
  /** Compute totals for the currently loaded PIDetails */
  computePidTotals() {
    this.totalsOrderQty = 0;
    this.totalsDeliveredQty = 0;
    this.totalsAmount = 0;
    this.totalsProdCost = 0;
    this.totalsRolls = 0;

    if (!this.PIDetails || !Array.isArray(this.PIDetails)) return;

    for (const item of this.PIDetails) {
      const qty = Number(item.Quantity) || 0;
      const delivered = Number(item.Delivered_Quantity) || 0;
      const amt = Number(item.Total_Amount) || 0;
      const prodCost = Number(item.TotalCommission) || 0;

      this.totalsOrderQty += qty;
      this.totalsDeliveredQty += delivered;
      this.totalsAmount += amt;
      this.totalsProdCost += prodCost;

      // Try to read Rolls if present; common field names: Rolls, Roll
      if (item.Rolls != null) {
        this.totalsRolls += Number(item.Rolls) || 0;
      } else if (item.Roll != null) {
        this.totalsRolls += Number(item.Roll) || 0;
      } else {
        // fallback estimate: if unit indicates rolls or width exists, skip (unknown)
      }
    }
  }

   Print(){
    console.log('shuva');
    
    var item = {
      'PI_Master_ID': this.PIData?.PI_Master_ID,
    }
    this.reportService.PrintProformaInvoiceRequest(item, 'pdf','T');
  }
    
}
