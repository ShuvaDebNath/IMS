import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { GetDataService } from 'src/app/services/getData/getDataService.service';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import Swal from 'sweetalert2';
import { DividerModule } from 'primeng/divider';

@Component({
  standalone:true,
  selector: 'app-pi-list',
  templateUrl: './pi-list.component.html',
  styleUrls: ['./pi-list.component.css'],
  imports: [FormsModule, CommonModule, TableModule, InputTextModule, DialogModule, ButtonModule,BsDatepickerModule,DividerModule  ]
})
export class PiListComponent implements OnInit {
@Input() PiStatus!:any;
  DataTable!:any[];
  PIData!:any;
  PIDetails!:any[];
  first: any;
  rows: any;
  totalRecords!: number;
  isViewDetails: boolean=false;
  PageTitle: any;

  ShowbtnPar:boolean=false;
  ShowbtnQar:boolean=false;
  ShowbtnFull:boolean=false;
  ShowbtnRej:boolean=false;
  ShowbtnSpecial:boolean=false;


  constructor(
      private getDataService: GetDataService,
      private masterEntyService: MasterEntryService,
      private gs: GlobalServiceService,
      private title: Title
  ) { }

  ngOnInit() {

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
    this.LoadTableData();
  }
  ReloadTable(event:any) {

     console.clear();
     console.log(event.filters);

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
      const procedureData = {
        procedureName: 'usp_ProformaInvoice_GetDataDataTable',
        parameters: {
          PINO :'',
          FromDate :'2025-01-01',
          ToDate :'2025-09-30',
          Shipper :'',
          Consignee :'',
          CreateBY :'',
          PIType :null,
          PI_Status   : this.PiStatus,
          PageNumber   : this.first,
          PageSize    : this.rows
        }
      };
     
      this.getDataService.GetInitialData(procedureData).subscribe({
        next: (results) => {
          if (results.status) {
            this.DataTable = JSON.parse(results.data).Tables1;
            this.totalRecords=this.DataTable[0].TotalCount;
          } else if (results.msg == 'Invalid Token') {
            Swal.fire('Session Expired!', 'Please Login Again.', 'info');
            this.gs.Logout();
          }
        },
        error: (err) => { },
      });
    }

}
