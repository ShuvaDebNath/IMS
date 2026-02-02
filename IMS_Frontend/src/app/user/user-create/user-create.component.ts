import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { LC } from 'src/app/models/LCModel';
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';
import { Roles } from 'src/app/models/roles.model';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import swal from 'sweetalert2';


@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css'],
})
export class UserCreateComponent {
  Formgroup!: FormGroup;
    isEdit = false;
    Id!: string;
    companyId!: string;
    menu: any;
    MarketingConcern: any;
    BenificiaryAccounts: any;
    PaymentTerms: any;
    PINo: any;
    SuperiorList:any;
    RoleList:any;
    SupplierList:any;
  
    insertPermissions: boolean = false;
    updatePermissions: boolean = false;
    deletePermissions: boolean = false;
    printPermissions: boolean = false;

    IsSupplierList:any = [
      { label: 'True', value: true },
      { label: 'False', value: false },
    ];
  
    constructor(
      private fb: FormBuilder,
      private masterEntyService: MasterEntryService,
      private gs: GlobalServiceService,
      private activeLink: ActivatedRoute,
      private title: Title
    ) {
      // this.gs.CheckToken().subscribe();
      let has = this.activeLink.snapshot.queryParamMap.has('Id');
      if (has) {
        this.Id = this.activeLink.snapshot.queryParams['Id'];
        this.isEdit = true;
      } else {
        this.isEdit = false;
      }
    }
  
    ngOnInit() {
      // var permissions = this.gs.CheckUserPermission("User");
      // console.log(permissions);
      
      // this.insertPermissions = permissions.insertPermissions;
      // this.updatePermissions = permissions.updatePermissions;
      // this.deletePermissions = permissions.deletePermissions;
      // this.printPermissions = permissions.printPermissions;
  
      // if (!this.insertPermissions) {
      //  // window.location.href = 'dashboard';
      // }
      // if (!this.updatePermissions && this.isEdit) {
      //   //window.location.href = 'dashboard';
      // }
  
      this.title.setTitle('User Create');
      this.GenerateFrom();
      this.setupSupplierValidator();
      this.getInitialData();
  
      if (this.isEdit) {
        this.GetUser();
      }
    }
  
    GenerateFrom() {
      const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      const passwordValidators = this.isEdit 
        ? []
        : [Validators.required, Validators.pattern(passwordPattern)];
      
      this.Formgroup = this.fb.group({
        UserName: ['', [Validators.required]],
        Password: ['', passwordValidators],
        Role: ['', [Validators.required]],
        Superior: ['', [Validators.required]],
        Supplier: [''],
        IsSupplier: ['', [Validators.required]],
        IsAuthorized: ['', [Validators.required]],
        Email: ['', [Validators.required, Validators.email]],
      });
    }

    setupSupplierValidator() {
      const isSupplierControl = this.Formgroup.get('IsSupplier');
      const supplierControl = this.Formgroup.get('Supplier');
      if (!isSupplierControl || !supplierControl) return;

      const applyValidators = (val: any) => {
        const truthy = val === true || val === 'True' || val === 1 || val === '1' || val === 'true';
        if (truthy) {
          supplierControl.setValidators([Validators.required]);
        } else {
          supplierControl.clearValidators();
          supplierControl.setValue('');
        }
        supplierControl.updateValueAndValidity({ onlySelf: true });
      };

      // apply initial state
      applyValidators(isSupplierControl.value);

      // react to changes
      isSupplierControl.valueChanges.subscribe((v) => applyValidators(v));
    }
  
