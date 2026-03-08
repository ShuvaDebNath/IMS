import { Component, OnInit, Input, HostListener } from '@angular/core';
import { Menu } from 'src/app/models/menu.model';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import { AppStateService } from 'src/app/services/session/app-state.service';
import { take } from 'rxjs/operators';

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
  currentTime: string = '';
  private timerInterval: any;
  constructor(private gs: GlobalServiceService,
     private appState: AppStateService) { }

  ngOnInit(): void {
    this.startTimer()
    this.userName = window.localStorage.getItem('userName');
    if (this.userName != undefined && this.userName != null)
      this.isShowComInfo = true;
  }
//   ngOnInit(): void {
//   this.appState.ready$
//     .pipe(take(1))
//     .subscribe(() => {
//       this.initializeMenu();
//     });
// }
// private initializeMenu(): void {
//   this.userName = localStorage.getItem('userName');
//   this.isShowComInfo = !!this.userName;

//   if (!this.menu) {
//     const menuStr = localStorage.getItem('UserMenu');
//     if (menuStr) {
//       this.menu = JSON.parse(menuStr);
//       this.menu.forEach((m: any) => {
//         m.Children = JSON.parse(m.Children);
//       });
//     }
//   }
// }
  startTimer() {
    this.updateTime();
    this.timerInterval = setInterval(() => {
      this.updateTime();
    }, 1000);
  }
  updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-GB');
  }
  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.startTimer()
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
