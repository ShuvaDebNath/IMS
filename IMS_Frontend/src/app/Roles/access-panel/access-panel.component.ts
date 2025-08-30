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
	templateUrl: './access-panel.component.html'
})
export class AccessPanelComponent implements OnInit {
	menus: any[] = [];
  Roles:any[] = [];
  Formgroup!: FormGroup;
  countChange:any=0;
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
				console.log(JSON.parse(results.data).Tables1);

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
		console.log(ProcedureData);
		this.masterEntyService.GetAllData(ProcedureData).subscribe({
			next: (results) => {
				console.log(results);

				if (results.status) {
					this.menus = JSON.parse(results.data);
					console.log(this.menus);
          this.menus.forEach(e=>{
            console.log(e.ButtonName,e);
            if(e.ButtonName!='' && e.ButtonName!=null){
              console.log(JSON.parse(e.ButtonName));
              e.ButtonName = JSON.parse(e.ButtonName);
            }
            e.Children = JSON.parse(e.Children);
            console.log(e.Children);            
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
    
    console.log(child);
    
    if(child!=undefined)
    child.forEach((e:any)=>{
      console.log(e);
      
      if(e.ButtonName!='' && e.ButtonName!=null){
        e.ButtonName = JSON.parse(e.ButtonName);
      }
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
  
  console.log(this.Formgroup.value.Role_Name);
  this.countChange = 0;
  
  const flatPermissions = this.flattenTree(this.menus);
  if(this.countChange==0){
    swal.fire('Invlid Inputs!', 'Please select some menu to proceed!', 'info');
        return;
  }
  
  console.log(flatPermissions);
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
    console.log(e);
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
        console.log(count,e)
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
        console.log(res);
        
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
                icon: 'error',
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
    console.log(node);
    

    if (node.Children && node.Children.length > 0) {
      result = result.concat(this.flattenTree(node.Children, node.MenuId));
    }
  });
  return result;
}
}
