import { Component, OnInit } from '@angular/core';
import swal from 'sweetalert2';
import{ Router } from '@angular/router';
import { LoginServiceService } from '../../services/authentication/Login-service.service';
import { GlobalServiceService } from '../../services/Global-service.service';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import { GetDataModel } from 'src/app/models/GetDataModel';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  //fiscalYears: any;
  companyList: any;
  companyId: any;
  LoginForm!: FormGroup;
  isSubmit = false;
  comLogoPath="";
  comImagePath="";
  constructor(private router: Router,private service: LoginServiceService, private fb: FormBuilder,private gs:GlobalServiceService,private ms:MasterEntryService) {
    gs.ClearSession();
  }

  ngOnInit(): void {
    this.LoginForm = this.fb.group({
      userName: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
    this.GetBasicData('');
  }

  GetBasicData(comId:string) {
    this.service.GetBasicData().subscribe((res) => {
      if (comId=='') {
        this.companyList = JSON.parse(res.companylist);
        this.comLogoPath=this.gs.baseUrl+this.companyList[0].ComLogo;
        this.comImagePath=this.gs.baseUrl+this.companyList[0].ComImage;
      }
      //this.fiscalYears = JSON.parse(res.fiscalyearlist);
    });
  }

  login(): void {
    this.isSubmit = true;
    if (this.LoginForm.invalid) {
      swal.fire('Invalid Input', '', 'error');
      return;
    }
    console.log(this.LoginForm.value);
    this.service.UserLogin(this.LoginForm.value).subscribe((res) => {
      console.log(res);
      if (res.isAuthorized) {
        // let company = this.companyList.filter((x: { ComId: any; })=> x.ComId == this.LoginForm.controls.comId.value);
         window.localStorage.setItem('token', res.token);
        // debugger;
        window.localStorage.setItem('userName', res.userName);
        window.localStorage.setItem('companyId', res.companyId);
        window.localStorage.setItem('roleId', res.Role_Id);
        window.localStorage.setItem('userId', res.UserId);

        var menu = "";
        var menuWithButtonPermission = "";
        var ProcedureData = {
              procedureName: 'usp_GetMenuTree_By_Role',
              parameters: {
                "Role_id":res.role_Id
              }
            }; 
        
            this.ms.GetInitialData(ProcedureData).subscribe({
              next: (results) => {
                console.log(JSON.parse(results.data).Tables1);
        
                if (results.status) {
                  menu = JSON.parse(results.data).Tables2;
                  menuWithButtonPermission = JSON.parse(results.data).Tables1;
                  window.localStorage.setItem('UserMenu', JSON.stringify(menu));  
                  window.localStorage.setItem('UserMenuWithPermission', JSON.stringify(menuWithButtonPermission)); 
                  this.router.navigate(['/dashboard']).then(() => {
                    window.location.reload();
                  });      
                } else if (results.msg == 'Invalid Token') {
                  swal.fire('Session Expierd!', 'Please Login Again.', 'info');
                  this.gs.Logout();
                } else {}
              },
              error: (err) => {},
            });

        
      } else {
        swal.fire(res.msg, '', 'error');

      }
    });
  }
}
