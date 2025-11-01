import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';
import { Roles } from 'src/app/models/roles.model';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-role-create',
  templateUrl: './role-create.component.html',
  styleUrls: ['./role-create.component.css']
})
export class RoleCreateComponent {
  RolName:any;
  Formgroup!: FormGroup;
  isEdit = false;
  RoleId!: string;
  companyId!:string;
  menu: any;

  insertPermissions: boolean = false;
  updatePermissions: boolean = false;
  deletePermissions: boolean = false;
  printPermissions: boolean = false;

  constructor(
    private fb: FormBuilder,
    private masterEntyService: MasterEntryService,
    private gs: GlobalServiceService,
    private activeLink: ActivatedRoute,
    private title: Title,
  ) {
    // this.gs.CheckToken().subscribe();
    let has = this.activeLink.snapshot.queryParamMap.has('Role_Id');
    if (has) {
      this.RoleId = this.activeLink.snapshot.queryParams['Role_Id'];
      this.isEdit = true;
    } else {
      this.isEdit = false;
    }
  }

  ngOnInit() {
    this.menu = window.localStorage.getItem('UserMenuWithPermission');
    this.menu = JSON.parse(this.menu);
    var buttonPermissions:any = [];
    var countFound = 0;
          this.menu.forEach((e:any)=>{
            e.Children = JSON.parse(e.Children);
            e.Children.forEach((childMenu:any)=>{
              if(childMenu.SubMenuName=="Roles"){
                countFound++;
                buttonPermissions = childMenu.ButtonName;
              }
            });
          })
    if(countFound==0){
      window.location.href='dashboard';
    }
    else{
      buttonPermissions.forEach((buttonCheck:any)=>{
        if(buttonCheck.ButtonName=="Insert"){
          this.insertPermissions = true;
        }
      });
    }
    
    if(!this.insertPermissions){
      //window.location.href='role-list';
    }

    this.title.setTitle('Role');
    this.GenerateFrom();
    this.GetBasicData();

    if (this.isEdit) {
        this.GetRoleById(this.RoleId);
    }

  }

  GenerateFrom() {
    this.Formgroup = this.fb.group({
      Role_Name:['',[Validators.required]]
    });
  }

  GetBasicData() {
    // document.body.style.cursor = 'wait';
    // this.vs.GetVoucherDateValidationBasicData().subscribe((res:any) => {
    //   document.body.style.cursor = 'auto';
    //   if (res.ok) {
    //     this.voucherDateValidationBasicData = JSON.parse(res.voucherDateValidationBasicData);
    //     if (this.isEdit) {
    //       this.GetVoucherDateValidationById();
    //     }
    //   } else {
    //     if (res.msg == 'Invalid Token') {
    //       this.gs.Logout();
    //     } else {
    //     }
    //   }
    // });
  }

  GetRoleById(roleId:any) {
    var masterEntryModel = new MasterEntryModel();
    masterEntryModel.tableName = 'tbl_Roles';
    masterEntryModel.columnNames = 'Role_Id,Role_Name';
    masterEntryModel.whereParams = '{"Role_Id":'+this.RoleId+'}'
    this.masterEntyService.GetEditData(masterEntryModel).subscribe((res:any) => {
      
      if (res.status) {
        let UserRole = JSON.parse(res.data)[0];
        
        this.Formgroup.controls.Role_Name.setValue(UserRole.Role_Name);
      } else {
        if (res.msg == 'Invalid Token') {
          this.gs.Logout();
        } else {
        }
      }
    });
  }

  saveData(){
    if (this.Formgroup.invalid) {
      swal.fire('Invlid Inputs!', 'Form is Invalid! Please select Role.', 'info');
      return;
    }
    var role = new Roles();
    role.Role_Name = this.Formgroup.value.Role_Name;
    role.IsBuiltIn =false;
    this.masterEntyService.SaveSingleData(role,'tbl_Roles').subscribe((res:any) => {
      
      if (res.status) {
        swal
          .fire({
            title: `${res.message}!`,
            text: `Save Successfully!`,
            icon: 'success',
            timer: 5000,
          })
          .then((result) => {
            this.ngOnInit();
          });

      } else {

        if(res.message == 'Data already exist'){
          swal.fire('Data already exist', '', 'warning');
        }
        else if (res.message == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
            swal.fire({
              title: `Faild!`,
              text: `Save Faild!`,
              icon: 'info',
              timer: 5000,
            });
        }
      }
    });
  }

  updateData() {

    if (this.Formgroup.invalid) {
      swal.fire('Invaild Input', 'Please check inputs', 'info');
      return;
    }
   var role = new Roles();
    role.Role_Name = this.Formgroup.value.Role_Name;
    role.IsBuiltIn =false;

    var masterEntryModel =new MasterEntryModel()

    masterEntryModel.tableName = "tbl_Roles";
    masterEntryModel.queryParams = role;
    masterEntryModel.whereParams = {'Role_Id':this.RoleId}

    
    let queryParams = role
    let condition = {
      Role_Id: this.RoleId
    }
    let tableName = 'tbl_Roles';

    this.masterEntyService.UpdateData(queryParams,condition,tableName).subscribe((res:any) => {
      if (res.status) {
        swal
          .fire({
            title: `${res.message}!`,
            text: `Update Successfully!`,
            icon: 'success',
            timer: 5000,
          })
          .then((result) => {
            this.ngOnInit();
          });
      } else {
        if (res.message == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
          swal.fire({
            title: `Faild!`,
            text: `Save Faild!`,
            icon: 'info',
            timer: 5000,
          });
        }
      }
    });
  }
}