    getInitialData() {
      var ProcedureData = {
        procedureName: '[usp_User_GetInitialData]',
        parameters: {},
      };
  
      this.masterEntyService.GetInitialData(ProcedureData).subscribe({
        next: (results) => {
          if (results.status) {
            this.SuperiorList = JSON.parse(results.data).Tables1;
            this.RoleList = JSON.parse(results.data).Tables2;
            this.SupplierList = JSON.parse(results.data).Tables3;
          } else if (results.msg == 'Invalid Token') {
            swal.fire('Session Expierd!', 'Please Login Again.', 'info');
            this.gs.Logout();
          } else {
          }
        },
        error: (err) => {},
      });
    }
  
    
    saveData() {

      console.log(this.Formgroup);
      
      if (this.Formgroup.invalid) {
        swal.fire(
          'Invlid Inputs!',
          'Form is Invalid! ',
          'info'
        );
        return;
      }
  
      var fDate = new Date();
      const mm = String(fDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      const dd = String(fDate.getDate()).padStart(2, '0');
      const yyyy = fDate.getFullYear();
  
      const formatted = `${mm}/${dd}/${yyyy}`;
      var checkUser = this.CheckUserExist(this.Formgroup.value.UserName)==null?1:this.CheckUserExist(this.Formgroup.value.UserName);
      console.log(checkUser);
      
      if(checkUser>0){
        swal.fire('info','User name already exist please choose diff username','error')
        return
      }
      const isSupplierTruthy = this.Formgroup.value.IsSupplier === true || this.Formgroup.value.IsSupplier === 'True';
      var user: any = {
        UserName: this.Formgroup.value.UserName,
        Password: this.Formgroup.value.Password,
        Role_id: this.Formgroup.value.Role,
        Superior_ID: this.Formgroup.value.Superior,
        IsSupplier: isSupplierTruthy ? true : false,
        IsAuthorized: this.Formgroup.value.IsAuthorized=='True' ? true : false,
        Email: this.Formgroup.value.Email
      }
      if (isSupplierTruthy && this.Formgroup.value.Supplier) {
        user.Supplier_ID = this.Formgroup.value.Supplier;
      }
      
  
      this.masterEntyService
        .SaveUserData(
          user,
          'tbl_users'
        )
        .subscribe((res: any) => {
          console.log(res);
          if (res.status) {
            if (res.message == 'User Already Exist!' ) {
              swal.fire('Username already exists!', 'Please choose a different username.', 'warning');
              return
            } 
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
            if (res.message == 'Data already exist' || res.message.toLowerCase().includes('duplicate')) {
              swal.fire('Username already exists!', 'Please choose a different username.', 'warning');
            } else if (res.message == 'Invalid Token') {
              swal.fire('Session Expierd!', 'Please Login Again.', 'info');
              this.gs.Logout();
            } 
            else {
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
  
    GetUser() {
      var ProcedureData = {
        procedureName: '[usp_User_GetDataById]',
        parameters: {
          Id: this.Id,
        },
      };
      this.masterEntyService.GetInitialData(ProcedureData).subscribe({
        next: (results) => {
          if (results.status) {
            var tableData = JSON.parse(results.data).Tables1;
  
            tableData.forEach((e: any) => {

              this.Formgroup.controls.UserName.setValue(e.UserName);
              this.Formgroup.controls.Password.setValue(
                e.Password
              );
              this.Formgroup.controls.Role.setValue(e.Role_id);
              this.Formgroup.controls.Superior.setValue(
                e.Superior_ID
              );
              this.Formgroup.controls.Supplier.setValue(
                e.Supplier_ID
              );
              this.Formgroup.controls.IsSupplier.setValue(e.IsSupplier);
              this.Formgroup.controls.IsAuthorized.setValue(e.IsAuthorized);
              this.Formgroup.controls.Email.setValue(e.Email);
            });
          } else if (results.message == 'Invalid Token') {
            swal.fire('Session Expierd!', 'Please Login Again.', 'info');
            this.gs.Logout();
          } else {
          }
        },
        error: (err) => {},
      });
    }

    CheckUserExist(UserName:any) {
      var ProcedureData = {
        procedureName: '[usp_User_CheckUser]',
        parameters: {
          UserName: UserName,
        },
      };
      let userCount = 0;
      this.masterEntyService.GetInitialData(ProcedureData).subscribe({
        next: (results) => {
          if (results.status) {
            var tableData = JSON.parse(results.data).Tables1;
            
            userCount = tableData.length;
            console.log(tableData,userCount);
            
          } else if (results.message == 'Invalid Token') {
            swal.fire('Session Expierd!', 'Please Login Again.', 'info');
            this.gs.Logout();
          } else {
            userCount = 0;
          }
        },
        error: (err) => {},
      });
      return userCount;
    }
  
    updateData() {
      console.log(this.Formgroup);
      
      if (this.Formgroup.invalid) {
        swal.fire(
          'Invlid Inputs!',
          'Form is Invalid!',
          'info'
        );
        return;
      }
  
      const isSupplierTruthy = this.Formgroup.value.IsSupplier === true || this.Formgroup.value.IsSupplier === 'True';
      var user: any = {
        UserName: this.Formgroup.value.UserName,
        Role_id: this.Formgroup.value.Role,
        Superior_ID: this.Formgroup.value.Superior,
        IsSupplier: isSupplierTruthy ? true : false,
        IsAuthorized: this.Formgroup.value.IsAuthorized=='True' ? true : false,
        Email: this.Formgroup.value.Email,
        User_ID: this.Id
      }
      if (isSupplierTruthy && this.Formgroup.value.Supplier) {
        user.Supplier_ID = this.Formgroup.value.Supplier;
      }
      
  
      this.masterEntyService
        .EditUserData(
          user,
          'tbl_users'
        )
        .subscribe((res: any) => {
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
            if (res.message == 'Data already exist' || res.message.toLowerCase().includes('duplicate')) {
              swal.fire('Username already exists!', 'Please choose a different username.', 'warning');
            } else if (res.message == 'Invalid Token') {
              swal.fire('Session Expierd!', 'Please Login Again.', 'info');
              this.gs.Logout();
            } else {
              swal.fire({
                title: `Faild!`,
                text: `Update Faild!`,
                icon: 'info',
                timer: 5000,
              });
            }
          }
        });
    }
}
