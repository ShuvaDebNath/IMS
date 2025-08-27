import { Component, OnInit,Input } from '@angular/core';
import { Menu } from 'src/app/models/menu.model';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
@Input() menu?: Menu[];

   openDropdowns = new Set<number>(); // track which dropdowns are open
  constructor(private masterEntryService: MasterEntryService) {}

  ngOnInit(): void {
    //this.GetDynamicMenu();
    //this.menu = this.parseChildren(this.menu==undefined?[]:this.menu);
  }


  toggleDropdown(id: number, event: Event) {
    event.preventDefault();
    if (this.openDropdowns.has(id)) {
      this.openDropdowns.delete(id);
    } else {
      this.openDropdowns.add(id);
    }
  }

  isOpen(id: number): boolean {
    return this.openDropdowns.has(id);
  }
   
  parseChildren(menu: Menu[]): Menu[] {
  return menu.map(item => {
    let children: Menu[] = [];

    // If Children exists
    if (item.Children) {
      if (typeof item.Children === 'string') {
        // Parse string into array
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
      Children: this.parseChildren(children) // recursively parse grandchildren
    };
  });
}

}
