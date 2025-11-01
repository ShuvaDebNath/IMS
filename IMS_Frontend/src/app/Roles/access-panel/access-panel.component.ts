import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { GetDataModel } from 'src/app/models/GetDataModel';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import swal from 'sweetalert2';
import { INgxSelectOption } from 'ngx-select-ex';

@Component({
	selector: 'app-access-panel',
	templateUrl: './access-panel.component.html',
   styleUrls: ['./access-panel.component.css']
})
export class AccessPanelComponent implements OnInit {
	menus: any[] = [];
  Roles:any[] = [];
  Formgroup!: FormGroup;
  countChange:any=0;
  menuPermissionId:any = '';
	constructor(
		private fb: FormBuilder,
		private masterEntyService: MasterEntryService,
		private gs: GlobalServiceService,
		private activeLink: ActivatedRoute,
		private title: Title,
	) {
		// this.gs.CheckToken().subscribe();

	}

	ngOnInit() {
    this.getInitialData();
		this.menus = this.getMenuData();
		this.addPermissions(this.menus);
    this.GenerateFrom();
	}

  GenerateFrom() {
      this.Formgroup = this.fb.group({
        Role_Name:['',[Validators.required]]
      });
    }

  getInitialData(){
    var ProcedureData = {
			procedureName: '[usp_InitialData]',
			parameters: {
			}
		}; 

    this.masterEntyService.GetInitialData(ProcedureData).subscribe({
			next: (results) => {

				if (results.status) {
					this.Roles = JSON.parse(results.data).Tables1;

				} else if (results.msg == 'Invalid Token') {
					swal.fire('Session Expierd!', 'Please Login Again.', 'info');
					this.gs.Logout();
				} else {}
			},
			error: (err) => {},
		});

  }
	// Example menu JSON
	getMenuData() {
		var ProcedureData = {
			procedureName: '[usp_GetMenuTree]',
			parameters: {
				UserId: ''
			}
		};
		this.masterEntyService.GetAllData(ProcedureData).subscribe({
			next: (results) => {

				if (results.status) {
					this.menus = JSON.parse(results.data);
          this.menus.forEach(e=>{
            if(e.ButtonName!='' && e.ButtonName!=null){
              e.ButtonName = JSON.parse(e.ButtonName);
            }
            e.Children = JSON.parse(e.Children);
            this.checkChildren(e.children)
            
          })

				} else if (results.msg == 'Invalid Token') {
					swal.fire('Session Expierd!', 'Please Login Again.', 'info');
					this.gs.Logout();
				} else {}
			},
			error: (err) => {},
		});

		return this.menus;
	}

  checkChildren(child:any){
    
    
    if(child!=undefined)
    child.forEach((e:any)=>{
      
      if(e.ButtonName!='' && e.ButtonName!=null){
        e.ButtonName = JSON.parse(e.ButtonName);
      }
      this.checkChildren(e.Children)
    });
  }

  checkChildrenByRole(child:any){
    
    
    if(child!=undefined)
    child.forEach((e:any)=>{
      
      this.checkChildren(e.Children)
    });
  }

	addPermissions(nodes: any[]) {
		nodes.forEach(node => {
			node.permissions = {
				view: false,
				create: false,
				edit: false,
				delete: false
			};
			if (node.Children && node.Children.length > 0) {
				this.addPermissions(node.Children);
			}
		});
	}

