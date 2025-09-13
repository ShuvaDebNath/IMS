import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
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

@Component({
  standalone:true,
  selector: 'app-pi-list',
  templateUrl: './pi-list.component.html',
  styleUrls: ['./pi-list.component.css'],
  imports: [FormsModule,ReactiveFormsModule, CommonModule, TableModule, InputTextModule, DialogModule, ButtonModule, BsDatepickerModule, DividerModule, FieldsetModule, DropdownModule]
})
export class PiListComponent implements OnInit {
  @Input() PiStatus!:any;
  datePipe = new DatePipe('en-US');
  DataTable!:any[];
  PIData!:any;
  PIDetails!:any[];
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


  constructor( private service:MasterEntryService,
      private getDataService: GetDataService,
      private gs: GlobalServiceService,
      private title: Title,
      private fb: FormBuilder
  ) { }

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

    this.DataTable=[];

    this.ShowbtnPar=false;
    this.ShowbtnQar=false;
    this.ShowbtnFull=false;
    this.ShowbtnRej=false;
    this.ShowbtnSpecial=false;

    if(this.PiStatus=='Pending'){
      this.PageTitle='Unapproved PI'
      this.ShowbtnPar=true;
      this.ShowbtnQar=true;
      this.ShowbtnFull=true;
      this.ShowbtnRej=true;
    }
    else if(this.PiStatus=='Partial Approved'){
      this.PageTitle='Partially Approved PI'
      this.ShowbtnQar=true;
      this.ShowbtnFull=true;
      this.ShowbtnSpecial=true;
    }
    else if(this.PiStatus=='Quartar Approved'){
      this.PageTitle='Quartar Approved PI'
      this.ShowbtnFull=true;
      this.ShowbtnSpecial=true;
    }
    else if(this.PiStatus=='Full Approved'){
      this.PageTitle='Full Approved PI'
    }
    else if(this.PiStatus=='Delivered'){
      this.PageTitle='Delivered PI'
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

    
      const procedureData = {
        procedureName: 'usp_ProformaInvoice_GetDataDataTable',
        parameters: {
          PINO :permas.PINO?permas.PINO:'',
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
      console.clear();
      console.log(procedureData);
      // return;
     
      this.getDataService.GetInitialData(procedureData).subscribe({
        next: (results) => {
          if (results.status) {
            this.DataTable = JSON.parse(results.data).Tables1;
            this.totalRecords=this.DataTable[0]?.TotalCount;

      

          } else if (results.msg == 'Invalid Token') {
            Swal.fire('Session Expired!', 'Please Login Again.', 'info');
            this.gs.Logout();
          }
        },
        error: (err) => { },
      });
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
}
