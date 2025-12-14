import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-pi-bottom-price-create',
  templateUrl: './pi-bottom-price-create.component.html',
  styleUrls: ['./pi-bottom-price-create.component.css']
})
export class PIBottomPriceCreateComponent {
Formgroup!: FormGroup;
  isEdit = false;
  PI_Bottom_Price_ID!: string;
  menu: any;
  colorList: any = [];
  widthList: any = [];

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
    let has = this.activeLink.snapshot.queryParamMap.has('PI_Bottom_Price_ID');
    if (has) {
      this.PI_Bottom_Price_ID =
        this.activeLink.snapshot.queryParams['PI_Bottom_Price_ID'];
      this.isEdit = true;
      this.GetPaymentTermsEditDataById();
    } else {
      this.isEdit = false;
    }
  }

  ngOnInit() {
    var permissions = this.gs.CheckUserPermission('PI Bottom Create');
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;
    this.getInitialData();

    if (!this.printPermissions) {
      window.location.href = 'dashboard';
    }
    this.title.setTitle('PI Bottom Create');
    this.GenerateForm();

    if (this.isEdit) {
      this.GetPaymentTermsEditDataById();
    }
  }

  getInitialData() {
    var userId = window.localStorage.getItem('userId');
    var ProcedureData = {
      procedureName: '[usp_FinishGoods_GetInitialData]',
      parameters: {},
    };
    this.masterEntyService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        if (results.status) {
          this.colorList = JSON.parse(results.data).Tables1;
          this.widthList = JSON.parse(results.data).Tables2;
        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
        }
      },
      error: (err) => {},
    });
  }
  GenerateForm() {
    this.Formgroup = this.fb.group({
      Article_No: ['', [Validators.required]],
      ColorId: ['', [Validators.required]],
      WidthId: ['', [Validators.required]],
      UnitPrice: [0, [Validators.required]],
    });
  }
  GetPaymentTermsEditDataById() {
    var ProcedureData = {
      procedureName: '[usp_PIBottomPrice_ById]',
      parameters: {
        PI_Bottom_Price_ID: this.PI_Bottom_Price_ID,
      },
    };
    this.masterEntyService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        if (results.status) {
          var tableData = JSON.parse(results.data).Tables1;
          tableData.forEach((e: any) => {
            this.Formgroup.controls.Article_No.setValue(e.Article);
            this.Formgroup.controls.ColorId.setValue(e.Color_ID);
            this.Formgroup.controls.WidthId.setValue(e.Width_ID);
            this.Formgroup.controls.UnitPrice.setValue(e.Unit_Price);
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
      Article: this.Formgroup.value.Article_No,
      Color_ID: this.Formgroup.value.ColorId,
      Width_ID: this.Formgroup.value.WidthId,
      Unit_Price: this.Formgroup.value.UnitPrice,
    };

    var tableName = 'tbl_pi_bottom_price';

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
      Article: this.Formgroup.value.Article_No,
      Color_ID: this.Formgroup.value.ColorId,
      Width_ID: this.Formgroup.value.WidthId,
      Unit_Price: this.Formgroup.value.UnitPrice,
    };

    let condition = { PI_Bottom_Price_ID: this.PI_Bottom_Price_ID };
    let tableName = 'tbl_pi_bottom_price';

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
