import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { GetDataModel } from 'src/app/models/GetDataModel';
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-applicantbank-list',
  templateUrl: './applicantbank-list.component.html',
  styleUrls: ['./applicantbank-list.component.css']
})
export class ApplicantbankListComponent implements OnInit{
  pageIndex: number = 1;
  searchText: string = '';
  length = 100;
  pageSize = 5;
  isPage = false;
  pageSizeOptions: number[] = [];
  rows: any[] = [];

  insertPermissions: boolean = true;
  updatePermissions: boolean = true;
  deletePermissions: boolean = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    public service: MasterEntryService,
    private gs: GlobalServiceService,
    private router: Router,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle('Applicant Bank List');
    this.pageSizeOptions = this.gs.GetPageSizeOptions();
    this.getApplicantBanks({ offset: 0 }, this.pageIndex, this.pageSize, this.searchText);
  }

  getApplicantBanks(pageInfo: any, pageIndex: number, pageSize: number, searchText: string) {
    let param = new GetDataModel();
    param.procedureName = '[usp_GetApplicantBank]'; // 👉 SQL এ এই SP তৈরি করতে হবে
    param.parameters = {
      PageIndex: pageIndex,
      PageSize: pageSize,
      SearchText: searchText,
    };

    this.service.GetInitialData(param).subscribe({
      next: (results) => {
        if (results.status) {
          let tables = JSON.parse(results.data);
          this.rows = tables.Tables1;
          this.isPage = this.rows[0]?.TotalLen > 10;
          this.length = this.rows[0]?.TotalLen || 0;
        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expired!', 'Please Login Again.', 'info');
          this.gs.Logout();
        }
      }
    });
  }

  paginatiorChange(e: any) {
    this.pageIndex = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.getApplicantBanks(e, e.pageIndex + 1, e.pageSize, this.searchText);
  }

  deleteApplicantBank(e: any) {
    console.log(e)
    swal
      .fire({
        title: 'Wait!',
        html: `<span>Once you delete, you won't be able to revert this!<br> <b>[${e.BankName}]</b></span>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      })
      .then((result) => {
        if (result.isConfirmed) {
          let param = new MasterEntryModel();
          param.tableName = 'tbl_applicant_bank';
          param.queryParams = { BankName: e.BankName };
          param.whereParams = { Applicant_Bank_ID: e.Applicant_Bank_ID };

          this.service.DeleteData(param).subscribe({
            next: (results: any) => {
              if (results.status) {
                swal
                  .fire({
                    title: `${results.message}!`,
                    text: `Deleted Successfully!`,
                    icon: 'success',
                    timer: 3000,
                  })
                  .then(() => {
                    this.getApplicantBanks({ offset: 0 }, 1, this.pageSize, this.searchText);
                  });
              } else if (results.message == 'Invalid Token') {
                swal.fire('Session Expired!', 'Please Login Again.', 'info');
                this.gs.Logout();
              }
            }
          });
        }
      });
  }
}