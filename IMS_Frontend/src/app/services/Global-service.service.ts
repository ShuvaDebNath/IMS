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
    // Define shape of your menu structure
    type Button = { ButtonName: string };

    interface MenuItem {
      SubMenuName?: string;
      ButtonName?: string;
      Buttons?: Button[];
      Children?: MenuItem[] | string;
    }

    // Permission object
    const permissions = {
      insertPermissions: false,
      updatePermissions: false,
      deletePermissions: false,
      printPermissions: false,
    };

    // Load menu data
    const menuData = window.localStorage.getItem('UserMenuWithPermission');
    console.log(menuData);
    
    if (!menuData) {
      this.Logout();
      return permissions;
    }

    let menuJson: MenuItem[] = [];
    try {
      menuJson = JSON.parse(menuData);
    } catch (err) {
      console.error('Invalid menu JSON:', err);
      this.Logout();
      return permissions;
    }

    const buttonPermissions: string[] = [];

    // Recursive function to search all levels
    const findMenuRecursively = (menus: MenuItem[]) => {
      for (const menuItem of menus) {
        // Parse Children if it's a string
        if (typeof menuItem.Children === 'string') {
          try {
            menuItem.Children = JSON.parse(menuItem.Children) as MenuItem[];
          } catch {
            menuItem.Children = [];
          }
        }
        //console.log(menuItem);

        // Match target menu name
        if (menuItem.SubMenuName === menuName) {
          // if (typeof menuItem.ButtonName=='string') {
          //   var arr = JSON.parse(menuItem.ButtonName);
          // }
          // else if (typeof menuItem.ButtonName === 'object' && menuItem.ButtonName !== null) {

          // }

          if (menuItem.ButtonName) {
            buttonPermissions.push(menuItem.ButtonName);
          }

          //console.log(menuItem,menuItem.ButtonName,Array.isArray(menuItem.ButtonName));
          if (menuItem.ButtonName && Array.isArray(menuItem.ButtonName)) {
            for (const btn of menuItem.ButtonName) {
              //console.log(btn,btn.ButtonName);

              if (btn && btn.ButtonName) {
                buttonPermissions.push(btn.ButtonName);
              }
            }
          }
        }
        // console.log(menuItem.Children,Array.isArray(menuItem.Children));
        // Go deeper recursively
        if (menuItem.Children && Array.isArray(menuItem.Children)) {
          if (menuItem.Children.length == 0) {
            if (menuItem.SubMenuName == menuName) {
              if (typeof menuItem.ButtonName == 'string') {
                var arr = JSON.parse(menuItem.ButtonName);
                for(var item of arr){   
                  buttonPermissions.push(item.ButtonName);                  
                }
                continue
              }
            }
          }
          findMenuRecursively(menuItem.Children);
        }
      }
    };

    // Start recursion
    findMenuRecursively(menuJson);

    // If not found, redirect to dashboard
    if (buttonPermissions.length === 0) {
      window.location.href = 'dashboard';
      return permissions;
    }

    // Assign permissions
    for (const btnName of buttonPermissions) {
      switch (btnName) {
        case 'Delete':
          permissions.deletePermissions = true;
          break;
        case 'View':
          permissions.printPermissions = true;
          break;
        case 'Insert':
          permissions.insertPermissions = true;
          break;
        case 'Update':
          permissions.updatePermissions = true;
          break;
      }
    }

    return permissions;
  }
}
