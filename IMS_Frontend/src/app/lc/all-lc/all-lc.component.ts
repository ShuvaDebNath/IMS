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

@Component({
  selector: 'app-all-lc',
  templateUrl: './all-lc.component.html',
  styleUrls: ['./all-lc.component.css']
})
export class AllLcComponent {
pageIndex = 0;
  searchText = '';
  length = 100;
  pageSize = 10;
    tableData!: LC[];
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
  LCNo:string='';

  showPaginator = false;
  insertPermissions: boolean = true;
  updatePermissions: boolean = true;
  deletePermissions: boolean = true;
  printPermissions: boolean = true;
  allPersmissions: boolean = true;
  getDataModel: GetDataModel = new GetDataModel();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private gs: GlobalServiceService,
    private pagesComponent: PagesComponent,
    private masterEntryService: MasterEntryService,
    private title:Title
  ) {
  }
  ngOnInit(): void {
    
    this.initForm();
    this.pageSizeOptions = this.gs.GetPageSizeOptions();
    this.title.setTitle('All LC');
    this.Search();
  }
  initForm(): void {
    this.SearchForm = this.fb.group({
      fromDate: ['',[Validators.required]],
      toDate: ['',[Validators.required]],
      lcNo: [''],
    });
  }
  Search(){
    let param = new GetDataModel();
    param.procedureName = '[usp_LCList]';
    param.parameters = {
      FromDate: this.SearchForm.value.fromDate,
      ToDate: this.SearchForm.value.toDate,
      LCNo: this.SearchForm.value.lcNo,
      PageIndex:this.pageIndex,
      PageSize:this.pageSize      
    };

    this.masterEntryService.GetInitialData(param).subscribe({
      next: (results) => {
        console.log(results);
        
        if (results.status) {
          this.tableData = [];
          let tables = JSON.parse(results.data);
          this.tableData = tables.Tables1;
          console.log(this.tableData);
          

        }

      }

    });

  }

  DeleteData(item:any){

  }

  paginatiorChange(e: any) {
      this.pageIndex = e.pageIndex+1;
      this.pageSize = e.pageSize;
      this.Search();
    }
}
