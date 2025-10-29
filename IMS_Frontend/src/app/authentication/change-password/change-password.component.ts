import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { GlobalConfig } from 'src/app/global-config.config';
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';
import { ResetPasswords } from 'src/app/models/ResetPasswords';
import { Roles } from 'src/app/models/roles.model';
import { LoginServiceService } from 'src/app/services/authentication/Login-service.service';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  userId: any = '';
  Formgroup!: FormGroup;
    token:any;
    readonly getapiController = 'GetData';
  constructor(
      private fb: FormBuilder,
      private masterEntyService: MasterEntryService,
      private loginService:LoginServiceService,
      private gs: GlobalServiceService,
      private activeLink: ActivatedRoute,
      private title: Title) { }

  ngOnInit(): void {
    this.userId = window.localStorage.getItem('userId');
    this.GenerateFrom();
    this.title.setTitle('Change Password');
  }
  GenerateFrom() {
    this.Formgroup = this.fb.group({
      NewPassword:['',[Validators.required]],
      ConfirmPassword:['',[Validators.required]]
    });
  }
  ResetPassword() {
  
      if (this.Formgroup.invalid) {
        swal.fire('Invaild Input', 'Please check inputs', 'info');
        return;
      }
      if(this.Formgroup.value.NewPassword!=this.Formgroup.value.ConfirmPassword){
        swal.fire('Invaild Input', 'New Password and Confirm Password not matched', 'info');
        return;
      }
     var role = new Roles();
  
      var resetPass =new ResetPasswords()
  
      resetPass.Id = this.userId;
      resetPass.NewPassword = this.Formgroup.value.NewPassword;
      resetPass.ConfirmPassword = this.Formgroup.value.ConfirmPassword;
  
      
  
      this.loginService.ResetPassword(resetPass).subscribe((res:any) => {
        if (res.status) {
          swal
            .fire({
              title: `${res.message}!`,
              text: `Password Reset Successfully!`,
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
