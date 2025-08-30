import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-access-node',
  templateUrl: './access-node.component.html',
  styleUrls: ['./access-node.component.css']
})
export class AccessNodeComponent implements OnInit {
  @Input() menu: any;
  @Input() parent: any;
  expanded: boolean = false; // expand/collapse state

  ngOnInit(): void {
    console.log(this.menu.ButtonName);
    if(typeof(this.menu.ButtonName)=="string" && this.menu.ButtonName!='' && this.menu.ButtonName!=undefined){
      this.menu.ButtonName = JSON.parse(this.menu.ButtonName)
    }
    if (!this.menu.permissions) {
      this.menu.permissions = {
        enabled: false,   // new main checkbox
        Insert: false,
        Update: false,
        View: false,
        Delete: false
      };
    }
  }

  toggleChildPermissions(type: string, value: boolean) {
    if (this.menu.Children && this.menu.Children.length > 0) {
      this.menu.Children.forEach((child: any) => {
        if(child.permissions!=undefined){
child.permissions[type] = value;
        if (child.Children && child.Children.length > 0) {
          this.applyToAll(child, type, value);
        }
        }
        
      });
    }
    this.updateParentPermissions(type);
  }

  toggleMenuEnabled(value: boolean) {
    // // enable/disable permissions of this node
    // if (!value) {
    //   this.menu.permissions.view = false;
    //   this.menu.permissions.create = false;
    //   this.menu.permissions.edit = false;
    //   this.menu.permissions.delete = false;
    // }

    // // cascade enable/disable to children
    // if (this.menu.Children && this.menu.Children.length > 0) {
    //   this.menu.Children.forEach((child: any) => {
    //     child.permissions.enabled = value;
    //     child.permissions.view = false;
    //     child.permissions.create = false;
    //     child.permissions.edit = false;
    //     child.permissions.delete = false;
    //     if (child.Children && child.Children.length > 0) {
    //       this.applyToAll(child, 'enabled', value);
    //     }
    //   });
    // }
  }

  private applyToAll(node: any, type: string, value: boolean) {
    if (type === 'enabled') {
      node.permissions.enabled = value;
      node.permissions.view = false;
      node.permissions.create = false;
      node.permissions.edit = false;
      node.permissions.delete = false;
    } else {
      node.permissions[type] = value;
    }

    if (node.Children && node.Children.length > 0) {
      node.Children.forEach((child: any) =>
        this.applyToAll(child, type, value)
      );
    }
  }

  private updateParentPermissions(type: string) {
    if (!this.parent) return;

    const allChecked = this.parent.Children.every(
      (child: any) => child.permissions[type] === true
    );
    const anyChecked = this.parent.Children.some(
      (child: any) => child.permissions[type] === true
    );

    if (allChecked) {
      this.parent.permissions[type] = true;
    } else if (!anyChecked) {
      this.parent.permissions[type] = false;
    }

    if (this.parent.parent) {
      this.parent.updateParentPermissions(type);
    }
  }

  toggleExpand() {
    this.expanded = !this.expanded;
  }
}
