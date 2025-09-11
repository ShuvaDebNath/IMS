import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalConfig } from '../global-config.config';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GlobalServiceService {
  constructor(private router: Router, private http: HttpClient) { }
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
            window.localStorage.setItem('companyId', result.userinfo.concernId)
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

  public CheckUserPermission(menuName: string) {
    var permissions = {
      insertPermissions: false,
      updatePermissions: false,
      deletePermissions: false,
      printPermissions: false,}
    var menu = '';
    menu = window.localStorage.getItem('UserMenuWithPermission')==null?'':window.localStorage.getItem('UserMenuWithPermission')!;
    if (menu == '') {
      this.Logout();
    }
    var menuJson = JSON.parse(menu);
    var buttonPermissions: any = [];
    var countFound = 0;
    menuJson.forEach((e: any) => {
      e.Children = JSON.parse(e.Children);
      e.Children.forEach((childMenu: any) => {
        if (childMenu.SubMenuName == menuName) {
          countFound++;
          buttonPermissions.push(childMenu.ButtonName);
        }
      });
    })
    if (countFound == 0) {
      window.location.href = 'dashboard';
    }
    else {
      buttonPermissions.forEach((buttonCheck: any) => {

        if (buttonCheck[0].ButtonName == "Delete") {
          permissions.deletePermissions = true;
        }
        else if (buttonCheck[0].ButtonName == "View") {
          permissions.printPermissions = true;
        }
        else if (buttonCheck[0].ButtonName == "Insert") {
          permissions.insertPermissions = true;
        }
        else if (buttonCheck[0].ButtonName == "Update") {
          permissions.updatePermissions = true;
        }
      });
    }

    return permissions;

    
  }
}
