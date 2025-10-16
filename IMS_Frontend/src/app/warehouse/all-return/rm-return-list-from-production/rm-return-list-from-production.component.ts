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

@Component({
  selector: 'app-rm-return-list-from-production',
  templateUrl: './rm-return-list-from-production.component.html',
  styleUrls: ['./rm-return-list-from-production.component.css']
})
export class RmReturnListFromProductionComponent {
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
  isEdit:any;
  page = new Page();
  rows: any;
  SearchForm!: FormGroup;
  fromDate: any;
  toDate: any;
  LCNo: string = '';
  CR_Id:any;
  tableVisible:boolean = false;
  detailsTableData:any;
  warehouseList:any;


  showPaginator = false;
  insertPermissions: boolean = true;
  updatePermissions: boolean = true;
  deletePermissions: boolean = true;
  printPermissions: boolean = true;
  allPersmissions: boolean = true;
  getDataModel: GetDataModel = new GetDataModel();
  detailsData: any;
  isDetailsVisible: boolean = false;
  RMReturnID = ''

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private gs: GlobalServiceService,
    private pagesComponent: PagesComponent,
    private masterEntryService: MasterEntryService,
    private activeLink: ActivatedRoute,
    private title: Title
  ) {}
  ngOnInit(): void {

    var permissions = this.gs.CheckUserPermission("RM Return List To Supplier");
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;

    if (!this.printPermissions) {
      window.location.href = 'dashboard';
    }
    
    
    this.initForm();
    this.pageSizeOptions = this.gs.GetPageSizeOptions();
    this.title.setTitle('RM Return List To Supplier');

    //this.Search();
  }
  initForm(): void {
    this.SearchForm = this.fb.group({
      fromDate: ['', [Validators.required]],
      toDate: ['', [Validators.required]],
    });
  }
  Search() {    
    var fromDate = this.SearchForm.value.fromDate;
    var toDate = this.SearchForm.value.toDate;    
    
    let param = new GetDataModel();
    param.procedureName = '[usp_IssueRM_Pending_List]';
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
          this.tableVisible = true;
          let tables = JSON.parse(results.data);
          this.tableData = tables.Tables1;
          this.warehouseList = tables.Tables2;
          console.log(this.warehouseList);
          
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

  viewDetails(table:any){
      this.isDetailsVisible = true;
      console.log(table);
      
      this.RMReturnID = table.ReturnID;
      let param = new GetDataModel();
      param.procedureName = '[usp_IssueRM_Return_Details]';
      param.parameters = {
        RM_Send_MasterID: table.RM_Send_MasterID,     
      };

    this.masterEntryService.GetInitialData(param).subscribe({
      next: (results) => {
        
        if (results.status) {
          let tables = JSON.parse(results.data);
          console.log(tables);
          
          this.detailsTableData = tables.Tables1;
        }
      }
    });
    }

    ResolveRMReturn(table:any){
      
      
          let queryParams = {
            'Status':'Resolved',
            'Stock_Location_ID':table[0].Stock_Location_ID
          };
          let condition = {
            'ReturnId': this.RMReturnID,
          };
          let tableName = 'tbl_rm_return';
          
          this.masterEntryService
            .UpdateData(queryParams, condition, tableName)
            .subscribe((res: any) => {
              if (res.status) {
                this.isDetailsVisible = false;
                swal
                  .fire({
                    title: `${res.message}!`,
                    text: `Return Resolved!`,
                    icon: 'success',
                    timer: 5000,
                  })
                  .then((result) => {
                    this.Search();
                  });
              } else {
                if (res.message == 'Invalid Token') {
                  swal.fire('Session Expierd!', 'Please Login Again.', 'info');
                  this.gs.Logout();
                } else {
                  swal.fire({
                    title: `Faild!`,
                    text: `Save Faild!`,
                    icon: 'error',
                    timer: 5000,
                  });
                }
              }
            });
    }

    StockLocationChange(e:any,table:any){
      table[0].Stock_Location_ID = e.target.value;
    }
}