  // access-panel.component.ts
savePermissions() {
  if (this.Formgroup.invalid) {
        swal.fire('Invlid Inputs!', 'Form is Invalid! Please select Role.', 'info');
        return;
      }
  
if(this.menuPermissionId!=""){
  this.deleteMenuById();
}

  this.countChange = 0;
  
  const flatPermissions = this.flattenTree(this.menus);
  if(this.countChange==0){
    swal.fire('Invlid Inputs!', 'Please select some menu to proceed!', 'info');
        return;
  }
  
  var TableNameChild = "tbl_MenuButtonPermissionByRole";
  var TableNameMaster = "tbl_MenuPermissionByRole";
  var ColumnNamePrimary = "Menu_Permission_Id";
  var ColumnNameForign = "Menu_Permission_Id";
  var detailsData:any = [];
  var masterData = {
        'Menu_Permission_Id':'',
        'Role_Id':this.Formgroup.value.Role_Name,
      };
  //MenuId: 1, ParentMenuId: null, Enabled: true, CanView: false, CanInsert: false, CanUpdate: false, CanDelete: false
  flatPermissions.forEach(e=>{
    if(e.Enabled){
      var count = 0;
      var detailsDataSingle  = {};
      if(e.CanView){
        detailsDataSingle = {
        'Menu_Button_Permission_Id':'newid()',
          'ButtonPermissionId':'3',
          'Menu_Permission_Id':'',
          'MenuId':e.MenuId,
        };
        detailsData.push(detailsDataSingle);
        count++;
      }
      if(e.CanInsert){
        detailsDataSingle = {
        'Menu_Button_Permission_Id':'newid()',
            'ButtonPermissionId':'1',
            'Menu_Permission_Id':'',
            'MenuId':e.MenuId,
        };
        detailsData.push(detailsDataSingle);
        count++;
      }
      if(e.CanUpdate){
          detailsDataSingle = {
        'Menu_Button_Permission_Id':'newid()',
            'ButtonPermissionId':'2',
            'Menu_Permission_Id':'',
            'MenuId':e.MenuId,
          };
        detailsData.push(detailsDataSingle);
        count++;
      }
      if(e.CanDelete){
          detailsDataSingle = {
        'Menu_Button_Permission_Id':'newid()',
            'ButtonPermissionId':'4',
            'Menu_Permission_Id':'',
            'MenuId':e.MenuId,
          };
        detailsData.push(detailsDataSingle);
        count++;

      }
      if(count==0 && e.Enabled){
        detailsDataSingle = {
            'Menu_Button_Permission_Id':'newid()',
            'ButtonPermissionId':'',
            'Menu_Permission_Id':'',
            'MenuId':e.MenuId,
          };
        detailsData.push(detailsDataSingle);
      }

    }
    
    
  });

  this.masterEntyService.SaveDataMasterDetails(detailsData,TableNameChild,masterData,TableNameMaster,ColumnNamePrimary,ColumnNameForign,'','',true).subscribe((res:any) => {
        
        
        if (res.status) {
          swal
            .fire({
              title: `${res.message}!`,
              text: `Save Successfully!`,
              icon: 'success',
              timer: 5000,
            })
            .then((result) => {
              this.ngOnInit();
            });
  
        } else {
  
          if(res.message == 'Data already exist'){
            swal.fire('Data already exist', '', 'warning');
          }
          else if (res.message == 'Invalid Token') {
            swal.fire('Session Expierd!', 'Please Login Again.', 'info');
            this.gs.Logout();
          } else {
              swal.fire({
                title: `Faild!`,
                text: `Save Faild!`,
                icon: 'info',
                timer: 5000,
              });
          }
        }
      });
    
  //
}

// recursive function to flatten the tree
flattenTree(nodes: any[], parentId: number | null = null) { 
  
  let result: any[] = [];
  nodes.forEach(node => {
    if(node.permissions==undefined){
result.push({
      MenuId: node.MenuId,
      ParentMenuId: parentId,
      Enabled: false,
      CanView: false,
      CanInsert: false,
      CanUpdate: false,
      CanDelete: false
    });
    }
    else{
      this.countChange++;
      result.push({
            MenuId: node.MenuId,
            ParentMenuId: parentId,
            Enabled: node.permissions.enabled,
            CanView: node.permissions.View,
            CanInsert: node.permissions.Insert,
            CanUpdate: node.permissions.Update,
            CanDelete: node.permissions.Delete
          });
    }
    

    if (node.Children && node.Children.length > 0) {
      result = result.concat(this.flattenTree(node.Children, node.MenuId));
    }
  });
  return result;
}

getSelectedMenu(){
  
  var ProcedureData = {
			procedureName: '[usp_GetMenuPermissionByRoles]',
			parameters: {
				Role_Id: this.Formgroup.value.Role_Name
			}
		};
		this.masterEntyService.GetAllData(ProcedureData).subscribe({
			next: (results) => {

				if (results.status) {
					var selectedMenus = JSON.parse(results.data);
          var updatedMenu = this.enablePermissions(this.menus, selectedMenus);
          this.menuPermissionId = selectedMenus[0].Menu_Permission_Id;
          
          
				} else if (results.msg == 'Invalid Token') {
					swal.fire('Session Expierd!', 'Please Login Again.', 'info');
					this.gs.Logout();
				} else {}
			},
			error: (err) => {},
		});
}

deleteMenuById(){
  var ProcedureData = {
			procedureName: '[usp_DeleteMenuPermission]',
			parameters: {
				MenuPermissionId: this.menuPermissionId
			}
		};
		this.masterEntyService.GetAllData(ProcedureData).subscribe({
			next: (results) => {

				if (results.status) {
				} else if (results.msg == 'Invalid Token') {
					swal.fire('Session Expierd!', 'Please Login Again.', 'info');
					this.gs.Logout();
				} else {}
			},
			error: (err) => {},
		});
}

enablePermissions(menuTree: any, list: any): any {
  function traverse(node: any): void {
    // Check if any match for this node
    // var found = list.filter(
    //   (item:any) => item.MenuId == node.MenuId 
    // );
    var found = list.filter((e:any)=>e.MenuId == node.MenuId)

    

    if (found) {
      found.forEach((item:any)=>{
        if(node.permissions==undefined){
          node.permissions = {};
        }
          node.permissions.enabled = true;
          node.permissions.MenuId = found.MenuId
          
        if(item.ButtonPermissionId=="1"){
          node.permissions.Insert = true;
        }
        if(item.ButtonPermissionId=="2"){
          node.permissions.Update = true;
        }
        if(item.ButtonPermissionId=="3"){
          node.permissions.View = true;
        }
        if(item.ButtonPermissionId=="4"){
          node.permissions.Delete = true;
        }
      
      })
      
      //node.enabledPermissions.push(found.permissionId);
    }
    else{
      node.permissions ={};
    }

    // Recurse into children if present
    if (node.Children && node.Children.length > 0) {
      node.Children.forEach(traverse);
    }
  }

  menuTree.forEach(traverse);
  return menuTree;
}
}
