import { Component, OnInit,Input } from '@angular/core';
import { BsDropdownConfig } from 'ngx-bootstrap/dropdown';
import { GlobalConfig } from 'src/app/global-config.config';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { Title } from '@angular/platform-browser';
import { Menu } from 'src/app/models/menu.model';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  providers: [
    {
      provide: BsDropdownConfig,
      useValue: { isAnimated: true, autoClose: true },
    },
  ],
})
export class HeaderComponent implements OnInit {
  menu: any;
  companyName: any;
  userName: any;

  constructor(private gs: GlobalServiceService,
    private title:Title,
        private masterEntryService: MasterEntryService,   ) {}

  ngOnInit() {
    this.GetDynamicMenu();
    this.title.setTitle('Dashboard');
    if(GlobalConfig.USER_NAME){
      this.userName = GlobalConfig.USER_NAME;
      this.companyName=GlobalConfig.COMPANY_NAME;
    }else{
      setTimeout(() => {
        this.userName = GlobalConfig.USER_NAME;
        this.companyName=GlobalConfig.COMPANY_NAME;
      }, 3000);
    }
  }

  GetDynamicMenu(){
    this.menu = window.localStorage.getItem('UserMenu');
    this.menu = JSON.parse(this.menu)
          this.menu.forEach((e:any)=>{
            e.Children = JSON.parse(e.Children);
          })
    }
 
  Logout() {
    this.gs.Logout().subscribe();
  }

  
}
