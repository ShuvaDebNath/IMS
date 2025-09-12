import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { GetDataModel } from 'src/app/models/GetDataModel';
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-arbitration-list',
  templateUrl: './arbitration-list.component.html',
  styleUrls: ['./arbitration-list.component.css']
})
export class ArbitrationListComponent implements OnInit {
  pageIndex: number = 1;
  searchText: string = '';
  length: number = 100;
  pageSize: number = 5;
  isPage: boolean = false;

  insertPermissions: boolean = true;
  updatePermissions: boolean = true;
  deletePermissions: boolean = true;
  printPermissions: boolean = true;
  allPermissions: boolean = true;

  menu: any;
  rows: any[] = [];
  pageSizeOptions: number[] = [];

  displayedColumns: string[] = [
    'Sl',
    'Detail',
    'Action',
  ];

  constructor(
    public service: MasterEntryService,
    private gs: GlobalServiceService,
    private router: Router,
    private title: Title
  ) {}

  ngOnInit() {
    // permissions check
    this.menu = window.localStorage.getItem('UserMenuWithPermission');
    this.menu = JSON.parse(this.menu);

    let countFound = 0;
    this.menu.forEach((e: any) => {
      e.Children = JSON.parse(e.Children);
      e.Children.forEach((childMenu: any) => {
        if (childMenu.SubMenuName == 'Arbitration') {
          countFound++;
          const buttonPermissions = childMenu.ButtonName;

          buttonPermissions.forEach((btn: any) => {
            if (btn.ButtonName == 'Insert') this.insertPermissions = true;
            if (btn.ButtonName == 'Update') this.updatePermissions = true;
            if (btn.ButtonName == 'Delete') this.deletePermissions = true;
            if (btn.ButtonName == 'View') this.printPermissions = true;
          });
        }
      });
    });

    this.title.setTitle('Arbitration List');
    this.pageSizeOptions = this.gs.GetPageSizeOptions();

    // initial load
    this.getArbitration({ offset: 0 }, this.pageIndex, this.pageSize, this.searchText);
  }

  getArbitration(pageInfo: any, pageIndex: number, pageSize: number, searchText: string) {
    let param = new GetDataModel();
    param.procedureName = '[usp_GetArbitration]'; 
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
          Swal.fire('Session Expired!', 'Please Login Again.', 'info');
          this.gs.Logout();
        }
      },
      error: (err) => {},
    });
  }

  paginatiorChange(e: any) {
    this.pageIndex = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.getArbitration(e, e.pageIndex + 1, e.pageSize, this.searchText);
  }

  deleteArbitration(e: any) {
    Swal.fire({
      title: 'Wait!',
      html: `<span>Once you delete, you won't be able to revert this!<br> <b>[${e.Detail}]</b></span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed == true) {
        let param = new MasterEntryModel();
        param.tableName = 'tbl_arbitration'; // ✅ সঠিক table name
        param.queryParams = { Detail: e.Detail };
        param.whereParams = { Arbitration_ID: e.Arbitration_ID }; // ✅ arbitration এর key id

        this.service.DeleteData(param).subscribe({
          next: (results: any) => {
            if (results.status) {
              Swal.fire({
                title: `${results.message}!`,
                text: `Deleted Successfully!`,
                icon: 'success',
                timer: 3000,
              }).then(() => {
                this.getArbitration({ offset: 0 }, 1, this.pageSize, this.searchText);
              });
            } else if (results.message == 'Invalid Token') {
              Swal.fire('Session Expired!', 'Please Login Again.', 'info');
              this.gs.Logout();
            }
          },
          error: (err) => {},
        });
      }
    });
  }
}
