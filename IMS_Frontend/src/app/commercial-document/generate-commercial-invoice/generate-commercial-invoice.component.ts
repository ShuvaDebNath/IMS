import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { CD } from 'src/app/models/CDModel';
import { LC } from 'src/app/models/LCModel';
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';
import { Roles } from 'src/app/models/roles.model';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-generate-commercial-invoice',
  templateUrl: './generate-commercial-invoice.component.html',
  styleUrls: ['./generate-commercial-invoice.component.css'],
})
export class GenerateCommercialInvoiceComponent {
  Formgroup!: FormGroup;
  isEdit = false;
  LCList: any;
  CIId!: string;
  companyId!: string;
  menu: any;
  MarketingConcern: any;
  BenificiaryAccounts: any;
  PaymentTerms: any;
  PINo: any;

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
    // this.gs.CheckToken().subscribe();
    let has = this.activeLink.snapshot.queryParamMap.has(
      'Commercial_Invoice_ID'
    );
    if (has) {
      this.CIId = this.activeLink.snapshot.queryParams['Commercial_Invoice_ID'];
      this.isEdit = true;
    } else {
      this.isEdit = false;
    }
  }

  ngOnInit() {
    var permissions = this.gs.CheckUserPermission(
      'Generate Commercial Invoice'
    );
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;

    if (!this.printPermissions) {
      window.location.href = 'all-commercial-invoice';
    }

    this.title.setTitle('Generate Commercial Invoice');
    this.GenerateFrom();
    this.getInitialData();

    if (this.isEdit) {
      this.GetCDById(this.CIId);
    }
  }

  GenerateFrom() {
    this.Formgroup = this.fb.group({
      LC_No: ['', [Validators.required]],
      ApplicantBank: ['', [Validators.required]],
      ExpNo: [''],
      ExpDate: [''],
      BeNo: [''],
      BeDate: [''],
      EpNo: [''],
      EpDate: [''],
      FreightCharge: ['', [Validators.required]],
      QtyRolls: ['', [Validators.required]],
      TotalGrossWeight: ['', [Validators.required]],
      TotalNetWeight: ['', [Validators.required]],
      SailiongOnOrAbout: [''],
      Remarks: [''],
    });
  }

  getInitialData() {
    var ProcedureData = {
      procedureName: '[usp_CD_GetInitialData]',
      parameters: {},
    };

    this.masterEntyService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        if (results.status) {
          this.BenificiaryAccounts = JSON.parse(results.data).Tables1;
          this.LCList = JSON.parse(results.data).Tables2;
        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
        }
      },
      error: (err) => {},
    });
  }
  saveData() {
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
    var cd = new CD();
    cd.LC_ID = this.Formgroup.value.LC_No;
    cd.ExpNo = this.Formgroup.value.ExpNo;
    if (
      this.Formgroup.value.ExpDate != undefined &&
      this.Formgroup.value.ExpDate != ''
    ) {
      cd.Export_Date = this.Formgroup.value.ExpDate;
    }
    if (
      this.Formgroup.value.BeDate != undefined &&
      this.Formgroup.value.BeDate != ''
    ) {
      cd.Be_No_Date = this.Formgroup.value.BeDate;
    }
    if (
      this.Formgroup.value.EpDate != undefined &&
      this.Formgroup.value.EpDate != ''
    ) {
      cd.EP_No_Date = this.Formgroup.value.EpDate;
    }
    if (
      this.Formgroup.value.SailiongOnOrAbout != undefined &&
      this.Formgroup.value.SailiongOnOrAbout != ''
    ) {
      cd.Sailing_On_Or_About = this.Formgroup.value.SailiongOnOrAbout;
    }
    cd.FreightCharge = this.Formgroup.value.FreightCharge;
    cd.Remarks = this.Formgroup.value.Remarks;
    cd.Applicant_Bank_ID = this.Formgroup.value.ApplicantBank;
    cd.Qty_Rolls = this.Formgroup.value.QtyRolls;
    cd.Total_Gross_Weight = this.Formgroup.value.TotalGrossWeight;
    cd.Total_Net_Weight = this.Formgroup.value.TotalNetWeight;
    cd.Be_No = this.Formgroup.value.BeNo;
    cd.EP_No = this.Formgroup.value.EpNo;
    cd.Commercial_Invoice_No = 'temp';
    cd.Date = formatted;
    cd.User_ID = userId == undefined ? '' : userId;

    var tableName = 'tbl_commercial_invoice';

    this.masterEntyService
      .SaveSingleData(cd, tableName)
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
              icon: 'error',
              timer: 5000,
            });
          }
        }
      });
  }

  GetCDById(LCID: any) {
    var ProcedureData = {
      procedureName: '[usp_CD_ById]',
      parameters: {
        Commercial_Invoice_ID: this.CIId,
      },
    };
    this.masterEntyService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        if (results.status) {
          var tableData = JSON.parse(results.data).Tables1;

          tableData.forEach((e: any) => {
            this.Formgroup.controls.LC_No.setValue(e.LC_ID);
            this.Formgroup.controls.ApplicantBank.setValue(e.Applicant_Bank_ID);
            this.Formgroup.controls.ExpNo.setValue(e.ExpNo);
            this.Formgroup.controls.ExpDate.setValue(e.Export_Date);
            this.Formgroup.controls.BeNo.setValue(e.Be_No);
            this.Formgroup.controls.BeDate.setValue(e.Be_No_Date);
            this.Formgroup.controls.EpNo.setValue(e.EP_No);
            this.Formgroup.controls.EpDate.setValue(new Date(e.EP_No_Date));
            this.Formgroup.controls.FreightCharge.setValue(e.FreightCharge);
            this.Formgroup.controls.QtyRolls.setValue(e.Qty_Rolls);
            this.Formgroup.controls.TotalGrossWeight.setValue(
              e.Total_Gross_Weight
            );
            this.Formgroup.controls.TotalNetWeight.setValue(e.Total_Net_Weight);
            this.Formgroup.controls.SailiongOnOrAbout.setValue(
              e.Sailing_On_Or_About
            );
            this.Formgroup.controls.Remarks.setValue(e.Remarks);
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

  updateData() {
    if (this.Formgroup.invalid) {
      swal.fire('Invaild Input', 'Please check inputs', 'error');
      return;
    }
    var fDate = new Date();
    const mm = String(fDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(fDate.getDate()).padStart(2, '0');
    const yyyy = fDate.getFullYear();

    const formatted = `${mm}/${dd}/${yyyy}`;

    var userId = window.localStorage.getItem('userId');
    var cd = new CD();
    cd.LC_ID = this.Formgroup.value.LC_No;
    cd.ExpNo = this.Formgroup.value.ExpNo;
    if (
      this.Formgroup.value.ExpDate != undefined &&
      this.Formgroup.value.ExpDate != ''
    ) {
      cd.Export_Date = this.Formgroup.value.ExpDate;
    }
    if (
      this.Formgroup.value.BeDate != undefined &&
      this.Formgroup.value.BeDate != ''
    ) {
      cd.Be_No_Date = this.Formgroup.value.BeDate;
    }
    if (
      this.Formgroup.value.EpDate != undefined &&
      this.Formgroup.value.EpDate != ''
    ) {
      cd.EP_No_Date = this.Formgroup.value.EpDate;
    }
    if (
      this.Formgroup.value.SailiongOnOrAbout != undefined &&
      this.Formgroup.value.SailiongOnOrAbout != ''
    ) {
      cd.Sailing_On_Or_About = this.Formgroup.value.SailiongOnOrAbout;
    }
    cd.FreightCharge = this.Formgroup.value.FreightCharge;
    cd.Remarks = this.Formgroup.value.Remarks;
    cd.Applicant_Bank_ID = this.Formgroup.value.ApplicantBank;
    cd.Qty_Rolls = this.Formgroup.value.QtyRolls;
    cd.Total_Gross_Weight = this.Formgroup.value.TotalGrossWeight;
    cd.Total_Net_Weight = this.Formgroup.value.TotalNetWeight;
    cd.Be_No = this.Formgroup.value.BeNo;
    cd.EP_No = this.Formgroup.value.EpNo;
    cd.Commercial_Invoice_No = 'temp';
    cd.Date = formatted;
    cd.User_ID = userId == undefined ? '' : userId;

    var tableName = 'tbl_commercial_invoice';


    let queryParams = cd;
    let condition = {
      Commercial_Invoice_ID: this.CIId,
    };

    this.masterEntyService
      .UpdateData(queryParams, condition, tableName)
      .subscribe((res: any) => {
        if (res.status) {
          swal
            .fire({
              title: `${res.message}!`,
              text: `Update Successfully!`,
              icon: 'success',
              timer: 5000,
            })
            .then((result) => {
              this.ngOnInit();
            });
        } else {
          if (res.message == 'Invalid Token') {
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
  }
}
