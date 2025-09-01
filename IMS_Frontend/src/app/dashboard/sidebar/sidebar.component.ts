import { Component, OnInit ,Input} from '@angular/core';

import Swal from 'sweetalert2';
import { GlobalServiceService } from '../../services/Global-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { GlobalConfig } from 'src/app/global-config.config';
import { LoginComponent } from 'src/app/authentication/login/login.component';
import { GetDataModel } from 'src/app/models/GetDataModel';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import { PagesComponent } from 'src/app/pages/pages.component';
import { Menu } from 'src/app/models/menu.model';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  @Input() menu: Menu[] = [];
  modules: any;
  menus: any;
  submenus: any;
  menuobjectstring: any;
  menuobject: any;
  logo:any;
  userId:any ='';
  constructor(
    private gs: GlobalServiceService,
    private activeLink: ActivatedRoute,
    private router: Router,    
    private masterEntryService: MasterEntryService,    
    private pagesComponent: PagesComponent,
    private location: Location) {
    let has = this.activeLink.snapshot.queryParamMap.has('token');
    // 

  }

  ngOnInit() {
    this.logo=window.localStorage.getItem('concernCompanyLogo');
    //this.GetUserWiseledger();
    this.GetDynamicMenu();
  }

  GetDynamicMenu(){
    
  }



  GenMenuFromSession() {

    this.menuobjectstring = this.gs.getSessionData('permittedMenus');
    this.menuobject = JSON.parse(this.menuobjectstring);
    let strmodules = this.gs.getSessionData('modules');
    this.modules=JSON.parse(strmodules);
    let strmenus = this.gs.getSessionData('menues');
    this.menus=JSON.parse(strmenus);
    let strsubmenus = this.gs.getSessionData('submenues');
    this.submenus=JSON.parse(strsubmenus);
  }
  GetMenuByModule(moduleId:string){
    return this.menus.filter((x:any)=>x.ModuleId==moduleId);
  }
  GetSubMenuByMenu(menuId:string){
    return this.submenus.filter((x:any)=>x.MenuId==menuId && !x.ParentId );
  }
  GetChildMenuBySubMenu(submenuId:string){
    return this.submenus.filter((x:any)=>x.ParentId==submenuId);
  }


  GetMenuButton() {
    this.menuobject=null;
    this.gs.GetMenuButton().subscribe(res=>{

      if (res.ok) {
        // window.localStorage.removeItem("permittedMenus");
        // window.localStorage.removeItem("permittedButtons");
        // window.localStorage.setItem("permittedMenus",JSON.stringify(res.permittedMenus));
        // window.localStorage.setItem("permittedButtons",JSON.stringify(res.permittedButtons));
        GlobalConfig.USER_NAME=JSON.parse(window.localStorage.getItem('user')!).userName;
        GlobalConfig.COMPANY_NAME=window.localStorage.getItem('companyName')!;
        this.GenMenuFromSession();
      }else{

        Swal.fire(
          {
            title: `Invalid token!`,
            text: `Please Login!`,
            icon: 'error',
          }
        );
      }
    });
  }

  
}
