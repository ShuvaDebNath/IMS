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

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.css']
})
export class RoleListComponent {
pageIndex: number = 1;
  searchText: string = '';
  length = 100;
  pageSize = 10;
  isPage=false;
  pageSizeOptions: number[] = [];
  tableData = [];
  menu: any;

  insertPermissions: boolean = false;
  updatePermissions: boolean = false;
  deletePermissions: boolean = false;
  printPermissions: boolean = false;

  allPersmissions: boolean = true;

  displayedColumns: string[] = [
    'Sl',
    'Role Name',
    'Action',
  ];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  rows!: Roles[];

  constructor(
    public service: MasterEntryService,
    private gs: GlobalServiceService,
    private router: Router,
    private title:Title
  ) {
    //this.gs.CheckToken().subscribe();
  }

  ngOnInit() {
    this.menu = window.localStorage.getItem('UserMenuWithPermission');
    console.log(this.menu);
    
    this.menu = JSON.parse(this.menu);
    var buttonPermissions:any = [];
    var countFound = 0;
          this.menu.forEach((e:any)=>{
            console.log(JSON.parse(e.Children));
            e.Children = JSON.parse(e.Children);
            e.Children.forEach((childMenu:any)=>{
              if(childMenu.SubMenuName=="Roles"){
                countFound++;
                buttonPermissions = childMenu.ButtonName;
                
                if(buttonPermissions[0].ButtonName=="Insert"){
                  this.insertPermissions = true;
                }
                else if(buttonPermissions[0].ButtonName=="Update"){
                  this.updatePermissions = true;
                }
                else if(buttonPermissions[0].ButtonName=="View"){
                  this.printPermissions = true;          
                }
                else if(buttonPermissions[0].ButtonName=="Delete"){
                  this.deletePermissions = true;          
                }
              }
            });
          })
    if(countFound==0){
      window.location.href='dashboard';
    }
    this.title.setTitle('Role List');
    this.pageSizeOptions = this.gs.GetPageSizeOptions();
    this.GetAllNullTrackIdProject(
      { offset: 0 },
      this.pageIndex,
      this.pageSize,
      this.searchText
    );
  }

  GetAllNullTrackIdProject(
      pageInfo: any,
      pageIndex: number,
      pageSize: number,
      searchText: string
    ) {
      let param = new GetDataModel();
      param.procedureName = '[usp_GetRoles]';
      param.parameters = {
        PageIndex: pageIndex,
        PageSize:pageSize,
        SearchText:searchText,
      }  
  
      this.service.GetInitialData(param).subscribe({
        next: (results) => {
          if (results.status) {
  
            let tables = JSON.parse(results.data);
            this.rows = tables.Tables1
            this.isPage=this.rows[0].totallen>10;
            this.length = this.rows[0].totallen;
          } else if (results.msg == 'Invalid Token') {
            swal.fire('Session Expierd!', 'Please Login Again.', 'info');
            this.gs.Logout();
          } else {
          }
        },
        error: (err) => {},
      });
  
  
    }

    paginatiorChange(e: any) {
      this.pageIndex = e.pageIndex+1;
      this.pageSize = e.pageSize;
      this.GetAllNullTrackIdProject(e, e.pageIndex+1, e.pageSize, this.searchText);
    }

    DeleteRoles(e:any){
      swal
            .fire({
              title: 'Wait!',
              html: `<span>Once you delete, you won't be able to revert this!<br> <b>[${e.Role_Name}]</b></span>`,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Yes, delete it!',
            })
            .then((result) => {
              if (result.isConfirmed==true) {
                let param = new MasterEntryModel();
      param.tableName = 'tbl_roles';
      param.queryParams = {'Role_Name':e.Role_Name};
      param.whereParams = {'Role_id':e.Role_Id}
  
      this.service.DeleteData(param).subscribe({
        next: (results:any) => {
          console.log(results)
          if (results.status) {
            swal.fire({
                        title: `${results.message}!`,
                        text: `Save Successfully!`,
                        icon: 'success',
                        timer: 5000,
                      })
                      .then((result) => {
                        this.ngOnInit();
                      });
            this.GetAllNullTrackIdProject({ offset: 0 },
                  1,
                  this.pageSize,
                  this.searchText);
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
}
