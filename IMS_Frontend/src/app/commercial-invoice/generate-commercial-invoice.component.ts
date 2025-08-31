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
  selector: 'app-generate-commercial-invoice',
  templateUrl: './generate-commercial-invoice.component.html',
  styleUrls: ['./generate-commercial-invoice.component.css']
})
export class GenerateCommercialInvoiceComponent {
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
    let has = this.activeLink.snapshot.queryParamMap.has('commercialinvoice');
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
              if(childMenu.SubMenuName=="Generate Commercial Invoice"){
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
      window.location.href='role-list';
    }

    this.title.setTitle('Role');
    this.GenerateFrom();
    this.GetBasicData();

    if (this.isEdit) {
        //this.GetRoleById(this.RoleId);
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
}
