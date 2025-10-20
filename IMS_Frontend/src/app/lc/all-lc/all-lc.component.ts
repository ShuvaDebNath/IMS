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

@Component({
  selector: 'app-all-lc',
  templateUrl: './all-lc.component.html',
  styleUrls: ['./all-lc.component.css'],
})
export class AllLcComponent {
  pageIndex = 1;
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
  LCNo: string = '';

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
    private title: Title
  ) {}
  ngOnInit(): void {
    this.initForm();
    this.pageSizeOptions = this.gs.GetPageSizeOptions();
    this.title.setTitle('All LC');

    var fDate = new Date();
    const mm = String(fDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(fDate.getDate()).padStart(2, '0');
    const yyyy = fDate.getFullYear();

    const formatted = `${dd}/${mm}/${yyyy}`;

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(fDate.getMonth() - 3);

    const mmT = String(threeMonthsAgo.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const ddT = String(threeMonthsAgo.getDate()).padStart(2, '0');
    const yyyyT = threeMonthsAgo.getFullYear();

    const formattedT = `${ddT}/${mmT}/${yyyyT}`;

    this.SearchForm.get('fromDate')?.setValue(formattedT);
    this.SearchForm.get('toDate')?.setValue(formatted);

    this.Search();
  }
  initForm(): void {
    this.SearchForm = this.fb.group({
      fromDate: ['', [Validators.required]],
      toDate: ['', [Validators.required]],
      lcNo: [''],
    });
  }
  Search() {
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
    param.procedureName = '[usp_LC_List]';
    param.parameters = {
      FromDate: fromDate,
      ToDate: toDate,
      LCNo: this.SearchForm.value.lcNo,
      PageIndex: this.pageIndex,
      PageSize: this.pageSize,
    };

    this.masterEntryService.GetInitialData(param).subscribe({
      next: (results) => {
        if (results.status) {
          this.tableData = [];
          let tables = JSON.parse(results.data);
          this.tableData = tables.Tables1;
          if (this.tableData.length > 0) {
            this.length = parseInt(this.tableData[0].totallen);
          } else {
            swal.fire('info', 'No Data Found!!', 'info');
          }
          //  this.isPage=this.rows[0].totallen>10;
        }
      },
    });
  }

  DeleteData(item: any) {
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
        if (result.isConfirmed == true) {
          let param = new GetDataModel();
          param.procedureName = 'usp_LC_Delete';
          param.parameters = {
            LC_ID: item.LC_ID,
          };

          this.masterEntryService.GetInitialData(param).subscribe({
            next: (results: any) => {
              if (results.status) {
                var effectedRows = JSON.parse(results.data).Tables1;
                if (effectedRows[0].AffectedRows > 0) {
                  swal
                    .fire({
                      text: `Data Deleted Successfully !`,
                      title: `Delete Successfully!`,
                      icon: 'success',
                      timer: 5000,
                    })
                    .then((result) => {
                      this.ngOnInit();
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

  paginatiorChange(e: any) {
    this.pageIndex = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.Search();
  }

  viewDetails(table: any) {
    this.isDetailsVisible = true;
    this.detailsData = table;
  }
}
