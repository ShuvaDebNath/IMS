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
            window.localStorage.setItem('companyId', result.userinfo.concernId);
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
      .post<any>(
        `${GlobalConfig.BASE_URL_USERMANAGE}LogIn/GetMenuAndButton`,
        model,
        {
          headers: new HttpHeaders({
            Authorization: 'Bearer ' + this.token,
            'Content-Type': 'application/json',
          }),
        }
      )
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
    type Button = { ButtonName: string };

    interface MenuItem {
      SubMenuName?: string;
      ButtonName?: string | Button[] | Button;
      Children?: MenuItem[] | string;
    }

    const permissions = {
      insertPermissions: false,
      updatePermissions: false,
      deletePermissions: false,
      printPermissions: false,
    };

    // Load menu from local storage
    const menuData = window.localStorage.getItem('UserMenuWithPermission');

    if (!menuData) {
      this.Logout();
      return permissions;
    }

    let menuJson: MenuItem[] = [];
    try {
      menuJson = JSON.parse(menuData);
    } catch {
      this.Logout();
      return permissions;
    }

    const buttonPermissions: string[] = [];

    // -----------------------------
    // 🔥 Safe JSON parser helper
    // -----------------------------
    const safeParse = (value: any) => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return null;
        }
      }
      return value;
    };

    // -----------------------------
    // 🔥 Recursive Menu Finder
    // -----------------------------
    const findMenuRecursively = (menus: MenuItem[]) => {
      for (const item of menus) {
        // Normalize Children (may be string or array)
        item.Children = safeParse(item.Children) || [];

        // 🔥 MATCH MENU
        if (item.SubMenuName === menuName) {
          const btnData = safeParse(item.ButtonName);

          // CASE 1: ButtonName = string (single name)
          if (typeof btnData === 'string') {
            buttonPermissions.push(btnData);
          }

          // CASE 2: ButtonName = array (your real-case scenario)
          else if (Array.isArray(btnData)) {
            for (const btn of btnData) {
              if (btn?.ButtonName) {
                buttonPermissions.push(btn.ButtonName);
              }
            }
          }

          // CASE 3: ButtonName = object
          else if (btnData && typeof btnData === 'object') {
            if (btnData.ButtonName) {
              buttonPermissions.push(btnData.ButtonName);
            }
          }
        }

        // Recurse into children
        if (Array.isArray(item.Children)) {
          findMenuRecursively(item.Children);
        }
      }
    };

    // Start recursive search
    findMenuRecursively(menuJson);

    // No permission found
    if (buttonPermissions.length === 0) {
      return permissions;
    }

    // -----------------------------
    // 🔥 Assign final permissions
    // -----------------------------
    for (const btn of buttonPermissions) {
      switch (btn) {
        case 'Insert':
          permissions.insertPermissions = true;
          break;
        case 'Update':
          permissions.updatePermissions = true;
          break;
        case 'Delete':
          permissions.deletePermissions = true;
          break;
        case 'View':
          permissions.printPermissions = true;
          break;
      }
    }

    return permissions;
  }
}
