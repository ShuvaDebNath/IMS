import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-finished-goods-create',
  templateUrl: './finished-goods-create.component.html',
  styleUrls: ['./finished-goods-create.component.css'],
})
export class FinishedGoodsCreateComponent {
  Formgroup!: FormGroup;
  isEdit = false;
  FinishedGoodsId!: string;
  menu: any;
  colorList: any = [];
  widthList: any = [];
  packagingList: any = [];
  unitList: any = [];

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
    let has = this.activeLink.snapshot.queryParamMap.has('FinishedGoodsId');
    if (has) {
      this.FinishedGoodsId =
        this.activeLink.snapshot.queryParams['FinishedGoodsId'];
      this.isEdit = true;
      this.GetPaymentTermsEditDataById();
    } else {
      this.isEdit = false;
    }
  }

  ngOnInit() {
    var permissions = this.gs.CheckUserPermission('Finish Goods Create');
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;
    this.getInitialData();

    if (!this.printPermissions) {
      window.location.href = 'dashboard';
    }
    this.title.setTitle('Create Finished Goods');
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
          this.packagingList = JSON.parse(results.data).Tables3;
          this.unitList = JSON.parse(results.data).Tables4;
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
      PackagingId: ['', [Validators.required]],
      UnitId: ['', [Validators.required]],
      Weight: [0, [Validators.required]],
      GSM: [0, [Validators.required]],
      IsAvailable: [false],
    });
  }
  GetPaymentTermsEditDataById() {
    var ProcedureData = {
      procedureName: '[usp_FinishGoods_ById]',
      parameters: {
        Item_Id: this.FinishedGoodsId,
      },
    };
    this.masterEntyService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        console.log(results);

        if (results.status) {
          var tableData = JSON.parse(results.data).Tables1;
          tableData.forEach((e: any) => {
            this.Formgroup.controls.Article_No.setValue(e.Article_No);
            this.Formgroup.controls.ColorId.setValue(e.ColorId);
            this.Formgroup.controls.WidthId.setValue(e.WidthId);
            this.Formgroup.controls.PackagingId.setValue(e.PackagingId);
            this.Formgroup.controls.UnitId.setValue(e.UnitId);
            this.Formgroup.controls.Weight.setValue(e.Weight);
            this.Formgroup.controls.GSM.setValue(e.GSM);
            this.Formgroup.controls.IsAvailable.setValue(e.IsAvailable);
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
      Article_No: this.Formgroup.value.Article_No,
      ColorId: this.Formgroup.value.ColorId,
      WidthId: this.Formgroup.value.WidthId,
      PackagingId: this.Formgroup.value.PackagingId,
      Weight: this.Formgroup.value.Weight,
      GSM: this.Formgroup.value.GSM,
      UnitId: this.Formgroup.value.UnitId,
      Created_At: formatted,
      Created_By: userId,
      IsAvailable: this.Formgroup.value.IsAvailable ? 1 : 0,
    };

    var tableName = 'tbl_item';

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
      Article_No: this.Formgroup.value.Article_No,
      ColorId: this.Formgroup.value.ColorId,
      WidthId: this.Formgroup.value.WidthId,
      PackagingId: this.Formgroup.value.PackagingId,
      Weight: this.Formgroup.value.Weight,
      GSM: this.Formgroup.value.GSM,
      UnitId: this.Formgroup.value.UnitId,
      Created_At: formatted,
      Created_By: userId,
      IsAvailable: this.Formgroup.value.IsAvailable ? 1 : 0,
    };

    let condition = { Item_ID: this.FinishedGoodsId };
    let tableName = 'tbl_item';

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
