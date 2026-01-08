import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AccLedger } from 'src/app/models/acc-ledger/AccLedger.model.';
import { Page } from 'src/app/models/Page';
import { GlobalServiceService } from '../../services/Global-service.service';
//Material Datatable
import { MatPaginator } from '@angular/material/paginator';
//!--Material Datatable
import swal from 'sweetalert2';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import { GetDataModel } from 'src/app/models/GetDataModel';
import { Units } from 'src/app/models/units.model';
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';
import { Title } from '@angular/platform-browser';
import { Roles } from 'src/app/models/roles.model';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent {
  pageIndex: number = 1;
  searchText: string = '';
  length = 100;
  pageSize = 10;
  isPage = false;
  pageSizeOptions: number[] = [];
  tableData = [];
  RoleList = [];
  menu: any;
  SearchForm!: FormGroup;

  insertPermissions: boolean = false;
  updatePermissions: boolean = false;
  deletePermissions: boolean = false;
  printPermissions: boolean = false;

  allPersmissions: boolean = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  rows = [];

  constructor(
    public service: MasterEntryService,
    private gs: GlobalServiceService,
    private router: Router,
    private fb: FormBuilder,
    private title: Title
  ) {
    //this.gs.CheckToken().subscribe();
  }

  ngOnInit() {
    var permissions = this.gs.CheckUserPermission('User');

    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;

    if (!this.printPermissions) {
       //window.location.href = 'dashboard';
    }

    this.title.setTitle('User List');
    this.initForm();
    this.getInitialData();
    this.Search();
  }

  initForm(): void {
    this.SearchForm = this.fb.group({
      Role: [''],
    });
  }

  getInitialData() {
    var ProcedureData = {
      procedureName: '[usp_User_GetInitialData]',
      parameters: {},
    };

    this.service.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        if (results.status) {
          this.RoleList = JSON.parse(results.data).Tables2;
        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
        }
      },
      error: (err) => {},
    });
  }
  Search() {
    let param = new GetDataModel();
    param.procedureName = '[usp_User_List]';
    param.parameters = {
      RoleId: this.SearchForm.value.Role,
    };

    this.service.GetInitialData(param).subscribe({
      next: (results) => {
        if (results.status) {
          let tables = JSON.parse(results.data);

          this.tableData = tables.Tables1;
        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
        }
      },
      error: (err) => {},
    });
  }

  DeleteData(e: any) {
    swal
      .fire({
        title: 'Wait!',
        html: `<span>Once you delete, you won't be able to revert this!<br> <b>[${e.UserName}]</b></span>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      })
      .then((result) => {
        if (result.isConfirmed == true) {
          let param = new MasterEntryModel();
          param.tableName = 'tbl_users';
          param.whereParams = { User_Id: e.User_ID };

          this.service.DeleteData(param).subscribe({
            next: (results: any) => {
              if (results.status) {
                swal
                  .fire({
                    title: `${results.message}!`,
                    text: `Save Successfully!`,
                    icon: 'success',
                    timer: 5000,
                  })
                  .then((result) => {
                    this.ngOnInit();
                  });
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

  viewDetails(e: any) {
    this.router.navigate(['/change-password'], {
      queryParams: { Id: e.User_ID },
    });
  }
}
