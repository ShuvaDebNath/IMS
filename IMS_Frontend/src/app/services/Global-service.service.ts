import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalConfig } from '../global-config.config';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GlobalServiceService {
  constructor(private router: Router, private http: HttpClient) {}
  readonly baseUrlApi = GlobalConfig.BASE_URL;
  readonly baseUrl = GlobalConfig.BASE_URL_REPORT;
  readonly apiController = 'UserAccount';
  token: any;
  GetAccessToken(tokenParam: any) {
    return this.http
      .get<any>(this.baseUrlApi + this.apiController + '/CustomSignIn', {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + tokenParam,
          'Content-Type': 'application/json',
        }),
      })
      .pipe(
        map((result: any) => {
          if (result.ok) {
            window.localStorage.setItem('token', result.token);
            window.localStorage.setItem('companyId',result.userinfo.concernId)
            window.localStorage.setItem(
              'user',
              JSON.stringify(result.userinfo)
            );
          }
          return true;
        })
      );
  }
  public CheckToken() {
    this.token = window.localStorage.getItem('token');
    if (!this.token) {
      // this.ClearSession();
      // this.router.navigate(['/login']);
    }
    return this.http
      .get<any>(this.baseUrlApi + this.apiController + '/VerifyToken', {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + this.token,
          'Content-Type': 'application/json',
        }),
      })
      .pipe(
        
        map((result: any) => {
          
          if (!result) {
             this.ClearSession();
             this.router.navigate(['/login']);
          }
          return true;
        })
      );
  }

  public getSessionData(key: string): any {
    return window.localStorage.getItem(key);
  }

  // public Logout() {
  //   this.ClearSession();
  //         window.open(`${GlobalConfig.LOGIN_URL_USERMANAGE}`, '_self');
  //   // let user = this.GetSessionUser();
  //   // let model = {
  //   //   comId: '',
  //   //   concernId: user.concernId,
  //   //   deleteBy : '',
  //   //   deleteDate: '',
  //   //   email: user.email,
  //   //   emailConfirmed: true,
  //   //   fullName: '',
  //   //   id: user.id,
  //   //   isActive: true,
  //   //   makeBy: '',
  //   //   menuId: '',
  //   //   password: '',
  //   //   projectId: user.projectId,
  //   //   updateBy: '',
  //   //   userName: user.userName,
  //   //   userTypeId: user.userTypeId,
  //   //   UserId: '',
  //   //   UserTypeName:''
  //   // };
  //   // return this.http
  //   //   .post<any>(`${GlobalConfig.BASE_URL_USERMANAGE}LogIn/Logout`, model, {
  //   //     headers: new HttpHeaders({
  //   //       'Content-Type': 'application/json',
  //   //     }),
  //   //   })
  //   //   .pipe(
  //   //     map((Response) => {
  //   //       this.ClearSession();
  //   //       window.open(`${GlobalConfig.LOGIN_URL_USERMANAGE}`, '_self');
  //   //     })
  //   //   );
  // }
  public GetSessionUser() {
    let user = JSON.parse(this.getSessionData('user'));
    return user;
  }
  public Logout() {
    this.ClearSession();
    this.router.navigate(['/login']);
  }

  public ClearSession() {
    window.localStorage.clear();
  }

  public GetMenuButton() {
    this.token = this.getSessionData('usermanagetoken');
    let user = JSON.parse(this.getSessionData('user'));
    let model = {
      userId: user.id,
      fullName: '',
      userTypeName: '',
      userName: '',
      email: '',
      password: '',
      comId: '',
      concernId: user.concernId,
      projectId: user.projectId,
      menuId: '',
      emailConfirmed: false,
      isActive: false,
      userTypeId: '',
    };
    return this.http
      .post<any>(`${GlobalConfig.BASE_URL_USERMANAGE}LogIn/GetMenuAndButton`, model, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + this.token,
          'Content-Type': 'application/json',
        }),
      })
      .pipe(
        map((Response) => {
          if (Response.ok) {
            let tables = JSON.parse(Response.userpermission);
            let companyName=tables.Table1[0].ComName;
            let concernCompanyLogo=tables.Table1[0].ConcernCompanyLogo;
            window.localStorage.setItem('companyName',companyName);
            window.localStorage.setItem('concernCompanyLogo',concernCompanyLogo);
            window.localStorage.setItem(
              'modules',
              JSON.stringify(tables.Table2)
            );
            window.localStorage.setItem(
              'menues',
              JSON.stringify(tables.Table3)
            );
            window.localStorage.setItem(
              'submenues',
              JSON.stringify(tables.Table4)
            );
            window.localStorage.setItem(
              'buttons',
              JSON.stringify(tables.Table5)
            );
          }

          return Response;
        })
      );
  }

  public GetPageSizeOptions() {
    return [5, 10, 25, 100];
  }
}
