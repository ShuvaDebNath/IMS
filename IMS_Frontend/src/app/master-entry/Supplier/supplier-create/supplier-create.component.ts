import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-supplier-create',
  templateUrl: './supplier-create.component.html',
  styleUrls: ['./supplier-create.component.css'],
})
export class SupplierCreateComponent {
  Formgroup!: FormGroup;
  isEdit = false;
  SupplierId!: string;
  menu: any;

  insertPermissions: boolean = false;
  updatePermissions: boolean = false;
  deletePermissions: boolean = false;
  printPermissions: boolean = false;
  constructor(
    private fb: FormBuilder,
    private masterEntyService: MasterEntryService,
    private gs: GlobalServiceService,
    private activeLink: ActivatedRoute,
    private title: Title
  ) {
    let has = this.activeLink.snapshot.queryParamMap.has('SupplierId');
    if (has) {
      this.SupplierId = this.activeLink.snapshot.queryParams['SupplierId'];
      this.isEdit = true;
      this.GetSupplierEditDataById();
    } else {
      this.isEdit = false;
    }
  }

  ngOnInit() {
    var permissions = this.gs.CheckUserPermission('Supplier Create');
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;

    if (!this.printPermissions) {
      window.location.href = 'dashboard';
    }
    this.title.setTitle('Supplier Create');
    this.GenerateForm();

    if (this.isEdit) {
      this.GetSupplierEditDataById();
    }
  }

  
  GenerateForm() {
    this.Formgroup = this.fb.group({
      Name: ['', [Validators.required]],
      Address: ['', [Validators.required]],
      Phone: ['', [Validators.required]],
      Email: ['', [Validators.required]],
    });
  }
  GetSupplierEditDataById() {
    var ProcedureData = {
      procedureName: '[usp_supplier_GetDataById]',
      parameters: {
        id: this.SupplierId,
      },
    };
    this.masterEntyService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        console.log(results);

        if (results.status) {
          var tableData = JSON.parse(results.data).Tables1;
          tableData.forEach((e: any) => {
            this.Formgroup.controls.Name.setValue(e.Sup_Name);
            this.Formgroup.controls.Address.setValue(e.Sup_Address);
            this.Formgroup.controls.Phone.setValue(e.Sup_Phone_No);
            this.Formgroup.controls.Email.setValue(e.Email);
          });
        } else if (results.message == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
        }
      },
      error: (err) => {},
    });
  }

  saveData() {
    console.log(this.Formgroup);

    if (this.Formgroup.invalid) {
      swal.fire(
        'Invlid Inputs!',
        'Form is Invalid! Please select Role.',
        'info'
      );
      return;
    }
    var fDate = new Date();
    const mm = String(fDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(fDate.getDate()).padStart(2, '0');
    const yyyy = fDate.getFullYear();

    const formatted = `${mm}/${dd}/${yyyy}`;
    var userId = window.localStorage.getItem('userId');
    var item = {
      Sup_Name: this.Formgroup.value.Name,
      Sup_Address: this.Formgroup.value.Address,
      Sup_Phone_No: this.Formgroup.value.Phone,
      Created_At: formatted,
      Created_By: userId,
      Email: this.Formgroup.value.Email,
    };

    var tableName = 'tbl_supplier';

    this.masterEntyService
      .SaveSingleData(item, tableName)
      .subscribe((res: any) => {
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
          if (res.message == 'Data already exist') {
            swal.fire('Data already exist', '', 'warning');
          } else if (res.message == 'Invalid Token') {
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
  }

  updateData() {
    if (this.Formgroup.invalid) {
      swal.fire('Invalid Inputs!', 'Please check inputs', 'info');
      return;
    }

    var fDate = new Date();
    const mm = String(fDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(fDate.getDate()).padStart(2, '0');
    const yyyy = fDate.getFullYear();

    const formatted = `${mm}/${dd}/${yyyy}`;

    var userId = window.localStorage.getItem('userId');
    
    var item = {
      Sup_Name: this.Formgroup.value.Name,
      Sup_Address: this.Formgroup.value.Address,
      Sup_Phone_No: this.Formgroup.value.Phone,
      Updated_At: formatted,
      Updated_By: userId,
      Email: this.Formgroup.value.Email,
    };

    let condition = { Supplier_ID: this.SupplierId };
    let tableName = 'tbl_supplier';

    this.masterEntyService
      .UpdateData(item, condition, tableName)
      .subscribe((res: any) => {
        if (res.status) {
          swal
            .fire({
              title: `${res.message}!`,
              text: `Update Successfully!`,
              icon: 'success',
              timer: 5000,
            })
            .then(() => {
              this.ngOnInit();
            });
        } else {
          if (res.message == 'Invalid Token') {
            swal.fire('Session Expired!', 'Please Login Again.', 'info');
            this.gs.Logout();
          } else {
            swal.fire('Failed!', 'Update Failed!', 'info');
          }
        }
      });
  }
}
