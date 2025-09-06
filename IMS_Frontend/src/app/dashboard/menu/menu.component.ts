import { Component, OnInit, Input, HostListener } from '@angular/core';
import { Menu } from 'src/app/models/menu.model';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  @Input() menu?: Menu[];
  userName: any;
  isShowComInfo = false;
  openDropdownId: number | null = null;

  constructor(private gs: GlobalServiceService,
              private masterEntryService: MasterEntryService) {}

  ngOnInit(): void {
    this.userName = window.localStorage.getItem('userName');
    if(this.userName!=undefined && this.userName!=null)
      this.isShowComInfo = true;
  }

  toggleDropdown(id: number, event: Event) {
    event.preventDefault();
    event.stopPropagation();

    if (this.openDropdownId === id) {
      this.openDropdownId = null; 
    } else {
      this.openDropdownId = id;   
    }
  }

  isOpen(id: number): boolean {
    return this.openDropdownId === id;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    this.openDropdownId = null;
  }

  parseChildren(menu: Menu[]): Menu[] {
    return menu.map(item => {
      let children: Menu[] = [];

      if (item.Children) {
        if (typeof item.Children === 'string') {
          try {
            children = JSON.parse(item.Children);
          } catch (err) {
            console.error(`Invalid JSON in menu item ${item.MenuId}`, err);
            children = [];
          }
        } else if (Array.isArray(item.Children)) {
          children = item.Children;
        }
      }

      return {
        ...item,
        Children: this.parseChildren(children)
      };
    });
  }

  Logout() {
    this.gs.Logout();
  }

  ChangePassword() {
    window.location.href = 'change-password';
  }
}
