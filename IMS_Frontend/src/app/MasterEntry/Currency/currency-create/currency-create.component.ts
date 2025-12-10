import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-currency-create',
  templateUrl: './currency-create.component.html',
  styleUrls: ['./currency-create.component.css'],
})
export class CurrencyCreateComponent {
  Formgroup!: FormGroup;
  isEdit = false;
  CurrencyId!: string;
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
    let has = this.activeLink.snapshot.queryParamMap.has('Currency_ID');
    if (has) {
      this.CurrencyId = this.activeLink.snapshot.queryParams['Currency_ID'];
      this.isEdit = true;
    } else {
      this.isEdit = false;
    }
  }

  ngOnInit() {
    var permissions = this.gs.CheckUserPermission('Add Currency');
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;

    if (!this.printPermissions) {
      window.location.href = 'dashboard';
    }
    this.title.setTitle('Create Currency');
    this.GenerateForm();

    if (this.isEdit) {
      this.GetCurrencyEditDataById();
    }
  }
  GenerateForm() {
    this.Formgroup = this.fb.group({
      ISOCode: [''],
      CurrencyName: ['', [Validators.required]],
      ExchangeRate: [''],
      IsAvailable: [false],
    });
  }
  GetCurrencyEditDataById() {

    var ProcedureData = {
      procedureName: '[usp_Currency_ById]',
      parameters: {
        CurrencyId: this.CurrencyId,
      },
    };
    this.masterEntyService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        console.log(results);

        if (results.status) {
          var tableData = JSON.parse(results.data).Tables1;
          tableData.forEach((e: any) => {
            this.Formgroup.controls.ISOCode.setValue(e.CurrencyCode);
            this.Formgroup.controls.CurrencyName.setValue(e.Name);
            this.Formgroup.controls.ExchangeRate.setValue(e.ExchangeRate);
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
    var currency = {
      CurrencyCode: this.Formgroup.value.ISOCode,
      Name: this.Formgroup.value.CurrencyName,
      ExchangeRate: this.Formgroup.value.ExchangeRate,
      IsAvailable: this.Formgroup.value.IsAvailable ? 1 : 0,
    };

    var tableName = 'tbl_currency';

    this.masterEntyService
      .SaveSingleData(currency, tableName)
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
    var currency = {
      CurrencyCode: this.Formgroup.value.ISOCode,
      Name: this.Formgroup.value.CurrencyName,
      ExchangeRate: this.Formgroup.value.ExchangeRate,
      IsAvailable: this.Formgroup.value.IsAvailable ? 1 : 0,
      Modified_At: formatted,
      Modified_By: userId,
    };

    let condition = { Currency_ID: this.CurrencyId };
    let tableName = 'tbl_currency';

    this.masterEntyService
      .UpdateData(currency, condition, tableName)
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
