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
import { ReportService } from 'src/app/services/reportService/report-service.service';

@Component({
  selector: 'app-all-task-details-report',
  templateUrl: './all-task-details-report.component.html',
  styleUrls: ['./all-task-details-report.component.css']
})
export class AllTaskDetailsReportComponent {
pageIndex = 1;
  searchText = '';
  length = 100;
  pageSize = 10;
  tableData!: [];
  detailsDataTable!: [];
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

  showPaginator = false;
  insertPermissions: boolean = true;
  updatePermissions: boolean = true;
  deletePermissions: boolean = true;
  printPermissions: boolean = true;
  allPersmissions: boolean = true;
  getDataModel: GetDataModel = new GetDataModel();
  detailsData: any;
  isDetailsVisible: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private gs: GlobalServiceService,
    private pagesComponent: PagesComponent,
    private masterEntryService: MasterEntryService,
    private title: Title,
    private reportService: ReportService
  ) {}
  ngOnInit(): void {
    var permissions = this.gs.CheckUserPermission('All Task Details Report');
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;

    this.initForm();
    this.pageSizeOptions = this.gs.GetPageSizeOptions();
    this.title.setTitle('All Task Details Report');

  }
  initForm(): void {
    this.SearchForm = this.fb.group({
      fromDate: ['', [Validators.required]],
      toDate: ['', [Validators.required]],
    });
  }
  Search() {
    var finput = new Date();
    var fromDate = this.SearchForm.value.fromDate;    
    var toDate = this.SearchForm.value.toDate;

    let param = new GetDataModel();
    param.procedureName = '[usp_Task_Details_Report]';
    param.parameters = {
      FromDate: fromDate,
      ToDate: toDate,
    };

    this.masterEntryService.GetInitialData(param).subscribe({
      next: (results) => {
        console.log(results);
        
        if (results.status) {
          this.tableData = [];
          let tables = JSON.parse(results.data);
          this.tableData = tables.Tables1;
          
          //  this.isPage=this.rows[0].totallen>10;
        }
      },
    });
  }

  PrintReport() {
    var finput = new Date();
    var fromDate = this.SearchForm.value.fromDate;    
    var toDate = this.SearchForm.value.toDate;

    let param = new GetDataModel();
    param.procedureName = '[usp_Task_Details_Report]';
    param.parameters = {
      FromDate: fromDate,
      ToDate: toDate,
    };

    this.masterEntryService.GetInitialData(param).subscribe({
      next: (results) => {
        console.log(results);
        
        if (results.status) {
          this.tableData = [];
          let tables = JSON.parse(results.data);
          this.tableData = tables.Tables1;
          
          this.reportService.PrintTaskDetails(
            { fromDate: fromDate, toDate: toDate },
            'pdf',
            true
          );
          //  this.isPage=this.rows[0].totallen>10;
        }
      },
    });
  }
}
